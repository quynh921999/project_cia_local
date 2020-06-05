package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

public class MethodInvocationDependency extends Dependency {
	private static final long serialVersionUID = 278000321889457694L;

	public MethodInvocationDependency(Node fromNode, Node toNode) {
		super(fromNode, toNode);
	}

}
