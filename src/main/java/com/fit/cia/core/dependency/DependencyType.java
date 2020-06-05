package com.fit.cia.core.dependency;

public enum DependencyType {
	METHOD_INVOCATION(3.5f, 0.875f),
	FIELD_ACCESSION(3.0f, 0.5f),
	EXTENSION(4.0f, 0.75f),
	IMPLEMENTATION(4.0f, 1.0f),
	MEMBER(1.0f, 1.0f);
//	OVERRIDE(3.3f, 0.825f);

	public static final DependencyType[] values = DependencyType.values();

	private final float forwardWeight;

	private final float backwardWeight;

	DependencyType(float forwardWeight, float backwardWeight) {
		this.forwardWeight = forwardWeight;
		this.backwardWeight = backwardWeight;
	}

	public float getForwardWeight() {
		return forwardWeight;
	}

	public float getBackwardWeight() {
		return backwardWeight;
	}
}