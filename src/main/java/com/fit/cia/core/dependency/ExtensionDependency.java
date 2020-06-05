package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

public class ExtensionDependency extends Dependency {
	private static final long serialVersionUID = -1242026584443661063L;

	public ExtensionDependency(Node fromNode, Node toNode) {
		super(fromNode, toNode);
	}

}
