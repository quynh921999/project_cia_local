package com.fit.cia.web.api.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CalculateImpactRequest {
	@JsonProperty("changeSet")
	private int[] changeSet;

	public int[] getChangeSet() {
		return changeSet;
	}

	public void setChangeSet(int[] changeSet) {
		this.changeSet = changeSet;
	}
}
