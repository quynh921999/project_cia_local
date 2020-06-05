package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JsonJavaAbstractableNode extends JsonJavaElementNode {
	protected boolean isAbstract;

	@JsonProperty("isAbstract")
	public boolean isAbstract() {
		return isAbstract;
	}

	public void setAbstract(boolean anAbstract) {
		isAbstract = anAbstract;
	}
}
