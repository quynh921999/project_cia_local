package com.fit.cia.web.api;

import com.fit.cia.core.search.JsonNodeSearch;
import com.fit.cia.core.treemodel.json.constant.JsonChange;
import com.fit.cia.core.treemodel.json.constant.JsonKind;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.utils.JsonHelper;
import com.fit.cia.utils.CiaNotFoundException;
import com.fit.cia.web.api.response.DataResponse;
import com.fit.cia.web.api.response.ErrorResponse;
import com.fit.cia.web.api.response.IncludeIdsResponse;
import com.fit.cia.web.api.response.RestResponse;
import com.fit.cia.web.controller.ControllerUtils;
import com.rits.cloning.Cloner;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.fit.cia.core.utils.JsonUtils.refineFolderHierarchy;
import static com.fit.cia.core.utils.JsonUtils.removeRedundantNodes;
import static com.fit.cia.core.utils.JsonUtils.setSearchedFlags;
import static com.fit.cia.core.utils.JsonUtils.validateChildrenInNode;

@RestController
@RequestMapping("/tree")
public class TreeAPI {
	private final Cloner cloner;

	public TreeAPI(Cloner cloner) {
		this.cloner = cloner;
	}

	protected JsonNode getTreeFromSession() {
		return (JsonNode) ControllerUtils.getSession(ControllerUtils.CLIENT_TREE_SESSION_KEY);
	}

	protected List<JsonDependencyNode> getDependenciesFromSession() {
		return (List<JsonDependencyNode>) ControllerUtils.getSession(ControllerUtils.CLIENT_DEPENDENCY_SESSION_KEY);
	}

	public ErrorResponse buildNotAvailableTreeError() {
		return new ErrorResponse("client tree is not available, new uploading or history restoring required");
	}

	@RequestMapping(path = "/load/{id}", method = RequestMethod.GET)
	public String loadData(@PathVariable int id) {
		// get client tree if needed
		JsonNode clientTree = getTreeFromSession();
		JsonNode searchedNode = JsonNodeSearch.searchById(clientTree, id);
		// return null when node not found or node doesn't contain any children
		if (searchedNode == null || searchedNode.getChildren().size() == 0) {
			return null;
		}

		JsonNode parentNode = cloner.shallowClone(searchedNode);
		if (parentNode instanceof JsonNode) {
			refineFolderHierarchy(parentNode);
		}
		return JsonHelper.getInstance().getJson(parentNode);
	}

