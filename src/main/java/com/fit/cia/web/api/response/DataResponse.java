package com.fit.cia.web.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DataResponse extends RestResponse {

	@JsonProperty("data")
	protected Object data;

	public DataResponse(String message, Object data) {
		this.message = message;
		this.data = data;
	}

	public DataResponse(Object data) {
		this.data = data;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}
}
