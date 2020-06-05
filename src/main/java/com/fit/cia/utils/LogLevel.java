package com.fit.cia.utils;

import org.apache.logging.log4j.Level;

public final class LogLevel {
	public static final Level CLIENT = Level.forName("CLIENT", 90);
	public static final Level C_ERROR = Level.forName("C_ERROR", 80);

	private LogLevel() {
	}
}
