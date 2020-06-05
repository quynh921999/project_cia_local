package com.fit.cia.web.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ErrorResponse extends RestResponse {

	@JsonProperty("error")
	private boolean error = true;

	public ErrorResponse(String message) {
		this.message = message;
	}

	public boolean isError() {
		return error;
	}

	public void setError(boolean error) {
		this.error = error;
	}

}
