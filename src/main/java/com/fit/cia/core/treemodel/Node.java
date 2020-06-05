package com.fit.cia.core.treemodel;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.dependency.DependencyType;
import com.fit.cia.core.dependency.ExtensionDependency;
import com.fit.cia.core.dependency.FieldAccessDependency;
import com.fit.cia.core.dependency.ImplementationDependency;
import com.fit.cia.core.dependency.MemberDependency;
import com.fit.cia.core.dependency.MethodInvocationDependency;

import java.io.File;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Node {
	private int id;
	private String name;
	private String absolutePath;
	private Node parent;
	private List<Node> children = new ArrayList<>();
	private List<Dependency> dependencies = new ArrayList<>();
	private int maxId;
	private float weight = 0.0f;

	public Node() {
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
		if (absolutePath == null) {
			setAbsolutePathByName();
		}
	}

	public String getAbsolutePath() {
		return absolutePath;
	}

	public void setAbsolutePath(String absolutePath) {
		this.absolutePath = absolutePath;
	}

	public void setAbsolutePathByName() {
		if (this.parent != null) {
			setAbsolutePath(this.parent.absolutePath + File.separator + this.name);
		}
	}

	public Node getParent() {
		return parent;
	}

	public void setParent(Node parent) {
		this.parent = parent;
	}

	public Node getRootNode() {
		return parent != null ? parent.getRootNode() : this;
	}

	public List<Node> getChildren() {
		return children;
	}

	public void setChildren(List<Node> children) {
		this.children = children;
	}

	public void addChild(Node child) {
		if (child != null)
			this.children.add(child);
	}

	public void addChildren(List<Node> children) {
		this.children.addAll(children);
	}

	public List<Node> getAllDependencyFrom() {
		List<Node> nodes = new ArrayList<>();
		for (Dependency d : dependencies) {
			if (d.getToNode().equals(this)) {
				nodes.add(d.getFromNode());
			}
		}

		return nodes;

	}

	public List<Node> getAllDependencyTo() {
		List<Node> nodes = new ArrayList<>();
		for (Dependency d : dependencies) {
			if (d.getFromNode().equals(this)) {
				nodes.add(d.getFromNode());
			}
		}

		return nodes;
	}

	public Map<DependencyType, Integer> getNodeDependencyTo(Node node) {
		Map<DependencyType, Integer> map = new EnumMap<>(DependencyType.class);
		for (Dependency d : dependencies) {
			if (d.getToNode().equals(node)) {
				if (d instanceof MethodInvocationDependency) {
					//TODO cần lấy ra được số lượng của mỗi loại phụ thuộc, hiện mặc định là 1
					Integer callNumber = 1;
					map.put(DependencyType.METHOD_INVOCATION, callNumber);
				} else if (d instanceof FieldAccessDependency) {
					Integer callNumber = 1;
					map.put(DependencyType.FIELD_ACCESSION, callNumber);
				} else if (d instanceof ExtensionDependency) {
					Integer callNumber = 1;
					map.put(DependencyType.EXTENSION, callNumber);
				} else if (d instanceof ImplementationDependency) {
					Integer callNumber = 1;
					map.put(DependencyType.IMPLEMENTATION, callNumber);
				} else if (d instanceof MemberDependency) {
					Integer callNumber = 1;
					map.put(DependencyType.MEMBER, callNumber);
				}
			}
		}
		return map;
	}

	public final Map<DependencyType, Integer> getNodeDependencyFrom(Node node) {
		return this.getNodeDependencyTo(this);
	}

	public List<Dependency> getDependencies() {
		return dependencies;
	}

	public void setDependencies(List<Dependency> dependencies) {
		this.dependencies = dependencies;
	}

	public void addDependency(Dependency dependencies) {
		this.dependencies.add(dependencies);
	}

	public String getRelativePath() {
		Node root = getRootNode();
		if (root != null) {
			return getAbsolutePath().replace(root.getAbsolutePath() + File.separator, "");
		} else return getAbsolutePath();
	}

	public List<Node> getAllChildren() {
		final List<Node> children = new LinkedList<>();
		doGetAllChildren(children, this);
		return children;
	}

	private static void doGetAllChildren(List<Node> children, Node node) {
		for (Node child : node.children) {
			children.add(child);
			doGetAllChildren(children, child);
		}
	}

	public float getWeight() {
		return weight;
	}

	public void setWeight(float weight) {
		this.weight = weight;
	}

	public void addWeight(float weight) {
		this.weight += weight;
	}

	@Override
	public String toString() {
		return "Node{" +
				"name='" + name + '\'' +
				'}';
	}

	public int getMaxId() {
		return maxId;
	}

	public void setMaxId(int maxId) {
		this.maxId = maxId;
	}
}
