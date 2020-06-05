package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fit.cia.core.treemodel.json.constant.JsonKind;

public class JsonJavaFieldNode extends JsonJavaElementNode {
	protected String type;

	public JsonJavaFieldNode() {
		this.kind = JsonKind.ATTRIBUTE;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
}
