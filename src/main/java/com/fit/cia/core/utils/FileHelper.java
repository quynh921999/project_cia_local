package com.fit.cia.core.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;


/**
 * Mostly unsafe to use, need a replacement
 */
//@Deprecated
public class FileHelper {
	public static final String JAVA_EXTENSION = ".java";
	public static final String CPP_EXTENSION = ".cpp";
	public static final String HEADER_EXTENSION = ".h";

	public static final String[] IGNORED_COMPONENTS = {
			".git", ".gitignore", ".*\\.md",    // git
			".settings",                        // eclipse
			".idea", ".*\\.iml"                 // intellij idea
	};


	public static FileType getFileType(String absolutePath) {
		if (absolutePath.endsWith(JAVA_EXTENSION))
			return FileType.JAVA_FILE;
		else if (absolutePath.endsWith(CPP_EXTENSION)) {
			return FileType.CPP_FILE;
		} else if (absolutePath.endsWith(HEADER_EXTENSION)) {
			return FileType.HEADER_FILE;
		} else {
			File file = new File(absolutePath);
			return file.isDirectory() ? FileType.DIRECTORY : FileType.UNKNOWN;
		}
	}

	public static boolean isIgnoredComponent(String path, String[] patterns) {
		if (patterns == null || path == null) return false;

		for (String index : patterns) {
			if (index.matches("^\\*.+")) {
				String index_convert = index.replace("*", "");
				if (path.matches(".*" + index_convert + "$")) {
					return true;
				}
			} else {
				String tag = index;
				String path_convert = path;
				if (index.contains("/")) tag = index.replace("/", "");
				if (index.contains("\\")) tag = index.replace("\\", "");
				if (path.contains("/")) path_convert = path.replace("/", "");
				if (path.contains("\\")) path_convert = path.replace("\\", "");

				if (path_convert.matches("^(" + tag + ").*")) {
					return true;
				}
			}
		}
		return false;
	}

	public static ArrayList<String> getChildNames(String rootPath) {
		final ArrayList<String> childNames = new ArrayList<>();
		final File file = new File(rootPath);

		final String[] children = file.list();
		if (children == null) return childNames;

		childNames.addAll(Arrays.asList(children));
		return childNames;
	}

	public static String readFileContent(String path) throws IOException {
		return Files.readString(Paths.get(path));
	}

	public static String normalizePath(String path) {
		return path.replace("/", File.separator).replace("\\", File.separator);
	}

	public static String getAbsolutePath(String path) {
		String absolutePath = "";
		try {
			absolutePath = new File(path).getCanonicalPath();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return absolutePath;
	}
}
