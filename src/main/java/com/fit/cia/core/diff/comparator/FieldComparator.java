package com.fit.cia.core.diff.comparator;

import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaFieldNode;
import org.eclipse.jdt.core.dom.FieldDeclaration;

/**
 * Created by locdt on 7/17/2017.
 */
public final class FieldComparator implements IDifferentComparator {
	//private static final Logger logger = Logger.getLogger(FieldComparator.class);

	@Override
	public boolean isDifferent(Node base, Node changed) {
		JavaFieldNode oldFieldNode = (JavaFieldNode) base;
		JavaFieldNode newFieldNode = (JavaFieldNode) changed;

		if (!oldFieldNode.getType().equals(newFieldNode.getType())
				|| !oldFieldNode.getVisibility().equals(newFieldNode.getVisibility())) {
			return true;
		}
		FieldDeclaration oldAST = (FieldDeclaration) oldFieldNode.getAstNode();
		FieldDeclaration newAST = (FieldDeclaration) newFieldNode.getAstNode();
		String[] oldElement = oldAST.toString().split("\\s+|=");
		String[] newElement = newAST.toString().split("\\s+|=");

		return !String.join("",oldElement).equals(String.join("",newElement));
	}
}
