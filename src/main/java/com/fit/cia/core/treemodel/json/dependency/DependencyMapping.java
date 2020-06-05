package com.fit.cia.core.treemodel.json.dependency;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.Objects;

public final class DependencyMapping implements Serializable {
	@JsonProperty("typeDependency")
	private String typeDependency;

	@JsonProperty("id")
	private int calleeId;

	@JsonProperty("count")
	private int count;

	@JsonProperty("weight")
	private float weight;

	public String getTypeDependency() {
		return typeDependency;
	}

	public void setTypeDependency(String typeDependency) {
		this.typeDependency = typeDependency;
	}

	public int getCalleeId() {
		return calleeId;
	}

	public void setCalleeId(int calleeId) {
		this.calleeId = calleeId;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public float getWeight() {
		return weight;
	}

	public void setWeight(float weight) {
		this.weight = weight;
	}

	@Override
	public boolean equals(Object object) {
		if (this == object) return true;
		if (!(object instanceof DependencyMapping)) return false;
		final DependencyMapping mapping = (DependencyMapping) object;
		return calleeId == mapping.calleeId
				&& weight == mapping.weight
				&& Objects.equals(typeDependency, mapping.typeDependency);
	}

	@Override
	public int hashCode() {
		int result = typeDependency != null ? typeDependency.hashCode() : 0;
		result = 31 * result + calleeId;
		result = 31 * result + Float.hashCode(weight);
		return result;
	}
}
