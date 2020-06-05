package com.fit.cia.core.diff;

import com.fit.cia.core.treemodel.Node;
import mrmathami.util.Pair;

import java.util.HashSet;
import java.util.Set;

public final class CompareTwoTreeResult {
	private final Set<Node> addedNodes;
	private final Set<Pair<Node, Node>> changedNodes;
	private final Set<Pair<Node, Node>> unchangedNodes;
	private final Set<Node> removedNodes;

	public CompareTwoTreeResult(Set<Node> addedNodes, Set<Pair<Node, Node>> changedNodes, Set<Pair<Node, Node>> unchangedNodes, Set<Node> removedNodes) {
		this.addedNodes = addedNodes;
		this.changedNodes = changedNodes;
		this.unchangedNodes = unchangedNodes;
		this.removedNodes = removedNodes;
	}

	public Set<Node> getChangeSet() {
		Set<Node> result = new HashSet<>();
		for (Pair<Node, Node> object : this.changedNodes) {
			result.add(object.getB());
		}
		result.addAll(this.addedNodes);
		return result;
	}


	public Set<Node> getAddedNodes() {
		return addedNodes;
	}

	public Set<Pair<Node, Node>> getChangedNodes() {
		return changedNodes;
	}

	public Set<Pair<Node, Node>> getUnchangedNodes() {
		return unchangedNodes;
	}

	public Set<Node> getRemovedNodes() {
		return removedNodes;
	}
}
