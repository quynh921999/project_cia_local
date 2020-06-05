package com.fit.cia.web.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class IncludeIdsResponse {

	@JsonProperty("id")
	private int nodeId;

	@JsonProperty("ids")
	private List<Integer> includeIds;

	public IncludeIdsResponse() {
		includeIds = new ArrayList<>();
	}

	public IncludeIdsResponse(int nodeId, List<Integer> includeIds) {
		this.nodeId = nodeId;
		this.includeIds = includeIds;
	}

	public int getNodeId() {
		return nodeId;
	}

	public void setNodeId(int nodeId) {
		this.nodeId = nodeId;
	}

	public List<Integer> getIncludeIds() {
		return includeIds;
	}

	public void setIncludeIds(List<Integer> includeIds) {
		this.includeIds = includeIds;
	}

	@Override
	public boolean equals(Object obj) {
		if (!(obj instanceof IncludeIdsResponse)) return false;
		if (this == obj) return true;
		return (this.getNodeId() == ((IncludeIdsResponse) obj).getNodeId());
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(nodeId);
	}
}
