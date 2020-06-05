package com.fit.cia.web.model;

import java.io.Serializable;

public class User implements Serializable {
	private static final long serialVersionUID = -6851925891708843882L;

	private final String userName;
	private final String password;
	private final String fullName;

	/**
	 * Constructor
	 *
	 * @param userName name of user's account
	 * @param password password of user's account
	 * @param fullName full name of user
	 */
	public User(String userName, String password, String fullName) {
		this.userName = userName;
		this.password = password;
		this.fullName = fullName;
	}

	/**
	 * Get user's full name
	 *
	 * @return user's full name
	 */
	public String getFullName() {
		return fullName;
	}

	/**
	 * Get password
	 *
	 * @return password
	 */
	public String getPassword() {
		return password;
	}

	/**
	 * Get username
	 *
	 * @return username
	 */
	public String getUsername() {
		return userName;
	}
}
