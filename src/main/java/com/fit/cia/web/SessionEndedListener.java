package com.fit.cia.web;


import com.fit.cia.web.controller.ControllerUtils;
import com.fit.cia.web.model.UserInSynchronizedSet;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

@Component
public class SessionEndedListener implements HttpSessionListener {
	@Override
	public void sessionCreated(HttpSessionEvent httpSessionEvent) {
	}

	@Override
	public void sessionDestroyed(HttpSessionEvent event) {
//		ApplicationContext context =
//				WebApplicationContextUtils.getWebApplicationContext(
//						event.getSession().getServletContext()
//				);
//		UserInSynchronizedSet userSet = (UserInSynchronizedSet) context.getBean("userSet");
//		userSet.removeUserOnLogout((String) event.getSession().getAttribute(ControllerUtils.USER_NAME));
	}
}