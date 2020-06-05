package com.fit.cia.core.treemodel;

import java.util.HashMap;
import java.util.Map;

public class CiaData {
	public static final Integer DEPENDENCY_COUNTER = 200;
	public static final Integer NODE_COUNTER = 201;
	public static final Integer PACKAGE_NAME_SET = 400;
	public static final Integer KEY_NODE_ID = 600;


	private final Map<Integer, Object> dataMap;

	private CiaData() {
		this.dataMap = new HashMap<>();
		this.dataMap.put(NODE_COUNTER, 1);
		this.dataMap.put(DEPENDENCY_COUNTER, 1);
	}

	private static final ThreadLocal<CiaData> THREAD_LOCAL = new ThreadLocal<>() {
		@Override
		protected CiaData initialValue() {
			return new CiaData();
		}

		@Override
		public void remove() {
			super.remove();
		}
	};

	public Integer generateNodeId() {
		Integer val = (Integer) this.dataMap.get(NODE_COUNTER);
		return (Integer) this.dataMap.put(NODE_COUNTER, val + 1);
	}

	public Integer generateDependencyId() {
		Integer val = (Integer) this.dataMap.get(DEPENDENCY_COUNTER);
		return (Integer) this.dataMap.put(DEPENDENCY_COUNTER, val + 1);
	}

	public static CiaData getInstance() {
		return THREAD_LOCAL.get();
	}

	public Object getData(Integer dataKey) {
		return dataMap.get(dataKey);
	}

	public Object putData(Integer dataKey, Object data) {
		return dataMap.put(dataKey, data);
	}

	public void removeData(Integer dataKey) {
		dataMap.remove(dataKey);
	}

}

