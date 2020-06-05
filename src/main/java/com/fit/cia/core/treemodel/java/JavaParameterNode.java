package com.fit.cia.core.treemodel.java;

public class JavaParameterNode extends JavaElementNode {
	protected String type;

	public JavaParameterNode(String name, String type) {
		setName(name);
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
}
