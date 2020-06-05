package com.fit.cia.web.converter.tree;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.treemodel.DirectoryNode;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.ProjectNode;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonDirectoryNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaFileNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.treemodel.json.dom.JsonProjectNode;
import com.fit.cia.core.utils.NodeHelper;
import com.fit.cia.web.converter.JsonConverterImpl;

import java.util.List;

public class JsonFileScopeConverterImpl extends JsonConverterImpl {
	public JsonNode traverse(Node rootNode) {
		if (rootNode == null) return null;
		JsonNode jsonNode = null;

		if (rootNode instanceof ProjectNode) {
			jsonNode = new JsonProjectNode();
		} else if (rootNode instanceof DirectoryNode) {
			if (checkSourceDirectory(rootNode)) {
				jsonNode = new JsonDirectoryNode();
			} else return null;
		} else if (rootNode instanceof FileNode) {
			jsonNode = new JsonJavaFileNode();
		} else {
			return null;
		}

		jsonNode.setName(rootNode.getName());
		jsonNode.setId(rootNode.getId());
		jsonNode.setHasDependency(rootNode.getDependencies().size() > 0);

		for (Node childNode : rootNode.getChildren()) {
			JsonNode jsonChildNode = traverse(childNode);
			if (jsonChildNode != null) {
				jsonNode.addChild(jsonChildNode);
				jsonChildNode.setParent(jsonNode);
				jsonNode.setHasChildren(true);
			}
		}

		// dependencies always are in files/tables or below scopes. not in packages, folders,...
		if (jsonNode instanceof JsonJavaFileNode /*|| jsonNode instanceof JsonDatabaseTableNode*/) {
			JsonDependencyNode jsonDependencyNode = generateJsonDependencyNode(rootNode);
			if (jsonDependencyNode != null) {
				jsonDependencyNodes.add(jsonDependencyNode);
			}
		}

		return jsonNode;
	}

	protected JsonDependencyNode generateJsonDependencyNode(Node node) {
		JsonDependencyNode jsonDependencyNode = new JsonDependencyNode();
		jsonDependencyNode.setCallerId(node.getId());

		// collect all positive dependency in file or table scope node
		List<Dependency> fileDependencies = NodeHelper.collectOriginalScopeDependencies(node);

		for (Dependency dependency : fileDependencies) {
			Node caller = dependency.getFromNode();
			Node callee = dependency.getToNode();
			if (caller != null && callee != null) {
				Node callerFileNode = NodeHelper.getFileAndTableScopedNode(caller);
				Node calleeFileNode = NodeHelper.getFileAndTableScopedNode(callee);

				if (callerFileNode != null && calleeFileNode != null && !callerFileNode.equals(calleeFileNode)) {
					DependencyMapping mapping = new DependencyMapping();
					mapping.setCalleeId(calleeFileNode.getId());
					mapping.setTypeDependency(dependency.getClass().getSimpleName());

					if (!jsonDependencyNode.getDependencyMappingList().contains(mapping)) {
						jsonDependencyNode.addMapping(mapping);
					}
				}
			}
		}
		return jsonDependencyNode.getDependencyMappingList().size() != 0 ? jsonDependencyNode : null;
	}

}