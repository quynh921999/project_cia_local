package com.fit.cia.core.analyzer;

import com.fit.cia.core.dependency.MemberDependency;
import com.fit.cia.core.search.NodeSearch;
import com.fit.cia.core.treemodel.CiaData;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.utils.LogLevel;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;
import java.util.Map;

public class JavaCoreAnalyzer {
	private static final Logger logger = LogManager.getLogger(JavaCoreAnalyzer.class);

	public void analyzeDependencies(Node rootNode) {
		logger.log(LogLevel.CLIENT, "Start Analyzing Java Core...");

		List<Node> javaNodes = NodeSearch.searchNode(rootNode, node -> node instanceof FileNode);

		for (Node javaFileNode : javaNodes) {
			try {
				for (Node childNode : javaFileNode.getChildren()) {
					if (childNode instanceof JavaClassNode) {
						generateDependencies((JavaClassNode) childNode);
					}
				}
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		}

		logger.log(LogLevel.CLIENT, "Done Analyzing Java Core!");
	}

	private void generateDependencies(JavaClassNode javaClassNode) {
		final Map<String, Node> jdtKeyNodeIdMap = (Map<String, Node>) CiaData.getInstance().getData(CiaData.KEY_NODE_ID);

		// Discover extend, implement dependencies
		JavaImplementExtendGeneration.buildDependency(javaClassNode, jdtKeyNodeIdMap);
		// Discover method call method, method use field dependencies
		JavaCoreDependencyGeneration.buildDependency(javaClassNode, jdtKeyNodeIdMap);

		for (Node childNode : javaClassNode.getChildren()) {
			// generate member dependency
			new MemberDependency(javaClassNode, childNode);

			if (childNode instanceof JavaClassNode) {
				generateDependencies((JavaClassNode) childNode);
			}
		}
	}
}
