package com.fit.cia.core;

import com.fit.cia.core.analyzer.JavaCoreAnalyzer;
import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.dependency.ExtensionDependency;
import com.fit.cia.core.dependency.FieldAccessDependency;
import com.fit.cia.core.dependency.ImplementationDependency;
import com.fit.cia.core.dependency.MemberDependency;
import com.fit.cia.core.dependency.MethodInvocationDependency;
import com.fit.cia.core.parser.Loader;
import com.fit.cia.core.treemodel.CiaData;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.utils.FileHelper;
import com.fit.cia.core.utils.NodeHelper;
import com.fit.cia.utils.CiaException;
import com.fit.cia.utils.LogLevel;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

public class CallMeCore {
	public static final String DEFAULT_JAVA_SOURCE_FOLDER = "src/main/java";
	public static final String[] DEFAULT_IGNORED_COMPONENTS = new String[]{
			"*.css", "*.js", "dist/", "nbproject/"
	};

	private static final Logger logger = LogManager.getLogger(CallMeCore.class);

	public static void analyzeDependencies(Node projectNode, boolean bothTwoDirection) {
		try {
			new JavaCoreAnalyzer().analyzeDependencies(projectNode);
			calculateDirectWeight(projectNode, bothTwoDirection);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void calculateDirectWeight(Node projectNode, boolean bothTwoDirection) {
		List<Dependency> dependencies = NodeHelper.collectOriginalScopeDependencies(projectNode);
		if (bothTwoDirection) {
			for (Dependency dependency : dependencies) {
				float score = getWeightScore(dependency);
				dependency.getFromNode().addWeight(score);
				dependency.getToNode().addWeight(score);
				dependency.setWeight(score);
			}
		} else {
			for (Dependency dependency : dependencies) {
				float score = getWeightScore(dependency);
				dependency.getFromNode().addWeight(score);
				dependency.getToNode().addWeight(score);
				dependency.setWeight(score);
			}
		}
	}

	private static float getWeightScore(Dependency d) {
		if (d instanceof MethodInvocationDependency) {
			return 1.0f;
		} else if (d instanceof FieldAccessDependency) {
			return 1.0f;
		} else if (d instanceof ExtensionDependency) {
			return 4.0f;
		} else if (d instanceof ImplementationDependency) {
			return 4.0f;
		} else if (d instanceof MemberDependency) {
			return 1.0f;
		}

		return 0.0f;
//        return 1.0f;
	}

	public static Node buildTree(String projectPath, String javaSourceFolder) throws CiaException {
		Node root = null;
		try {
			logger.log(LogLevel.CLIENT, "Building tree...");

			// remove ended separator
			if (projectPath.endsWith("/") || projectPath.endsWith("\\")) {
				projectPath = projectPath.substring(0, projectPath.length() - 1);
			}

			//****************************
			// Store data
			//****************************
			// create set for store all the visited package
			CiaData.getInstance().putData(CiaData.PACKAGE_NAME_SET, new HashSet<>());
			// create map for jdt binding and cia node id
			CiaData.getInstance().putData(CiaData.KEY_NODE_ID, new HashMap<String, Node>());
			// set java source path
			String javaSrcPath = FileHelper.normalizePath(projectPath + File.separator
					+ (javaSourceFolder != null ? javaSourceFolder : DEFAULT_JAVA_SOURCE_FOLDER));

			//****************************
			// Load project
			//****************************
			Loader loader = new Loader(javaSrcPath);
			root = loader.load(projectPath);

			int id = 1;
			for (final Node child : root.getAllChildren()) {
				child.setId(++id);
			}
			root.setId(1);
			root.setMaxId(++id);

			logger.log(LogLevel.CLIENT, "Done building tree!");
		} catch (CiaException e) {
			throw e;
		} catch (Exception e) {
			e.printStackTrace();
			throw new CiaException("Encountered Error while building tree");
		}
		return root;
	}
}
