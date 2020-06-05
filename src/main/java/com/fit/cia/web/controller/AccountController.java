package com.fit.cia.web.controller;

import com.fit.cia.web.model.User;
import com.fit.cia.web.model.UserInSynchronizedSet;
import com.fit.cia.web.model.UserModel;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.faces.bean.ManagedBean;
import javax.servlet.http.HttpSession;
import java.io.Serializable;

@Component
@Scope(value = "session")
@ManagedBean
public class AccountController implements Serializable {
	private static final long serialVersionUID = 1L;
	private final UserInSynchronizedSet userSet;
	private final UserModel userModel = new UserModel();
	private String username;
	private String password;
	private String message;

	public AccountController(UserInSynchronizedSet userSet) {
		this.userSet = userSet;
	}

	/**
	 * Get message
	 *
	 * @return message
	 */
	public String getMessage() {
		return message;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String login() {
		final User user = userModel.getUser(username, password);
		if (user != null) {
			userSet.addUser(user.getUsername());
			ControllerUtils.putSession("user_name", user.getUsername());
			ControllerUtils.putSession("full_name", user.getFullName());
			this.message = null;
			return "uploadJava?faces-redirect=true";
		} else {
			this.message = "Login failed!";
			return "login";
		}
	}

	/**
	 * Log out user from current session
	 *
	 * @return redirect to login page.
	 */
	public String logout() {
		userSet.removeUserOnLogout(ControllerUtils.getUserName());
		HttpSession session = ControllerUtils.getSession();
		session.invalidate();
		return "login?faces-redirect=true";
	}
}
