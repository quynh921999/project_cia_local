package com.fit.cia.core.diff;

import com.fit.cia.core.diff.comparator.ClassComparator;
import com.fit.cia.core.diff.comparator.FieldComparator;
import com.fit.cia.core.diff.comparator.MethodComparator;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.java.JavaFieldNode;
import com.fit.cia.core.treemodel.java.JavaMethodNode;
import mrmathami.util.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by locdt on 7/16/2017.
 */
public class DifferentObjectBuilder {

	private static final Logger logger = LogManager.getLogger(DifferentObjectBuilder.class);

	private Node root;
	private String rootPath;

	public CompareTwoTreeResult build(Node newRoot) {
		Set<Node> addedNodes = new HashSet<>();
		Set<Pair<Node, Node>> changedNodes = new HashSet<>();
		Set<Pair<Node, Node>> unchangedNodes = new HashSet<>();
		Set<Node> removedNodes = new HashSet<>();
		unchangedNodes.add(Pair.immutableOf(this.root, newRoot));

		Map<String, Node> hashMap = new HashMap<>();
		List<Node> originNodes = root.getAllChildren();
		for (Node node : originNodes) {
			hashMap.put(node.getRelativePath(), node);
		}


		List<Node> newNodes = newRoot.getAllChildren();
		for (Node node : newNodes) {
			Node updatedNode = hashMap.put(node.getRelativePath(), node);
			if (updatedNode != null) {
				if (updatedNode instanceof JavaFieldNode && node instanceof JavaFieldNode) {
					FieldComparator fieldComparator = new FieldComparator();
					boolean different = fieldComparator.isDifferent(updatedNode, node);
					if (!different) {
						unchangedNodes.add(Pair.immutableOf(updatedNode, node));
					} else {
						changedNodes.add(Pair.immutableOf(updatedNode, node));
					}
				} else if (updatedNode instanceof JavaMethodNode && node instanceof JavaMethodNode) {
					MethodComparator methodComparator = new MethodComparator();
					boolean different = methodComparator.isDifferent(updatedNode, node);
					if (!different) {
						unchangedNodes.add(Pair.immutableOf(updatedNode, node));
					} else {
						changedNodes.add(Pair.immutableOf(updatedNode, node));
					}
				} else if (updatedNode instanceof JavaClassNode && node instanceof JavaClassNode) {
					ClassComparator classComparator = new ClassComparator();
					boolean different = classComparator.isDifferent(updatedNode, node);
					if (!different) {
						unchangedNodes.add(Pair.immutableOf(updatedNode, node));
					} else {
						changedNodes.add(Pair.immutableOf(updatedNode, node));
					}
				} else if (updatedNode instanceof FileNode && node instanceof FileNode) {
					if (updatedNode.getName().equals(node.getName())) {
						unchangedNodes.add(Pair.immutableOf(updatedNode, node));
					}
					logger.debug("DETECT baseNode and changeNode have same JavaFileNode type ==> IGNORE!");
				} else if (updatedNode.getClass().equals(node.getClass())) {
					if (updatedNode.getName().equals(node.getName())) {
						unchangedNodes.add(Pair.immutableOf(updatedNode, node));
					}
					logger.debug("DETECT baseNode and changeNode have same JavaFileNode type ==> IGNORE!");
				} else {
					logger.debug("baseNode and changedNode does not have same type such: JavaFieldNode, JavaMethodNode, JavaClassNode");
				}
			} else {
				addedNodes.add(node);
			}
		}

		for (Map.Entry<String, Node> entry : hashMap.entrySet()) {
			Node value = entry.getValue();
			Node rootNode = value.getRootNode();
			if (rootNode == root) {
				removedNodes.add(value);
			}
		}

		return new CompareTwoTreeResult(addedNodes, changedNodes, unchangedNodes, removedNodes);
	}

	public Node getRoot() {
		return root;
	}

	public void setRoot(Node root) {
		this.root = root;
	}

	public String getRootPath() {
		return rootPath;
	}

	public void setRootPath(String rootPath) {
		this.rootPath = rootPath;
	}
}