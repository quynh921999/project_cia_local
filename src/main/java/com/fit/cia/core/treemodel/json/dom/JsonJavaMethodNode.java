package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fit.cia.core.treemodel.json.constant.JsonKind;

public class JsonJavaMethodNode extends JsonJavaAbstractableNode {
	@JsonProperty("return")
	protected String returnType;

	public JsonJavaMethodNode() {
		this.kind = JsonKind.METHOD;
	}

	public String getReturnType() {
		return returnType;
	}

	public void setReturnType(String returnType) {
		this.returnType = returnType;
	}
}
