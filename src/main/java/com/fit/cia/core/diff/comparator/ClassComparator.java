package com.fit.cia.core.diff.comparator;

import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;

/**
 * Created by locdt on 7/16/2017.
 */
public final class ClassComparator implements IDifferentComparator {

	@Override
	public boolean isDifferent(Node base, Node changed) {
		JavaClassNode baseClass = (JavaClassNode) base;
		JavaClassNode changedClass = (JavaClassNode) changed;

		// TODO: Compare name of class
		if (!baseClass.getName().equals(changedClass.getName())
				|| !baseClass.getVisibility().equals(changedClass.getVisibility())
				|| !baseClass.isInterface() == changedClass.isInterface()
				|| baseClass.getParentClass() == null && changedClass.getParentClass() != null
				|| baseClass.getParentClass() != null && changedClass.getParentClass() == null) {
			return true;
		} else if (baseClass.getParentClass() != null && changedClass.getParentClass() != null) {
			if (!baseClass.getParentClass().equals(changedClass.getParentClass())
					|| baseClass.getInterfaceList().size() != changedClass.getInterfaceList().size()) {
				return true;
			}
			for (String s : baseClass.getInterfaceList()) {
				if (!changedClass.getInterfaceList().contains(s)) {
					return true;
				}
			}
		}
		return false;

	}
}
