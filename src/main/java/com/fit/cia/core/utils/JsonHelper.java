package com.fit.cia.core.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fit.cia.core.json.SimpleNodeForTestSerializer;
import com.fit.cia.core.json.SimpleNodeSerializer;
import com.fit.cia.core.treemodel.Node;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class JsonHelper {

	private static final Logger logger = LogManager.getLogger(JsonHelper.class);
	private final ObjectMapper mapper;
	private final ObjectMapper simpleNodeMapper;
	private final ObjectMapper simpleNodeForTestMapper;

	private static final JsonHelper instance = new JsonHelper();

	public static JsonHelper getInstance() {
		return instance;
	}

	private JsonHelper() {
		mapper = new ObjectMapper();

		simpleNodeMapper = new ObjectMapper();
		SimpleNodeSerializer<Node> simpleNodeSerializer = new SimpleNodeSerializer<>();
		SimpleModule simpleNodeModule = new SimpleModule();
		simpleNodeModule.addSerializer(Node.class, simpleNodeSerializer);
		simpleNodeMapper.registerModule(simpleNodeModule);

		simpleNodeForTestMapper = new ObjectMapper();
		SimpleNodeForTestSerializer<Node> simpleNodeForTestSerializer = new SimpleNodeForTestSerializer<>();
		SimpleModule simpleNodeForTestModule = new SimpleModule();
		simpleNodeForTestModule.addSerializer(Node.class, simpleNodeForTestSerializer);
		simpleNodeForTestMapper.registerModule(simpleNodeForTestModule);
	}

	public String getJson(Object object) {
		try {
			return mapper.writeValueAsString(object);

		} catch (JsonProcessingException e) {
			logger.error(e.getMessage());
			return null;
		}
	}
}
