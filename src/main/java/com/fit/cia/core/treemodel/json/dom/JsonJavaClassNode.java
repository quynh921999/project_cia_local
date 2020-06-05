package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fit.cia.core.treemodel.json.constant.JsonKind;

import java.util.ArrayList;
import java.util.List;

public class JsonJavaClassNode extends JsonJavaAbstractableNode {

	@JsonProperty("isInterface")
	protected boolean isInterface;

	@JsonProperty("attributes")
	protected List<JsonJavaFieldNode> fieldNodeList;

	@JsonProperty("methods")
	protected List<JsonJavaMethodNode> methodNodeList;


	protected int numOfMethod;
	protected int numOfVariable;

	public JsonJavaClassNode() {
		super();
		this.kind = JsonKind.CLASS;
		this.fieldNodeList = new ArrayList<>();
		this.methodNodeList = new ArrayList<>();
	}

	public boolean isInterface() {
		return isInterface;
	}

	public void setInterface(boolean anInterface) {
		isInterface = anInterface;
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
}
