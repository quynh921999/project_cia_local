package com.fit.cia.web.converter;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.diff.CompareTwoTreeResult;
import com.fit.cia.core.search.JsonNodeSearch;
import com.fit.cia.core.treemodel.DirectoryNode;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.ProjectNode;
import com.fit.cia.core.treemodel.java.JavaAbstractableNode;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.java.JavaElementNode;
import com.fit.cia.core.treemodel.java.JavaFieldNode;
import com.fit.cia.core.treemodel.java.JavaMethodNode;
import com.fit.cia.core.treemodel.java.JavaVisibleNode;
import com.fit.cia.core.treemodel.json.constant.JsonChange;
import com.fit.cia.core.treemodel.json.dependency.DependencyMapping;
import com.fit.cia.core.treemodel.json.dependency.JsonDependencyNode;
import com.fit.cia.core.treemodel.json.dom.JsonDirectoryNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaAbstractableNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaClassNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaElementNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaFieldNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaFileNode;
import com.fit.cia.core.treemodel.json.dom.JsonJavaMethodNode;
import com.fit.cia.core.treemodel.json.dom.JsonNode;
import com.fit.cia.core.treemodel.json.dom.JsonProjectNode;
import com.fit.cia.core.utils.NodeHelper;
import mrmathami.util.Pair;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class JsonConverterImpl implements IJsonConverter {

	private static final Logger logger = LogManager.getLogger(JsonConverterImpl.class);
	protected JsonNode jsonNode;
	protected Node projectNode;
	protected List<JsonDependencyNode> jsonDependencyNodes = new ArrayList<>();

	public static boolean checkParentInList(Node node, Set<Node> deletedNodes) {
		Node parentNode = node.getParent();
		if (parentNode != null) {
			for (Node deletedNode : deletedNodes) {
				if (parentNode.getId() == deletedNode.getId()) return true;
			}
			return false;
		}
		return false;
	}

	public static int getNewNodeId_In_NoChangeList_If_Exist(int originNodeId, Set<Pair<Node, Node>> unchangedNodes) {
		for (Pair<Node, Node> object : unchangedNodes) {
			if (object.getA().getId() == originNodeId) {
				return object.getB().getId();
			}
		}
		return -1;
	}

	public static int getNewNodeId_In_ChangeList_If_Exist(int originNodeId, Set<Pair<Node, Node>> changedNodes) {
		for (Pair<Node, Node> object : changedNodes) {
			if (object.getA().getId() == originNodeId) {
				return object.getB().getId();
			}
		}
		return -1;
	}

	@Override
	public int dependencyCount() {
		int count = 0;
		for (JsonDependencyNode dependencyNode : jsonDependencyNodes) {
			count += dependencyNode.getDependencyMappingList().size();
		}
		return count;
	}

	@Override
	public void convert(Node projectNode) {
		this.projectNode = projectNode;
		this.jsonNode = traverse(projectNode);
	}

	public void convertAndSetChange(Node projectNode, CompareTwoTreeResult compareTwoTreeResult) {
		this.projectNode = projectNode;

		//set ADD and CHANGE
		this.jsonNode = traverseSetChangeMethod(projectNode, compareTwoTreeResult);

		//set DELETE
		//TODO
		Set<Pair<Node, Node>> sames = compareTwoTreeResult.getUnchangedNodes();
		Set<Node> deletedNodes = compareTwoTreeResult.getRemovedNodes();
		Set<Pair<Node, Node>> changedNodes = compareTwoTreeResult.getChangedNodes();
		deletedNodes = handleDeleteObjects(deletedNodes);

		for (Node originNode : deletedNodes) {
			Node parentNode = originNode.getParent();
			int parentId = 0;
			if (parentNode != null) parentId = parentNode.getId();
			if (parentId == 0) continue;
			int parentId_In_NewTree = getNewNodeId_In_NoChangeList_If_Exist(parentId, sames);
			if (parentId_In_NewTree != -1) {
				//TODO thêm node bị xóa vào jsonNode có id = parentId_In_NewTree
				JsonNode newParentJsonNode = JsonNodeSearch.searchById(this.jsonNode, parentId_In_NewTree);
				if (newParentJsonNode != null) {
					JsonNode deleteOldJsonNode = traverseAndSetDeleteMethod(originNode);
					if (deleteOldJsonNode != null) {
						deleteOldJsonNode.setId(-originNode.getId());
						newParentJsonNode.addChild(deleteOldJsonNode);

						JsonDependencyNode dependencyNode = new JsonDependencyNode();
						dependencyNode.setCallerId(parentId_In_NewTree);
						DependencyMapping dependencyMapping = new DependencyMapping();
						dependencyMapping.setCalleeId(deleteOldJsonNode.getId());
						dependencyMapping.setTypeDependency("MemberDependency");
						dependencyMapping.setCount(1);
						dependencyMapping.setWeight(0.0f);
						dependencyNode.addMapping(dependencyMapping);
						jsonDependencyNodes.add(dependencyNode);
					}

				}
			} else {
				//TODO thêm node bị xóa vào jsonNode có id = parentId_In_NewTree
				parentId_In_NewTree = getNewNodeId_In_ChangeList_If_Exist(parentId, changedNodes);
				if (parentId_In_NewTree != 1) {
					JsonNode newParentJsonNode = JsonNodeSearch.searchById(this.jsonNode, parentId_In_NewTree);
					if (newParentJsonNode != null) {
						JsonNode deleteOldJsonNode = traverseAndSetDeleteMethod(originNode);
						deleteOldJsonNode.setId(-originNode.getId());
						newParentJsonNode.addChild(deleteOldJsonNode);

						JsonDependencyNode dependencyNode = new JsonDependencyNode();
						dependencyNode.setCallerId(parentId_In_NewTree);
						DependencyMapping dependencyMapping = new DependencyMapping();
						dependencyMapping.setCalleeId(deleteOldJsonNode.getId());
						dependencyMapping.setTypeDependency("MemberDependency");
						dependencyMapping.setCount(1);
						dependencyMapping.setWeight(0.0f);
						dependencyNode.addMapping(dependencyMapping);
						jsonDependencyNodes.add(dependencyNode);
					}
				} else {
					logger.debug("Cant found parent node of Node " + originNode.getName());
				}
			}
		}

	}

	public Set<Node> handleDeleteObjects(Set<Node> arrays) {
		Set<Node> temp = new HashSet<>();
		for (Node object : arrays) {
			if (!checkParentInList(object, arrays)) {
				temp.add(object);
			}
		}
		return temp;
	}

	public JsonNode traverseSetChangeMethod(Node rootNode, CompareTwoTreeResult compareTwoTreeResult) {
		if (rootNode == null) return null;
		JsonNode jsonNode;

		if (rootNode instanceof ProjectNode) {
			jsonNode = new JsonProjectNode();
		} else if (rootNode instanceof DirectoryNode) {
			if (checkSourceDirectory(rootNode)) {
				jsonNode = new JsonDirectoryNode();
			} else return null;
		} else if (rootNode instanceof FileNode) {
			jsonNode = new JsonJavaFileNode();
		} else if (rootNode instanceof JavaElementNode) {
			JsonJavaElementNode jsonJavaElementNode = null;
			if (rootNode instanceof JavaAbstractableNode) {
				JsonJavaAbstractableNode jsonAbstractableElementNode = null;
				if (rootNode instanceof JavaClassNode) {
					JsonJavaClassNode jsonClassNode = new JsonJavaClassNode();

					jsonClassNode.setInterface(((JavaClassNode) rootNode).isInterface());
					jsonClassNode.setNumOfMethod(((JavaClassNode) rootNode).getNumOfMethod());
					jsonClassNode.setNumOfVariable(((JavaClassNode) rootNode).getNumOfVariable());
					jsonAbstractableElementNode = jsonClassNode;

				} else if (rootNode instanceof JavaMethodNode) {
					JsonJavaMethodNode jsonMethodNode = new JsonJavaMethodNode();
					jsonMethodNode.setName(rootNode.getName());
					jsonMethodNode.setReturnType(((JavaMethodNode) rootNode).getReturnType());
					jsonAbstractableElementNode = jsonMethodNode;
				}
				jsonAbstractableElementNode.setAbstract(((JavaAbstractableNode) rootNode).isAbstract());
				jsonJavaElementNode = jsonAbstractableElementNode;
			} else if (rootNode instanceof JavaFieldNode) {
				JsonJavaFieldNode jsonFieldNode = new JsonJavaFieldNode();
				jsonFieldNode.setType(((JavaFieldNode) rootNode).getType());
				jsonJavaElementNode = jsonFieldNode;
			}

			jsonJavaElementNode.setFinal(((JavaElementNode) rootNode).isFinal());
			jsonJavaElementNode.setStatic(((JavaVisibleNode) rootNode).isStatic());
			String visibility = ((JavaVisibleNode) rootNode).getVisibility().toString();
			if (visibility != null) jsonJavaElementNode.setVisibility(visibility);

			JavaElementNode javaElementNode = (JavaElementNode) rootNode;

//			// set start & end positions for json java node
//			JsonJavaElementNode.NodePosition startPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getStartPosition().getLineNumber(),
//					javaElementNode.getStartPosition().getColumnNumber());
//			JsonJavaElementNode.NodePosition endPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getEndPosition().getLineNumber(),
//					javaElementNode.getEndPosition().getColumnNumber());
//
//			jsonJavaElementNode.setStartPosition(startPos);
//			jsonJavaElementNode.setEndPosition(endPos);

			// assignment
			jsonNode = jsonJavaElementNode;
		} else {
			return null;
		}

		if ((rootNode instanceof JavaMethodNode) && rootNode.getName() != null) {
			int index = rootNode.getName().indexOf("(");
			if (index != -1) jsonNode.setName(rootNode.getName().substring(0, index));
		} else jsonNode.setName(rootNode.getName());

		jsonNode.setId(rootNode.getId());
		jsonNode.setHasDependency(rootNode.getDependencies().size() > 0);
		jsonNode.setWeight(rootNode.getWeight());
		if (jsonNode instanceof JsonJavaFieldNode || jsonNode instanceof JsonJavaMethodNode || jsonNode instanceof JsonJavaClassNode) {
			jsonNode.defineChangeMethod(compareTwoTreeResult);
		}

		for (Node childNode : rootNode.getChildren()) {
			JsonNode jsonChildNode = traverseSetChangeMethod(childNode, compareTwoTreeResult);
			if (jsonChildNode != null) {
				jsonNode.setHasChildren(true);
				jsonNode.addChild(jsonChildNode);
				jsonChildNode.setParent(jsonNode);
			}
		}

		JsonDependencyNode dependencyNode = generateJsonDependencyNode(rootNode);
		if (dependencyNode != null) {
			jsonDependencyNodes.add(dependencyNode);
		}

		return jsonNode;
	}

	public JsonNode traverseAndSetDeleteMethod(Node rootNode) {
		if (rootNode == null) return null;
		JsonNode jsonNode;

		if (rootNode instanceof ProjectNode) {
			jsonNode = new JsonProjectNode();
		} else if (rootNode instanceof DirectoryNode) {
			if (checkSourceDirectory(rootNode)) {
				jsonNode = new JsonDirectoryNode();
			} else return null;
		} else if (rootNode instanceof FileNode) {
			jsonNode = new JsonJavaFileNode();
		} else if (rootNode instanceof JavaElementNode) {
			JsonJavaElementNode jsonJavaElementNode = null;
			if (rootNode instanceof JavaAbstractableNode) {
				JsonJavaAbstractableNode jsonAbstractableElementNode = null;
				if (rootNode instanceof JavaClassNode) {
					JsonJavaClassNode jsonClassNode = new JsonJavaClassNode();

					jsonClassNode.setInterface(((JavaClassNode) rootNode).isInterface());
					jsonClassNode.setNumOfMethod(((JavaClassNode) rootNode).getNumOfMethod());
					jsonClassNode.setNumOfVariable(((JavaClassNode) rootNode).getNumOfVariable());
					jsonAbstractableElementNode = jsonClassNode;
				} else if (rootNode instanceof JavaMethodNode) {
					JsonJavaMethodNode jsonMethodNode = new JsonJavaMethodNode();
					//JavaMethodNode methodNode = (JavaMethodNode) rootNode;
					jsonMethodNode.setName(rootNode.getName());
					jsonMethodNode.setReturnType(((JavaMethodNode) rootNode).getReturnType());

//                    jsonMethodNode.setParameterNodeList(convertParametersToJsonObject(methodNode.getParameters()));
					jsonAbstractableElementNode = jsonMethodNode;
				}
				jsonAbstractableElementNode.setAbstract(((JavaAbstractableNode) rootNode).isAbstract());
				jsonJavaElementNode = jsonAbstractableElementNode;
			} else if (rootNode instanceof JavaFieldNode) {
				JsonJavaFieldNode jsonFieldNode = new JsonJavaFieldNode();
				jsonFieldNode.setType(((JavaFieldNode) rootNode).getType());
				jsonJavaElementNode = jsonFieldNode;
			}

			jsonJavaElementNode.setFinal(((JavaElementNode) rootNode).isFinal());
			jsonJavaElementNode.setStatic(((JavaVisibleNode) rootNode).isStatic());
			String visibility = ((JavaVisibleNode) rootNode).getVisibility().toString();
			if (visibility != null) jsonJavaElementNode.setVisibility(visibility);

			JavaElementNode javaElementNode = (JavaElementNode) rootNode;

//			// set start & end positions for json java node
//			JsonJavaElementNode.NodePosition startPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getStartPosition().getLineNumber(),
//					javaElementNode.getStartPosition().getColumnNumber());
//			JsonJavaElementNode.NodePosition endPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getEndPosition().getLineNumber(),
//					javaElementNode.getEndPosition().getColumnNumber());
//
//			jsonJavaElementNode.setStartPosition(startPos);
//			jsonJavaElementNode.setEndPosition(endPos);

			// assignment
			jsonNode = jsonJavaElementNode;
		} else {
			return null;
		}

		if ((rootNode instanceof JavaMethodNode) && rootNode.getName() != null) {
			int index = rootNode.getName().indexOf("(");
			if (index != -1) jsonNode.setName(rootNode.getName().substring(0, index));
		} else jsonNode.setName(rootNode.getName());

		jsonNode.setId(-rootNode.getId());
		jsonNode.setHasDependency(rootNode.getDependencies().size() > 0);
		jsonNode.setWeight(rootNode.getWeight());
		jsonNode.setChange(JsonChange.REMOVED);

		for (Node childNode : rootNode.getChildren()) {
			JsonNode jsonChildNode = traverseAndSetDeleteMethod(childNode);
			jsonChildNode.setId(-childNode.getId());
			jsonNode.setHasChildren(true);
			jsonNode.addChild(jsonChildNode);
			jsonChildNode.setParent(jsonNode);
		}


		JsonDependencyNode dependencyNode = generateJsonDependencyNode(rootNode);
		if (dependencyNode != null) {
			jsonDependencyNodes.add(dependencyNode);
		}

		return jsonNode;
	}

	public JsonNode traverse(Node rootNode) {
		if (rootNode == null) return null;
		JsonNode jsonNode;

		if (rootNode instanceof ProjectNode) {
			jsonNode = new JsonProjectNode();
		} else if (rootNode instanceof DirectoryNode) {
			if (!checkSourceDirectory(rootNode)) return null;
			jsonNode = new JsonDirectoryNode();
		} else if (rootNode instanceof FileNode) {
			jsonNode = new JsonJavaFileNode();
		} else if (rootNode instanceof JavaElementNode) {
			JsonJavaElementNode jsonJavaElementNode = null;
			if (rootNode instanceof JavaAbstractableNode) {
				JsonJavaAbstractableNode jsonAbstractableElementNode = null;
				if (rootNode instanceof JavaClassNode) {
					JsonJavaClassNode jsonClassNode = new JsonJavaClassNode();

					jsonClassNode.setInterface(((JavaClassNode) rootNode).isInterface());
					jsonClassNode.setNumOfMethod(((JavaClassNode) rootNode).getNumOfMethod());
					jsonClassNode.setNumOfVariable(((JavaClassNode) rootNode).getNumOfVariable());
					jsonAbstractableElementNode = jsonClassNode;
				} else if (rootNode instanceof JavaMethodNode) {
					JsonJavaMethodNode jsonMethodNode = new JsonJavaMethodNode();
					//JavaMethodNode methodNode = (JavaMethodNode) rootNode;
					jsonMethodNode.setName(rootNode.getName());
					jsonMethodNode.setReturnType(((JavaMethodNode) rootNode).getReturnType());

//                    jsonMethodNode.setParameterNodeList(convertParametersToJsonObject(methodNode.getParameters()));
					jsonAbstractableElementNode = jsonMethodNode;
				}
				jsonAbstractableElementNode.setAbstract(((JavaAbstractableNode) rootNode).isAbstract());
				jsonJavaElementNode = jsonAbstractableElementNode;
			} else if (rootNode instanceof JavaFieldNode) {
				JsonJavaFieldNode jsonFieldNode = new JsonJavaFieldNode();
				jsonFieldNode.setType(((JavaFieldNode) rootNode).getType());
				jsonJavaElementNode = jsonFieldNode;
			}

			jsonJavaElementNode.setFinal(((JavaElementNode) rootNode).isFinal());
			jsonJavaElementNode.setStatic(((JavaVisibleNode) rootNode).isStatic());
			String visibility = ((JavaVisibleNode) rootNode).getVisibility().toString();
			if (visibility != null) jsonJavaElementNode.setVisibility(visibility);

			JavaElementNode javaElementNode = (JavaElementNode) rootNode;

//			// set start & end positions for json java node
//			JsonJavaElementNode.NodePosition startPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getStartPosition().getLineNumber(),
//					javaElementNode.getStartPosition().getColumnNumber());
//			JsonJavaElementNode.NodePosition endPos = new JsonJavaElementNode.NodePosition(
//					javaElementNode.getEndPosition().getLineNumber(),
//					javaElementNode.getEndPosition().getColumnNumber());
//
//			jsonJavaElementNode.setStartPosition(startPos);
//			jsonJavaElementNode.setEndPosition(endPos);

			// assignment
			jsonNode = jsonJavaElementNode;
		} else {
			return null;
		}

		if ((rootNode instanceof JavaMethodNode) && rootNode.getName() != null) {
			int index = rootNode.getName().indexOf("(");
			if (index != -1) jsonNode.setName(rootNode.getName().substring(0, index));
		} else jsonNode.setName(rootNode.getName());

		jsonNode.setId(rootNode.getId());
		jsonNode.setHasDependency(rootNode.getDependencies().size() > 0);
		jsonNode.setWeight(rootNode.getWeight());

		for (Node childNode : rootNode.getChildren()) {
			JsonNode jsonChildNode = traverse(childNode);
			if (jsonChildNode != null) {
				jsonNode.setHasChildren(true);
				jsonNode.addChild(jsonChildNode);
				jsonChildNode.setParent(jsonNode);
			}
		}

		JsonDependencyNode dependencyNode = generateJsonDependencyNode(rootNode);
		if (dependencyNode != null) {
			jsonDependencyNodes.add(dependencyNode);
		}

		return jsonNode;
	}


	protected boolean checkSourceDirectory(Node rootNode) {
		for (Node c : rootNode.getChildren()) {
			if (c instanceof FileNode) return true;
			if (c instanceof DirectoryNode) {
				if (checkSourceDirectory(c)) return true;
			}
		}
		return false;
	}

	/**
	 * generate dependency node to client from server data
	 *
	 * @param node
	 * @return
	 */
	protected JsonDependencyNode generateJsonDependencyNode(Node node) {
		JsonDependencyNode jsonDependencyNode = new JsonDependencyNode();
		jsonDependencyNode.setCallerId(node.getId());

		// collect all positive dependencies of current node
		List<Dependency> positiveDependencies = NodeHelper.collectPositiveDependencies(node);

		for (Dependency d : positiveDependencies) {
			Node caller = d.getFromNode();
			Node callee = d.getToNode();
			if (caller != null && callee != null) {
				DependencyMapping mapping = new DependencyMapping();
				mapping.setCalleeId(callee.getId());
				mapping.setTypeDependency(d.getClass().getSimpleName());
				mapping.setCount(1);
				mapping.setWeight(d.getWeight());
				jsonDependencyNode.addMapping(mapping);
			}
		}
		return jsonDependencyNode.getDependencyMappingList().size() != 0 ? jsonDependencyNode : null;
	}

	@Override
	public void trackIncludeIds(JsonNode rootNode) {
		List<Integer> ids = new ArrayList<>();
		doGetParentIds(rootNode, ids);
	}

	/**
	 * Recursive get all parents ids for every single node
	 *
	 * @param node
	 */
	protected void doGetParentIds(JsonNode node, List<Integer> ids) {
		// set parents ids for current node
		node.addIncludeIds(ids);

		// add id of current node to list
		ids.add(node.getId());

		for (JsonNode child : node.getChildren()) {
			doGetParentIds(child, ids);
		}

		// remove id from list
		ids.remove(Integer.valueOf(node.getId()));
	}

	protected List<Integer> getAllParentIds(JsonNode rootNode) {
		ArrayList<Integer> ids = new ArrayList<>();
		if (rootNode == null)
			return ids;
		JsonNode currentNode = rootNode.getParent();
		while (currentNode != null) {
			ids.add(rootNode.getId());
			currentNode = currentNode.getParent();
		}

		return ids;
	}

	public JsonNode getJsonNode() {
		return jsonNode;
	}

	public List<JsonDependencyNode> getJsonDependencyNodes() {
		return jsonDependencyNodes;
	}
}
