package com.fit.cia.core.diff;

import com.fit.cia.core.dependency.DependencyType;
import com.fit.cia.core.search.NodeSearch;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.utils.LogLevel;
import mrmathami.util.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

/**
 * Created by BQC-PC on 7/18/2017.
 */
public class DifferenceAPI {
	private static final Logger logger = LogManager.getLogger(DifferenceAPI.class);

	private static final Map<DependencyType, Double> weightMap = Map.of(
			DependencyType.METHOD_INVOCATION, 0.3034,
			DependencyType.FIELD_ACCESSION, 0.3563,
			DependencyType.EXTENSION, 0.3034,
			DependencyType.IMPLEMENTATION, 0.4668,
			DependencyType.MEMBER, 0.3034
	);

	private static void recursiveCalculate(double[] weights, BitSet pathSet, Node currentNode, double currentWeight) {
		for (final Node nextNode : currentNode.getAllDependencyFrom()) {
			final int nextId = nextNode.getId();
			if (!pathSet.get(nextId)) {
				pathSet.set(nextId);

				double linkWeight = 1.0;
				for (final Map.Entry<DependencyType, Integer> entry : currentNode.getNodeDependencyFrom(nextNode).entrySet()) {
					linkWeight *= Math.pow(1.0 - weightMap.getOrDefault(entry.getKey(), 0.0), entry.getValue());
				}

				final double nextWeight = currentWeight * (1.0 - linkWeight);
				weights[nextId] *= 1.0 - nextWeight;
				recursiveCalculate(weights, pathSet, nextNode, nextWeight);

				pathSet.clear(nextId);
			}
		}
	}

	private static void calcImpact(Node newRootNode, List<Node> changedNodes) {
		final int nodeCount = newRootNode.getMaxId();

		final List<double[]> eachChangeWeights = new ArrayList<>(changedNodes.size());
		for (Node changedNode : changedNodes) {
			final double[] weights = new double[nodeCount];
			final BitSet pathSet = new BitSet(nodeCount);

			Arrays.fill(weights, 1.0f);

			final int changedId = changedNode.getId();
			weights[changedId] = 0.0;
			pathSet.set(changedId);

			recursiveCalculate(weights, pathSet, changedNode, 1.0);

//			for (int i = 0; i < nodeCount; i++) weights[i] = 1.0f - weights[i]; // NOTE: change me both!!

			eachChangeWeights.add(weights);
		}

		final double[] weights = new double[nodeCount];
		Arrays.fill(weights, 1.0f);

		for (final double[] singleWeights : eachChangeWeights) {
//				for (int i = 0; i < nodeCount; i++) weights[i] *= 1.0f - singleWeights[i]; // NOTE: change me both!!
			for (int i = 0; i < nodeCount; i++) weights[i] *= singleWeights[i];
		}

		for (int i = 1; i < nodeCount; i++) {
			final Node node = NodeSearch.searchById(newRootNode, i);
			if (node != null) {
				node.setWeight((float) (1.0 - weights[i]));
			}
		}
	}

	public static CompareTwoTreeResult diff(Node originalRootNode, Node newRootNode) {
		logger.log(LogLevel.CLIENT, "Collecting different files between two versions...");
		DifferentObjectBuilder builder = new DifferentObjectBuilder();
		builder.setRoot(originalRootNode);
		CompareTwoTreeResult compareTwoTreeResult = builder.build(newRootNode);
		logger.log(LogLevel.CLIENT, "Done collecting different files between two versions!");

		for (Pair<Node, Node> changedNode : compareTwoTreeResult.getChangedNodes()) {
			logger.log(LogLevel.CLIENT, String.format("DETECT  CHANGE[%s]...", changedNode.getB().getRelativePath()));
		}

		for (Node addedNode : compareTwoTreeResult.getAddedNodes()) {
			logger.log(LogLevel.CLIENT, String.format("DETECT  ADDED[%s]...", addedNode.getRelativePath()));
		}

		for (Node removedNode : compareTwoTreeResult.getRemovedNodes()) {
			logger.log(LogLevel.CLIENT, String.format("DETECT  REMOVED[%s]...", removedNode.getRelativePath()));
		}

		final List<Node> changedNodes = new ArrayList<>(compareTwoTreeResult.getAddedNodes());
		for (Pair<Node, Node> changedNode : compareTwoTreeResult.getChangedNodes()) {
			changedNodes.add(changedNode.getB());
		}

		calcImpact(newRootNode, changedNodes);

		return compareTwoTreeResult;
	}
}
