package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

public class ImplementationDependency extends Dependency {
	private static final long serialVersionUID = 7626742960801849357L;

	public ImplementationDependency(Node fromNode, Node toNode) {
		super(fromNode, toNode);
	}

}
