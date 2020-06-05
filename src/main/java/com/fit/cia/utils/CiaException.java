package com.fit.cia.utils;

public class CiaException extends Exception {
	public CiaException(String message) {
		super(message);
	}

	public CiaException(String message, Throwable cause) {
		super(message, cause);
	}
}
