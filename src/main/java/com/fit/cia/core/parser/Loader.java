package com.fit.cia.core.parser;

import com.fit.cia.core.treemodel.DirectoryNode;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.ProjectNode;
import com.fit.cia.core.treemodel.java.UnknownNode;
import com.fit.cia.core.utils.FileHelper;
import com.fit.cia.core.utils.FileType;
import com.fit.cia.utils.CiaNotFoundException;

import java.io.File;
import java.util.List;

public final class Loader {
	private Node projectNode;

	private final JavaFileParser javaFileParser;

	public Loader(String javaSourcePath) {
		this.javaFileParser = new JavaFileParser(javaSourcePath);
	}

	public Node load(String projectPath) throws CiaNotFoundException {
		String absoluteRootPath = FileHelper.getAbsolutePath(projectPath);

		// init root
		initRootNode(absoluteRootPath);

		// loading project nodes by recursion
		doLoadingTree(projectNode);
		return projectNode;
	}

	private void initRootNode(String rootPath) throws CiaNotFoundException {
		File file = new File(rootPath);
		if (!file.exists()) {
			throw new CiaNotFoundException("project path not found");
		}
		FileType fileType = FileHelper.getFileType(rootPath);
		if (fileType != FileType.DIRECTORY) throw new CiaNotFoundException("project path must be a directory");

		this.projectNode = new ProjectNode();
		this.projectNode.setName("ROOT");
		this.projectNode.setAbsolutePath(rootPath);
	}

	private Node doLoadingTree(Node rootNode) {
		String rootPath = rootNode.getAbsolutePath();

		List<String> childNames = FileHelper.getChildNames(rootPath);
		for (String childName : childNames) {
			String childPath = rootPath + File.separator + childName;
			FileType fileType = FileHelper.getFileType(childPath);
			Node childNode;
			if (fileType == FileType.JAVA_FILE) {
				childNode = new FileNode();
			} else if (fileType == FileType.DIRECTORY) {
				childNode = doLoadingTree(new DirectoryNode(childPath));
			} else {
				childNode = new UnknownNode();
			}

			childNode.setParent(rootNode);
			rootNode.addChild(childNode);

			childNode.setName(childName);
			childNode.setAbsolutePathByName();

			//pre-parse for java, xml
			if (childNode instanceof FileNode) {
				javaFileParser.parse(childNode);
			}
		}
		return rootNode;
	}

	private void preParse(Node node) {
		// TODO: The main parse thingy is here
		if (node instanceof FileNode) {
			javaFileParser.parse(node);
		}
	}
}
