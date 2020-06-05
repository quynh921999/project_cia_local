package com.fit.cia.web.model;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public final class UserInSynchronizedSet {
	private final Set<String> userSet = Collections.synchronizedSet(new HashSet<>());

	public void addUser(String userName) {
		this.userSet.add(userName);
	}

	public Set<String> getUserSet() {
		return this.userSet;
	}

	public void removeUserOnLogout(String user) {
		userSet.remove(user);
	}

	public boolean checkUserOnLogin(String user) {
		return userSet.add(user);
	}
}
