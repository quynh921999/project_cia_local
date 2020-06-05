package com.fit.cia.core.treemodel.java;

import java.util.ArrayList;
import java.util.List;

public class JavaMethodNode extends JavaAbstractableNode {
	protected String returnType;
	protected List<JavaParameterNode> parameters = new ArrayList<>();
	private String simpleName;

	public JavaMethodNode() {
	}

	public String getReturnType() {
		return returnType;
	}

	public void setReturnType(String returnType) {
		this.returnType = returnType;
	}

	public List<JavaParameterNode> getParameters() {
		return parameters;
	}

	public void setParameters(List<JavaParameterNode> list) {
		this.parameters = list;
	}

	public void addParameter(JavaParameterNode param) {
		if (param != null) parameters.add(param);
	}

	public void addAllParameters(List<JavaParameterNode> params) {
		parameters.addAll(params);
	}

	public String getSimpleName() {
		return simpleName;
	}

	public void setSimpleName(String simpleName) {
		this.simpleName = simpleName;
	}

	public String toString() {
		return "JavaMethodNode{" +
				"isAbstract=" + isAbstract() +
				", returnType='" + returnType + '\'' +
				", parameters=" + parameters +
				'}';
	}
}
