package com.fit.cia.core.treemodel.java;

import com.fit.cia.core.treemodel.Node;

import java.util.ArrayList;
import java.util.List;

public final class JavaClassNode extends JavaAbstractableNode {
	private boolean isInterface;
	private String parentClass;
	private List<String> interfaceList = new ArrayList<>();
	private String type;
	private int numOfMethod;
	private int numOfVariable;

	public JavaClassNode() {
	}

	public boolean isInterface() {
		return isInterface;
	}

	public void setInterface(boolean anInterface) {
		isInterface = anInterface;
	}

	public String getParentClass() {
		return parentClass;
	}

	public void setParentClass(String parentClass) {
		this.parentClass = parentClass;
	}

	public List<String> getInterfaceList() {
		return interfaceList;
	}

	public void setInterfaceList(List<String> interfaceList) {
		this.interfaceList = interfaceList;
	}

	public void addInterface(String _interface) {
		this.interfaceList.add(_interface);
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getNumOfMethod() {
		return numOfMethod;
	}

	public void setNumOfMethod(int numOfMethod) {
		this.numOfMethod = numOfMethod;
	}

	public int getNumOfVariable() {
		return numOfVariable;
	}

	public void setNumOfVariable(int numOfVariable) {
		this.numOfVariable = numOfVariable;
	}

	public List<JavaMethodNode> getMethodList() {
		List<JavaMethodNode> result = new ArrayList<>();
		for (Node child : this.getChildren()) {
			if (child instanceof JavaMethodNode)
				result.add((JavaMethodNode) child);
		}
		return result;
	}

	public List<JavaFieldNode> getFieldList() {
		List<JavaFieldNode> result = new ArrayList<>();
		for (Node child : this.getChildren()) {
			if (child instanceof JavaFieldNode)
				result.add((JavaFieldNode) child);
		}
		return result;
	}

	public String toString() {
		return "JavaClassNode{" +
				"isInterface=" + isInterface +
				", parentClass='" + parentClass + '\'' +
				", interfaceList=" + interfaceList +
				", type='" + type + '\'' +
				'}';
	}

}
