package com.fit.cia.web.controller;

import javax.faces.context.FacesContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;
import java.io.File;

public class ControllerUtils {
	/**
	 * Client use
	 */
	public static final String CLIENT_TREE_SESSION_KEY = "client_tree";
	public static final String CLIENT_DEPENDENCY_SESSION_KEY = "client_dependency";

	/**
	 * Client use, but for analyzed tree
	 */
	public static final String CLIENT_ANALYZED_TREE_SESSION_KEY = "client_analyzed_tree";
	public static final String CLIENT_ANALYZED_DEPENDENCY_SESSION_KEY = "client_analyzed_dependency";

	/**
	 * Project properties
	 */
	public static final String PART_USER_SESSION_KEY = "part_user";
	public static final String PART_ID_SESSION_KEY = "part_id";
	public static final String VERSION_ID_SESSION_KEY = "version_id";
	public static final String TREE_SCOPE = "tree_scope";

	public static final String CURRENT_LANGUAGE = "current_language";

	public static final String CPP_TREE_ROOT = "cpp_tree_root";

	/**
	 * Global
	 */
	public static final String USER_NAME = "user_name";

	public static final String DEFAULT_TREE_JSON_FILE = "tree.json";
	public static final String DEFAULT_COMPARED_VERSION_FILE = "compare.json";
	public static final String DEFAULT_DEPENDENCY_JSON_FILE = "dependency.json";
	public static final String README_FILE = "readme.cia";

	/**
	 * Xây dựng kiến trúc hệ thống
	 */
	public static final String ALL_PATH_JARS = "path-jar";

	/**
	 * Get current session
	 *
	 * @return HttpSession
	 */
	public static HttpSession getSession() {
		return (HttpSession) FacesContext.
				getCurrentInstance().
				getExternalContext().
				getSession(false);
	}

	/**
	 * Get current request
	 *
	 * @return HttpServletRequestS
	 */
	public static HttpServletRequest getRequest() {
		return (HttpServletRequest) FacesContext.getCurrentInstance().getExternalContext().getRequest();
	}

	/**
	 * Get full name of user
	 *
	 * @return full name
	 */
	public static String getUserName() {
		return (String) getSession(USER_NAME);
	}

	/**
	 * Get file name from request Http Servlet Part
	 *
	 * @param part
	 * @return
	 */
	public static String getFileNameFromPart(Part part) {
		final String partHeader = part.getHeader("content-disposition");
		for (String content : partHeader.split(";"))
			if (content.trim().startsWith("filename")) {
				String fileName = content.substring(content.indexOf('=') + 1)
						.trim().replace("\"", "");
				int indexOfSlash = fileName.lastIndexOf(File.separator);
				if (indexOfSlash != -1)
					fileName = fileName.substring(indexOfSlash + 1);
				return fileName;
			}
		return null;
	}

	public static void putSession(String key, Object value) {
		FacesContext.getCurrentInstance().getExternalContext().getSessionMap().put(key, value);
	}

	public static Object getSession(String key) {
		return FacesContext.getCurrentInstance().getExternalContext().getSessionMap().get(key);
	}
}
