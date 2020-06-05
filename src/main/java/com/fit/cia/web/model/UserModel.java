package com.fit.cia.web.model;

import java.util.List;

public class UserModel {
	private final List<User> users = List.of(
			new User("fit", "fit123", "FIT"),
			new User("tsdv", "tsdv123", "TSDV")
	);

	public User getUser(String username, String password) {
		for (final User user : users) {
			if (user.getUsername().equals(username) && user.getPassword().equals(password)) {
				return user;
			}
		}
		return null;
	}
}
