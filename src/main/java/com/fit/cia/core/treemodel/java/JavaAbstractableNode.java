package com.fit.cia.core.treemodel.java;

public abstract class JavaAbstractableNode extends JavaVisibleNode {
	private boolean isAbstract = false;

	public boolean isAbstract() {
		return isAbstract;
	}

	public void setAbstract(boolean isAbstract) {
		this.isAbstract = isAbstract;
	}
}
