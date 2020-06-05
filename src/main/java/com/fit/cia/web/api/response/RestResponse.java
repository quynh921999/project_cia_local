package com.fit.cia.web.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RestResponse {

	@JsonProperty("message")
	protected String message;

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
