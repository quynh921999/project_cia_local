package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

public class FieldAccessDependency extends Dependency {
	private static final long serialVersionUID = 4335600037978906214L;

	public FieldAccessDependency(Node fromNode, Node toNode) {
		super(fromNode, toNode);
	}

}
