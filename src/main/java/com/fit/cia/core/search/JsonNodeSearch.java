package com.fit.cia.core.search;

import com.fit.cia.core.treemodel.json.dom.JsonJavaClassNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.List;

public class JsonNodeSearch {
	private static final Logger logger = LogManager.getLogger(JsonNodeSearch.class);

	public static JsonNode searchById(JsonNode rootNode, int nodeId) {
		if (rootNode == null || rootNode.getId() == nodeId) {
			return rootNode;
		}
		for (int i = rootNode.getChildren().size() - 1; i >= 0; i--) {
			JsonNode child = rootNode.getChildren().get(i);
			JsonNode res = searchById(child, nodeId);
			if (res != null) return res;
		}

		return null;
	}

	public static List<JsonNode> searchFileNodeByName(JsonNode rootNode, String name) {
		List<JsonNode> result = new ArrayList<>();

		if (rootNode == null)
			return result;

		String rootName = rootNode.getName();

		// TODO: fix this case
		if (rootName == null) {
			logger.debug(rootNode);
		}

		if (rootName != null && rootName.contains(name)
				&& !(rootNode instanceof JsonJavaClassNode)) {
			result.add(rootNode);
		}

		if (!(rootNode instanceof JsonJavaClassNode)) {
			for (JsonNode child : rootNode.getChildren()) {
				result.addAll(searchFileNodeByName(child, name));
			}
		}

		return result;
	}
}
