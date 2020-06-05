package com.fit.cia.core.treemodel.json.dom;

import com.fit.cia.core.treemodel.json.constant.JsonKind;

public class JsonJavaFileNode extends JsonNode {
	public JsonJavaFileNode() {
		super();
		this.kind = JsonKind.FILE;
	}
}
