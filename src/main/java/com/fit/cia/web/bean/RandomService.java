package com.fit.cia.web.bean;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class RandomService {
	public String randomString() {
		return UUID.randomUUID().toString();
	}
}
