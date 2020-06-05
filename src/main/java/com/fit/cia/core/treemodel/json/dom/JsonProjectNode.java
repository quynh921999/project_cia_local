package com.fit.cia.core.treemodel.json.dom;

import com.fit.cia.core.treemodel.json.constant.JsonKind;

public class JsonProjectNode extends JsonNode {
	public JsonProjectNode() {
		super();
		this.kind = JsonKind.PROJECT;
	}
}
