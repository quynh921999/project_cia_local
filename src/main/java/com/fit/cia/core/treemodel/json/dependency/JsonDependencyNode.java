package com.fit.cia.core.treemodel.json.dependency;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public final class JsonDependencyNode implements Serializable {
	@JsonProperty("id")
	private int callerId;

	@JsonProperty("dependency")
	private final List<DependencyMapping> dependencies = new ArrayList<>();

	public JsonDependencyNode() {
	}

	public int getCallerId() {
		return callerId;
	}

	public void setCallerId(int callerId) {
		this.callerId = callerId;
	}

	public List<DependencyMapping> getDependencyMappingList() {
		return dependencies;
	}

	public void addMapping(DependencyMapping mapping) {
		dependencies.add(mapping);
	}

}
