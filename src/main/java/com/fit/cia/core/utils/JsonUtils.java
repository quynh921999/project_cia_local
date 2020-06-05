package com.fit.cia.core.utils;

import com.fit.cia.core.treemodel.json.constant.JsonKind;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.rits.cloning.Cloner;

import java.util.ArrayList;
import java.util.List;

public class JsonUtils {
	private static final Cloner cloner = new Cloner();

	public static void refineFolderHierarchy(JsonNode rootNode) {
		if (rootNode == null) return;

		List<JsonNode> clonedChildren = new ArrayList<>();

		for (JsonNode childNode : rootNode.getChildren()) {
			JsonNode clonedNode = cloner.shallowClone(childNode);
			clonedChildren.add(clonedNode);

			List<JsonNode> children = clonedNode.getChildren();
			if (children.size() > 1) {
				clonedNode.setChildren(new ArrayList<>());
			} else if (children.size() == 1) {
				JsonNode child = children.get(0);
				if (child != null && !JsonKind.DIRECTORY.equals(child.getKind())
						&& !JsonKind.LIBRARY_IMPORT.equals(child.getKind())) {

					clonedNode.setChildren(new ArrayList<>());
				}
				refineFolderHierarchy(clonedNode);
			}
		}
		rootNode.setChildren(clonedChildren);
	}

	public static void validateChildrenInNode(JsonNode rootNode) {
		if (rootNode == null) return;

		List<JsonNode> children = rootNode.getChildren();
		if (children.size() == 0) rootNode.setHasChildren(false);
		else
			for (JsonNode child : children)
				validateChildrenInNode(child);
	}

	public static void setSearchedFlags(JsonNode node) {
		if (node == null) return;

		node.setMatched(true);
		JsonNode parent = node.getParent();
		if (parent != null && !parent.isMatched()) setSearchedFlags(parent);
	}

	public static void removeRedundantNodes(JsonNode rootNode) {
		if (rootNode == null) return;

		if (!rootNode.isMatched()) {
			List<JsonNode> resultList = new ArrayList<>();
			JsonNode parent = rootNode.getParent();

			for (JsonNode child : parent.getChildren()) {
				if (!child.equals(rootNode)) resultList.add(child);
			}
			parent.setChildren(resultList);
		} else {
			for (JsonNode child : rootNode.getChildren()) removeRedundantNodes(child);
		}
	}
}
