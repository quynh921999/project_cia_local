package com.fit.cia.web.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class AppConfig {
	public static final Path UPLOAD_PATH;

	static {
		try {
			UPLOAD_PATH = Files.createDirectories(Path.of(System.getProperty("cia.tmpdir", System.getProperty("java.io.tmpdir")), "cia-upload"));
		} catch (IOException e) {
			throw new RuntimeException("Cannot get/create CIA upload path, the program cannot continue!", e);
		}
	}
}
