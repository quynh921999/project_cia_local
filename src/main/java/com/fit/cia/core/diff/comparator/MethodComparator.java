package com.fit.cia.core.diff.comparator;

import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaMethodNode;
import org.eclipse.jdt.core.dom.MethodDeclaration;

/**
 * Created by locdt on 7/16/2017.
 */
public final class MethodComparator implements IDifferentComparator {
	@Override
	public boolean isDifferent(Node base, Node changed) {
		JavaMethodNode baseMethod = (JavaMethodNode) base;
		JavaMethodNode changedMethod = (JavaMethodNode) changed;
		MethodDeclaration baseAST = (MethodDeclaration) baseMethod.getAstNode();
		MethodDeclaration changedAST = (MethodDeclaration) changedMethod.getAstNode();

		String[] listElementChanged = changedAST.toString().split("\\s+");
		String[] listElementBased = baseAST.toString().split("\\s+");

		if (listElementBased.length != listElementChanged.length) {
			//TODO must return false
			return true;
		} else {
			for (int i = 0; i < listElementBased.length; i++) {
				String baseElement = listElementBased[i].trim();
				String changeElement = listElementChanged[i].trim();
				if (!baseElement.equals(changeElement)) {
					return true;
				}
			}
		}
		return false;
	}
}