	@RequestMapping(path = "/getAllDependencies", method = RequestMethod.GET)
	public RestResponse getAllDependencies() {
		try {
			List<JsonDependencyNode> dependencyList = getDependenciesFromSession();
			if (dependencyList == null) {
				return buildNotAvailableTreeError();
			}
			return new DataResponse(dependencyList);

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/getRootNodeData", method = RequestMethod.GET)
	public RestResponse getRootNodeData() {
		try {
			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) {
				return buildNotAvailableTreeError();
			}

			JsonNode rootNode = cloner.shallowClone(clientTree);
			if (rootNode instanceof JsonNode) {
				refineFolderHierarchy(rootNode);
			}
			return new DataResponse(rootNode);

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/getAllNodes", method = RequestMethod.GET)
	public RestResponse getAllNodes() {
		try {
			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) {
				return buildNotAvailableTreeError();
			}

			ArrayList<JsonNode> nodes = new ArrayList<>();
			JsonNode rootNode = cloner.shallowClone(clientTree);
			ArrayList<JsonNode> children = getAllChildren(rootNode);
			for (JsonNode child : children) {
				if (child.getKind().equals(JsonKind.CLASS) || child.getKind().equals(JsonKind.METHOD) || child.getKind().equals(JsonKind.ATTRIBUTE)) {
					nodes.add(child);
				}
			}

			return new DataResponse(nodes);

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	private ArrayList<JsonNode> getAllChildren(JsonNode node) {
		ArrayList<JsonNode> results = new ArrayList<>();
		for (JsonNode n : node.getChildren()) {
			results.add(n);
			results.addAll(getAllChildren(n));
		}
		return results;
	}

	@RequestMapping(path = "/getNodeData/{nodeId}", method = RequestMethod.GET)
	public RestResponse getNodeData(@PathVariable int nodeId) {
		try {
			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) {
				return buildNotAvailableTreeError();
			}

			JsonNode searchedNode = JsonNodeSearch.searchById(clientTree, nodeId);

			// return null when node not found or node doesn't contain any children
			if (searchedNode == null || searchedNode.getChildren().size() == 0) {
				throw new CiaNotFoundException(String.format("node [%s] not found or node is leaf", nodeId));
			}

			JsonNode parentNode = cloner.shallowClone(searchedNode);
			if (parentNode != null) {
				refineFolderHierarchy(parentNode);
			}

			return new DataResponse(parentNode);

		} catch (CiaNotFoundException e) {
			return new ErrorResponse("node not found or node is leaf");

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/getAllIncludeIds", method = RequestMethod.GET)
	public RestResponse getAllIncludeIds() {
		try {
			JsonNode clientTree = getTreeFromSession();
			List<JsonDependencyNode> dependencyList = getDependenciesFromSession();
			if (clientTree == null || dependencyList == null) {
				return buildNotAvailableTreeError();
			}
			Set<IncludeIdsResponse> idsResponse = doGetAllIncludeIds(clientTree, dependencyList);
			return new DataResponse(idsResponse);

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/getIncludeIds/{nodeId}", method = RequestMethod.GET)
	public RestResponse getIncludeIdsByNodeId(@PathVariable int nodeId) {
		try {
			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) {
				return buildNotAvailableTreeError();
			}

			List<Integer> includeIds = getIncludeIdsByNodeId(clientTree, nodeId);
			return (includeIds != null) ? new DataResponse(includeIds) : new ErrorResponse("nodeId not found");

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/searchNodeByName", method = RequestMethod.GET)
	public RestResponse searchNodeByName(@RequestParam String keyword) {
		try {
			if (keyword == null || "".equals(keyword)) {
				return new ErrorResponse("node name must not be empty");
			}

			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) {
				return buildNotAvailableTreeError();
			}

			// create a new branch whose root is root of the tree
			JsonNode resultBranch = cloner.deepClone(clientTree);

			List<JsonNode> searchedNodes = JsonNodeSearch.searchFileNodeByName(resultBranch, keyword);
			if (searchedNodes.size() > 0) {
				for (JsonNode child : searchedNodes) {
					setSearchedFlags(child);
				}

				removeRedundantNodes(resultBranch);
				if (resultBranch != null) {
					validateChildrenInNode(resultBranch);
					return new DataResponse("Found " + searchedNodes.size() + " file containing \"" + keyword + "\"", resultBranch);
				} else

					return new ErrorResponse("Found 0 file containing \"" + keyword + "\"");
			} else

				return new ErrorResponse("Found 0 file containing \"" + keyword + "\"");

		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}

	@RequestMapping(path = "/getChangedNodes", method = RequestMethod.GET)
	public RestResponse getChangedNodes() {
		try {
			JsonNode clientTree = getTreeFromSession();
			if (clientTree == null) return buildNotAvailableTreeError();

			ArrayList<JsonNode> nodes = new ArrayList<>();
			ArrayList<JsonNode> changedNodes = new ArrayList<>();
			for (JsonNode child : getAllChildren(clientTree)) {
				if (child.getKind().equals(JsonKind.CLASS)
						|| child.getKind().equals(JsonKind.METHOD)
						|| child.getKind().equals(JsonKind.ATTRIBUTE)) {
					nodes.add(child);
					if (child.getChange().equals(JsonChange.CHANGED)
							|| child.getChange().equals(JsonChange.ADDED)
							|| child.getWeight() > 0) {
						changedNodes.add(child);
					}
				}
			}
			if (changedNodes.isEmpty()) changedNodes = nodes;
			changedNodes.sort((o1, o2) -> Float.compare(o2.getWeight(), o1.getWeight()));
			return new DataResponse(changedNodes);
		} catch (Exception e) {
			e.printStackTrace();
			return new ErrorResponse(null);
		}
	}


	protected Set<IncludeIdsResponse> doGetAllIncludeIds(JsonNode clientTree, List<JsonDependencyNode> dependencyList) {
		Map<Integer, IncludeIdsResponse> idMap = new HashMap<>();

		for (JsonDependencyNode dNode : dependencyList) {
			int positiveId = dNode.getCallerId();
			addIncludeIdsToMap(clientTree, positiveId, idMap);
			for (DependencyMapping dMapping : dNode.getDependencyMappingList()) {
				int negativeId = dMapping.getCalleeId();
				addIncludeIdsToMap(clientTree, negativeId, idMap);
			}
		}

		return new HashSet<>(idMap.values());
	}

	protected void addIncludeIdsToMap(JsonNode tree, int nodeId, Map<Integer, IncludeIdsResponse> idMap) {
		if (idMap.get(nodeId) == null) {
			List<Integer> includeIds = getIncludeIdsByNodeId(tree, nodeId);
			if (includeIds != null) {
				idMap.put(nodeId, new IncludeIdsResponse(nodeId, includeIds));
			}
		}
	}

	/**
	 * @param tree
	 * @param nodeId
	 * @return null if node not found
	 */
	protected List<Integer> getIncludeIdsByNodeId(JsonNode tree, int nodeId) {
		JsonNode foundNode = JsonNodeSearch.searchById(tree, nodeId);
		return foundNode != null ? foundNode.getIncludeIds() : null;
	}
}




