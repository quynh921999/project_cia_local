package com.fit.cia.core.dependency;

import com.fit.cia.core.treemodel.Node;

import java.io.Serializable;
import java.util.Objects;

public class Dependency implements Serializable {
	private static final long serialVersionUID = -6958270350847533871L;

	protected float weight = 0;

	protected Node fromNode;
	protected Node toNode;

	public Dependency() {
	}

	public Dependency(Node fromNode, Node toNode) {
		this.fromNode = fromNode;
		this.toNode = toNode;

		//TODO: add weight for dependency
		if (fromNode != null && toNode != null && !fromNode.equals(toNode)) {
			fromNode.addDependency(this);
			toNode.addDependency(this);
		}
	}

	public float getWeight() {
		return weight;
	}

	public void setWeight(float weight) {
		this.weight = weight;
	}

	public Node getFromNode() {
		return fromNode;
	}

	public void setFromNode(Node fromNode) {
		this.fromNode = fromNode;
	}

	public Node getToNode() {
		return toNode;
	}

	public void setToNode(Node toNode) {
		this.toNode = toNode;
	}

	@Override
	public String toString() {
		return "Dependency{" + this.getClass().getSimpleName() + "," +
				fromNode.getAbsolutePath() +
				"->" + toNode.getAbsolutePath() +
				"\n" +
				'}';
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) return true;
		if (!(obj instanceof Dependency)) return false;
		final Dependency that = (Dependency) obj;
		return fromNode.equals(that.fromNode) && toNode.equals(that.toNode);
	}

	@Override
	public int hashCode() {
		return Objects.hash(fromNode, toNode);
	}
}