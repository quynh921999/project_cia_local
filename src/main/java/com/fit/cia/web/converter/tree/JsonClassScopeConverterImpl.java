package com.fit.cia.web.converter.tree;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.treemodel.DirectoryNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.ProjectNode;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonDirectoryNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaClassNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaElementNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaFileNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.treemodel.json.dom.JsonProjectNode;
import com.fit.cia.core.utils.NodeHelper;
import com.fit.cia.web.converter.JsonConverterImpl;

import java.util.List;

public class JsonClassScopeConverterImpl extends JsonConverterImpl {

	public JsonNode traverse(Node rootNode) {
		if (rootNode == null) return null;
		JsonNode jsonNode = null;

		if (rootNode instanceof ProjectNode) {
			jsonNode = new JsonProjectNode();
		} else if (rootNode instanceof DirectoryNode) {
			if (checkSourceDirectory(rootNode)) {
				jsonNode = new JsonDirectoryNode();
			} else return null;
		} else if (rootNode instanceof com.fit.cia.core.treemodel.FileNode) {
			jsonNode = new JsonJavaFileNode();
		} else if (rootNode instanceof JavaClassNode) {
			JsonJavaClassNode jsonClassNode = new JsonJavaClassNode();
			JavaClassNode javaClassNode = (JavaClassNode) rootNode;
			jsonClassNode.setNumOfMethod(javaClassNode.getNumOfMethod());
			jsonClassNode.setNumOfVariable(javaClassNode.getNumOfVariable());

//			// set start & end positions for json java node
//			JsonJavaElementNode.NodePosition startPos = new JsonJavaElementNode.NodePosition(
//					javaClassNode.getStartPosition().getLineNumber(),
//					javaClassNode.getStartPosition().getColumnNumber());
//			JsonJavaElementNode.NodePosition endPos = new JsonJavaElementNode.NodePosition(
//					javaClassNode.getEndPosition().getLineNumber(),
//					javaClassNode.getEndPosition().getColumnNumber());
//
//			jsonClassNode.setStartPosition(startPos);
//			jsonClassNode.setEndPosition(endPos);

			// assignment
			jsonNode = jsonClassNode;
		}

		return jsonNode;
	}

	protected JsonDependencyNode generateJsonDependencyNode(Node node) {
		JsonDependencyNode jsonDependencyNode = new JsonDependencyNode();
		Node realTreeNode = NodeHelper.getClassAndTableScopeNode(node);
		jsonDependencyNode.setCallerId(realTreeNode.getId());

		// collect all positive dependency in file or table scope node
		List<Dependency> fileDependencies = NodeHelper.collectOriginalScopeDependencies(realTreeNode);

		for (Dependency dependency : fileDependencies) {
			Node caller = dependency.getFromNode();
			Node callee = dependency.getToNode();
			if (caller != null && callee != null) {
				Node callerFileNode = NodeHelper.getClassAndTableScopeNode(caller);
				Node calleeFileNode = NodeHelper.getClassAndTableScopeNode(callee);

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
