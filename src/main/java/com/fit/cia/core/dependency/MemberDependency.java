package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

public class MemberDependency extends Dependency {
	private static final long serialVersionUID = 3207762045549811936L;

	public MemberDependency(Node fromNode, Node toNode) {
		super(fromNode, toNode);
	}

}
