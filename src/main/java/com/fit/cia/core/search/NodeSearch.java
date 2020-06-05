package com.fit.cia.core.search;

import com.fit.cia.core.treemodel.Node;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

/**
 * TODO: improve search engine
 */
public class NodeSearch {
	public static List<Node> searchNode(Node node, Predicate<Node> condition) {
		List<Node> listNode = new ArrayList<>();
		if (node != null && node.getChildren() != null)
			for (Node child : node.getChildren()) {
				if (condition.test(child))
					listNode.add(child);

				listNode.addAll(searchNode(child, condition));
			}
		return listNode;
	}

	public static Node searchById(Node rootNode, int nodeId) {
		if (rootNode != null) {
			if (rootNode.getId() == nodeId) return rootNode;
			for (Node child : rootNode.getChildren()) {
				final Node res = searchById(child, nodeId);
				if (res != null) return res;
			}
		}
		return null;
	}
}
