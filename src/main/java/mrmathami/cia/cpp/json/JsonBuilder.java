package mrmathami.cia.cpp.json;

import com.fit.cia.core.treemodel.json.constant.JsonKind;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaClassNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaFieldNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaMethodNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.treemodel.json.dom.JsonProjectNode;
import mrmathami.cia.cpp.ast.DependencyType;
import mrmathami.cia.cpp.ast.ClassNode;
import mrmathami.cia.cpp.ast.EnumNode;
import mrmathami.cia.cpp.ast.FunctionNode;
import mrmathami.cia.cpp.ast.ITypeContainer;
import mrmathami.cia.cpp.ast.IntegralNode;
import mrmathami.cia.cpp.ast.NamespaceNode;
import mrmathami.cia.cpp.ast.CppNode;
import mrmathami.cia.cpp.ast.RootNode;
import mrmathami.cia.cpp.ast.TypedefNode;
import mrmathami.cia.cpp.ast.VariableNode;
import mrmathami.cia.cpp.builder.ProjectVersion;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class JsonBuilder {
	private final Map<DependencyType, Double> typeWeightMap;
	private final Map<CppNode, Double> weightMap;

	private final List<JsonDependencyNode> dependencyList = new ArrayList<>();

	private JsonBuilder(ProjectVersion version) {
		this.typeWeightMap = version.getDependencyTypeWeightMap();
		this.weightMap = version.getWeightMap();
	}

	static JsonNode makeJsonNode(CppNode node) {
		if (node instanceof RootNode) {
			final JsonProjectNode jsonProjectNode = new JsonProjectNode();
			jsonProjectNode.setKind(JsonKind.CLASS);
			return jsonProjectNode;
		} else if (node instanceof NamespaceNode) {
			final JsonJavaClassNode jsonJavaClassNode = new JsonJavaClassNode();
			jsonJavaClassNode.setKind(JsonKind.CLASS);
			jsonJavaClassNode.setNumOfMethod(((NamespaceNode) node).getFunctions().size());
			jsonJavaClassNode.setNumOfVariable(((NamespaceNode) node).getVariables().size());
			return jsonJavaClassNode;
		} else if (node instanceof ClassNode) {
			final JsonJavaClassNode jsonJavaClassNode = new JsonJavaClassNode();
			jsonJavaClassNode.setKind(JsonKind.CLASS);
			jsonJavaClassNode.setNumOfMethod(((ClassNode) node).getFunctions().size());
			jsonJavaClassNode.setNumOfVariable(((ClassNode) node).getVariables().size());
			return jsonJavaClassNode;
		} else if (node instanceof EnumNode) {
			final JsonJavaClassNode jsonJavaClassNode = new JsonJavaClassNode();
			jsonJavaClassNode.setKind(JsonKind.CLASS);
			jsonJavaClassNode.setNumOfVariable(((EnumNode) node).getVariables().size());
			return jsonJavaClassNode;
		} else if (node instanceof FunctionNode) {
			final JsonJavaMethodNode jsonJavaMethodNode = new JsonJavaMethodNode();
			jsonJavaMethodNode.setKind(JsonKind.METHOD);
			final CppNode type = ((FunctionNode) node).getType();
			jsonJavaMethodNode.setReturnType(type != null ? type.getName() : null);
			return jsonJavaMethodNode;
		} else if (node instanceof VariableNode || node instanceof TypedefNode) {
			final JsonJavaFieldNode jsonJavaFieldNode = new JsonJavaFieldNode();
			jsonJavaFieldNode.setKind(JsonKind.ATTRIBUTE);
			final CppNode type = ((ITypeContainer) node).getType();
			jsonJavaFieldNode.setType(type != null ? type.getName() : null);
			return jsonJavaFieldNode;
		} else if (node instanceof IntegralNode) {
			return null;
//			final JsonUnknownNode jsonUnknownNode = new JsonUnknownNode();
//			jsonUnknownNode.setKind("IntegralNode");
//			return jsonUnknownNode;
		}
		throw new RuntimeException("Unknown jsonNode!");
	}

	public static JsonWrapper build(ProjectVersion version) {
		final JsonBuilder jsonBuilder = new JsonBuilder(version);
		final JsonNode jsonNode = jsonBuilder.buildJsonTree(version.getRootNode());
		return new JsonWrapper(jsonNode, jsonBuilder.dependencyList);
	}

	private JsonNode buildJsonTree(CppNode node) {
		final JsonNode jsonNode = makeJsonNode(node);
		if (jsonNode == null) return null;

		jsonNode.setId(node.getId());
		jsonNode.setName(node.getUniqueName());
		jsonNode.setWeight(weightMap.get(node).floatValue());

		jsonNode.setHasChildren(false);
		for (final CppNode child : node.getChildren()) {
			final JsonNode jsonChild = buildJsonTree(child);
			if (jsonChild != null) {
				jsonChild.setParent(jsonNode);
				jsonNode.addChild(jsonChild);
				jsonNode.setHasChildren(true);
			}
		}

		final Set<CppNode> dependencyTo = node.getAllDependencyTo();
		jsonNode.setHasDependency(!dependencyTo.isEmpty());

		final JsonDependencyNode jsonDependency = new JsonDependencyNode();
		jsonDependency.setCallerId(node.getId());

		for (final CppNode dependencyNode : dependencyTo) {
			for (final Map.Entry<DependencyType, Integer> entry : node.getNodeDependencyTo(dependencyNode).entrySet()) {
				final int count = entry.getValue();
				if (count == 0) continue;

				final DependencyType dependencyType = entry.getKey();
				final DependencyMapping mapping = new DependencyMapping();
				mapping.setCalleeId(dependencyNode.getId());
				mapping.setTypeDependency(dependencyType.toString());
				mapping.setCount(count);
				mapping.setWeight(typeWeightMap.get(dependencyType).floatValue());
				jsonDependency.addMapping(mapping);
			}
		}

		dependencyList.add(jsonDependency);

		return jsonNode;
	}
}
