package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fit.cia.core.diff.CompareTwoTreeResult;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.json.constant.JsonChange;
import com.fit.cia.core.treemodel.json.constant.JsonKind;
import mrmathami.util.Pair;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class JsonNode implements Serializable {

	@JsonProperty("id")
	protected int id;

	@JsonProperty("name")
	protected String name;

	@JsonProperty("kind")
	protected String kind = JsonKind.UNKNOWN;

	@JsonProperty("weight")
	protected float weight;

	@JsonIgnore
	protected ArrayList<Integer> includeIds;

	@JsonIgnore
	protected boolean matched = false;

	@JsonProperty("children")
	protected List<JsonNode> children;

	@JsonProperty("hasChildren")
	protected boolean hasChildren = false;

	@JsonIgnore
	protected JsonNode parent;

	@JsonIgnore
	protected boolean hasDependency = false;

	@JsonProperty("change")
	private String change = JsonChange.UNCHANGED;

	public void setChange(String change) {
		this.change = change;
	}

	public String getChange() {
		return change;
	}

	public JsonNode() {
		this.includeIds = new ArrayList<>();
		this.children = new ArrayList<>();
	}

	public float getWeight() {
		return weight;
	}

	public void setWeight(float weight) {
		this.weight = weight;
	}

	public boolean isMatched() {
		return matched;
	}

	public void setMatched(boolean matched) {
		this.matched = matched;
	}

	public boolean isHasChildren() {
		return hasChildren;
	}

	public void setHasChildren(boolean hasChildren) {
		this.hasChildren = hasChildren;
	}

	public boolean isHasDependency() {
		return hasDependency;
	}

	public void setHasDependency(boolean hasDependency) {
		this.hasDependency = hasDependency;
	}

	public JsonNode getParent() {
		return parent;
	}

	public void setParent(JsonNode parent) {
		this.parent = parent;
	}

	public List<JsonNode> getChildren() {
		return children;
	}

	public void setChildren(List<JsonNode> children) {
		this.children = children;
	}

	public void addChild(JsonNode child) {
		this.children.add(child);
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
	}

	public String getKind() {
		return kind;
	}

	public void setKind(String kind) {
		this.kind = kind;
	}

	public ArrayList<Integer> getIncludeIds() {
		return includeIds;
	}

	public void addIncludeId(Integer id) {
		this.includeIds.add(id);
	}

	public void addIncludeIds(List<Integer> ids) {
		this.includeIds.addAll(ids);
	}

	@Override
	public boolean equals(Object obj) {
		return this.getId() == ((JsonNode) obj).getId();
	}

	@Override
	public String toString() {
		return "JsonNode{" +
				"name='" + name + '\'' +
				", id='" + id + '\'' +
				", children=" + children +
				'}';
	}

	@JsonIgnore
	public void defineChangeMethod(CompareTwoTreeResult compareTwoTreeResult) {
		//xac dinh phuong thuc thay doi la CHanged hay Added
		Set<Node> addedNodes = compareTwoTreeResult.getAddedNodes();
		for (Node add : addedNodes) {
			if (add.getId() == this.getId()) {
				this.setChange(JsonChange.ADDED);
			}
		}

		Set<Pair<Node, Node>> changedNodes = compareTwoTreeResult.getChangedNodes();
		for (Pair<Node, Node> change : changedNodes) {
			if (change.getB().getId() == this.getId()) {
				this.setChange(JsonChange.CHANGED);
			}
		}
	}

}
