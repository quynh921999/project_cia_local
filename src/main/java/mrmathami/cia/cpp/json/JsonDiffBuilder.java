package mrmathami.cia.cpp.json;

import com.fit.cia.core.treemodel.json.constant.JsonChange;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import mrmathami.cia.cpp.ast.DependencyType;
import mrmathami.cia.cpp.ast.CppNode;
import mrmathami.cia.cpp.ast.RootNode;
import mrmathami.cia.cpp.differ.VersionDifference;
import mrmathami.util.Pair;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

public final class JsonDiffBuilder {
	private final RootNode rootNew;
	private final Set<CppNode> addedNodes;
	private final Set<CppNode> removedNodes;
	private final Map<DependencyType, Double> typeImpactWeightMap;
	private final Map<CppNode, Double> impactWeightMap;

	private final Map<CppNode, CppNode> nodeMap = new HashMap<>();
	private final Set<CppNode> changedNodesNew = new HashSet<>();
	private final List<JsonDependencyNode> dependencyList = new ArrayList<>();

	private final Map<Integer, JsonNode> jsonNodeMap = new HashMap<>();

	public JsonDiffBuilder(VersionDifference difference) {
		this.rootNew = difference.getVersionB().getRootNode();
		this.addedNodes = difference.getAddedNodes();
		this.removedNodes = difference.getRemovedNodes();
		this.typeImpactWeightMap = difference.getDependencyTypeImpactWeightMap();
		this.impactWeightMap = difference.getImpactWeightMap();

		for (final Pair<CppNode, CppNode> pair : difference.getChangedNodes()) {
			nodeMap.put(pair.getA(), pair.getB());
			changedNodesNew.add(pair.getB());
		}
		for (final Pair<CppNode, CppNode> pair : difference.getUnchangedNodes()) {
			nodeMap.put(pair.getA(), pair.getB());
		}
	}

	public static JsonWrapper build(VersionDifference difference) {
		final JsonDiffBuilder jsonDiffBuilder = new JsonDiffBuilder(difference);
		final JsonNode jsonNode = jsonDiffBuilder.buildJsonTree();
		return new JsonWrapper(jsonNode, jsonDiffBuilder.dependencyList);
	}

	private JsonNode buildJsonTree() {
		final JsonNode rootNode = buildJsonNode(rootNew);
		for (final CppNode removedNode : removedNodes) {
			final JsonNode removedJsonNode = JsonBuilder.makeJsonNode(removedNode);
			if (removedJsonNode != null) {
				removedJsonNode.setId(removedNode.getId() * -1);
				removedJsonNode.setName(Objects.requireNonNullElse(removedNode.getName(), removedNode.getUniqueName()));
				removedJsonNode.setChange(JsonChange.REMOVED);

				final CppNode parent = removedNode.getParent();
				if (parent != null) {
					final JsonDependencyNode jsonDependency = new JsonDependencyNode();
					jsonDependency.setCallerId(removedJsonNode.getId());

					final DependencyMapping mapping = new DependencyMapping();
					if (removedNodes.contains(parent)) {
						mapping.setCalleeId(parent.getId() * -1);

						final JsonNode parentJsonNode = jsonNodeMap.get(parent.getId() * -1);
						if (parentJsonNode != null) {
							removedJsonNode.setParent(parentJsonNode);
							parentJsonNode.addChild(removedJsonNode);
							parentJsonNode.setHasChildren(true);
						}
					} else {
						final CppNode newParent = nodeMap.get(parent);
						if (newParent != null) {
							mapping.setCalleeId(newParent.getId());
							final JsonNode parentJsonNode = jsonNodeMap.get(newParent.getId());
							if (parentJsonNode != null) {
								removedJsonNode.setParent(parentJsonNode);
								parentJsonNode.addChild(removedJsonNode);
								parentJsonNode.setHasChildren(true);
							}
						}
					}
					mapping.setTypeDependency("REMOVED");
					mapping.setWeight(0.0f);

					jsonDependency.addMapping(mapping);
					dependencyList.add(jsonDependency);
				}

				jsonNodeMap.put(removedJsonNode.getId(), removedJsonNode);
			}
		}
		return rootNode;
	}

	private JsonNode buildJsonNode(CppNode newNode) {
		final JsonNode jsonNode = JsonBuilder.makeJsonNode(newNode);
		if (jsonNode == null) return null;

		jsonNode.setId(newNode.getId());
		jsonNode.setName(newNode.getUniqueName());
		jsonNode.setWeight(impactWeightMap.get(newNode).floatValue());

		jsonNode.setHasChildren(false);
		for (final CppNode child : newNode.getChildren()) {
			final JsonNode jsonChild = buildJsonNode(child);
			if (jsonChild != null) {
				jsonChild.setParent(jsonNode);
				jsonNode.addChild(jsonChild);
				jsonNode.setHasChildren(true);
			}
		}

		if (addedNodes.contains(newNode)) {
			jsonNode.setChange(JsonChange.ADDED);
		} else if (changedNodesNew.contains(newNode)) {
			jsonNode.setChange(JsonChange.CHANGED);
		} else/* if (unchangedNodesNew.contains(newNode)) */ {
			jsonNode.setChange(JsonChange.UNCHANGED);
		}

		final Set<CppNode> dependencyTo = newNode.getAllDependencyTo();
		jsonNode.setHasDependency(!dependencyTo.isEmpty());

		if (!dependencyTo.isEmpty()) {
			final JsonDependencyNode jsonDependency = new JsonDependencyNode();
			jsonDependency.setCallerId(newNode.getId());

			for (final CppNode dependencyNode : dependencyTo) {
				for (final Map.Entry<DependencyType, Integer> entry : newNode.getNodeDependencyTo(dependencyNode).entrySet()) {
					final int count = entry.getValue();
					if (count == 0) continue;

					final DependencyType dependencyType = entry.getKey();
					final DependencyMapping mapping = new DependencyMapping();
					mapping.setCalleeId(dependencyNode.getId());
					mapping.setTypeDependency(dependencyType.toString());
					mapping.setCount(count);
					mapping.setWeight(typeImpactWeightMap.get(dependencyType).floatValue());
					jsonDependency.addMapping(mapping);
				}
			}

			dependencyList.add(jsonDependency);
		}

		jsonNodeMap.put(jsonNode.getId(), jsonNode);
		return jsonNode;
	}
}
