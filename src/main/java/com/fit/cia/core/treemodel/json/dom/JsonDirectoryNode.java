package com.fit.cia.core.treemodel.json.dom;

import com.fit.cia.core.treemodel.json.constant.JsonKind;

public class JsonDirectoryNode extends JsonNode {
	public JsonDirectoryNode() {
		super();
		this.kind = JsonKind.DIRECTORY;
	}
}
