package com.fit.cia.web.converter;

import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;

import java.util.List;

public interface IJsonConverter {
	int dependencyCount();

	void convert(Node projectNode);

	JsonNode getJsonNode();

	List<JsonDependencyNode> getJsonDependencyNodes();

	void trackIncludeIds(JsonNode rootNode);
}
