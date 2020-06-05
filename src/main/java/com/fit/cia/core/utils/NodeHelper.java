package com.fit.cia.core.utils;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.java.JavaElementNode;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.List;

public class NodeHelper {

	private static final Logger logger = LogManager.getLogger(NodeHelper.class);

	public static Node getRoot(Node node) {
		if (node == null || node.getParent() == null) return node;
		else return getRoot(node.getParent());
	}

	/**
	 * Collect positive dependencies of current node except DataDependency type
	 *
	 * @param node
	 * @return
	 */
	public static List<Dependency> collectPositiveDependencies(Node node) {
		List<Dependency> positiveDependencies = new ArrayList<>();
		for (Dependency d : node.getDependencies()) {
			if (d.getFromNode().equals(node)) {
				positiveDependencies.add(d);
			}
		}

		return positiveDependencies;
	}

	/**
	 * Collect all positive dependencies of current node and its children
	 *
	 * @param rootNode
	 * @return
	 */
	public static List<Dependency> collectOriginalScopeDependencies(Node rootNode) {
		List<Dependency> dependencyList = new ArrayList<>();
		if (rootNode == null) return dependencyList;

		//TODO: replace this by collectPositiveDependencies()
		List<Dependency> rootDependencies = rootNode.getDependencies();
		for (Dependency dependency : rootDependencies) {
			if (dependency.getFromNode().equals(rootNode)) {
				dependencyList.add(dependency);
			}
		}

		for (Node child : rootNode.getChildren()) {
			List<Dependency> childDependencies = collectOriginalScopeDependencies(child);
			dependencyList.addAll(childDependencies);
		}
		return dependencyList;
	}

	public static Dependency getDependencyBetweenTwoNode(Node caller, Node callee) {
		if (caller == null || callee == null) return null;
		List<Dependency> dependencyList = collectOriginalScopeDependencies(caller);
		for (Dependency d : dependencyList) {
			if (d.getToNode().equals(callee))
				return d;
		}
		return null;
	}

	public static List<Dependency> collectAllNegativeDependencies(Node rootNode) {
		List<Dependency> dependencyList = new ArrayList<>();
		if (rootNode == null) return dependencyList;

		List<Dependency> rootDependencies = rootNode.getDependencies();
		for (Dependency dependency : rootDependencies) {
			if (dependency.getToNode().equals(rootNode)) {
				dependencyList.add(dependency);
			}
		}

		for (Node child : rootNode.getChildren()) {
			List<Dependency> childDependencies = collectAllNegativeDependencies(child);
			dependencyList.addAll(childDependencies);
		}
		return dependencyList;
	}

	/**
	 * Collect all dependencies of a tree
	 *
	 * @param rootNode
	 * @return
	 */
	public static List<Dependency> collectDependencies(Node rootNode) {
		return collectOriginalScopeDependencies(rootNode);
	}

	public static List<Dependency> collectAllPosibleDependencies(Node node) {
		List<Dependency> dependencyList = new ArrayList<>();
		if (node == null) return dependencyList;

		//TODO: replace this by collectPositiveDependencies()
		dependencyList.addAll(node.getDependencies());
		for (Node child : node.getChildren()) {
			//logger.debug("Collect in " + child.getAbsolutedPath());
			List<Dependency> childDependencies = collectAllPosibleDependencies(child);
			dependencyList.addAll(childDependencies);
		}
		return dependencyList;
	}

	//    /**
//     * Collect all positive dependencies of current node and its children...but
//     * if current node is file/db table, remove all its children's dependencies and then add
//     * them to its directly dependencies list
//     * @param rootNode
//     * @return
//     */
//    public static List<Dependency> collectFileTableScopeDependencies(Node rootNode) {
//        List<Dependency> dependencyList = new ArrayList<>();
//        if (rootNode == null) return dependencyList;
//
//        if (rootNode instanceof FileNode || rootNode instanceof DatabaseTableNode) {
//            List<Dependency> allDependencies = collectOriginalScopeDependencies(rootNode);
//            for (Dependency d : allDependencies) {
//                Node fileCaller = getFileAndTableScopedNode(d.getCaller());
//                Node fileCallee = getFileAndTableScopedNode(d.getCallee());
//                if (!fileCaller.equals(fileCallee)) {
//                    if (!fileCaller.equals(d.getCaller())) {
//                        d.getCaller().getDependencies().remove(d);
//                        d.setCaller(fileCaller);
//                        fileCaller.addDependency(d);
//                    }
//                    if (!fileCaller.equals(d.getCallee())) {
//                        d.getCallee().getDependencies().remove(d);
//                        d.setCallee(fileCallee);
//                        fileCallee.addDependency(d);
//                    }
//                    dependencyList.add(d);
//                } else { // fileCaller and fileCallee is the same
//                    d.getCaller().getDependencies().remove(d);
//                    d.getCallee().getDependencies().remove(d);
//                }
//            }
//            return dependencyList; // ignore children nodes of file/table
//        } else if (rootNode instanceof DirectoryNode) {
//            for (Node child : rootNode.getChildren()) {
//                List<Dependency> childDependencies = collectFileTableScopeDependencies(child);
//                dependencyList.addAll(childDependencies);
//            }
//        }
//        return dependencyList;
//    }
	public static Node getFileAndTableScopedNode(Node node) {
		if (node instanceof JavaElementNode /*|| node instanceof XmlTagNode || node instanceof JspTagNode*/) {
			node = getFileNode(node);
		} /*else if (node instanceof DatabaseColumnNode) {
            node = getTableNode(node);
        }*/
		return node;
	}

	public static Node getClassAndTableScopeNode(Node node) {
		if (node instanceof JavaElementNode)
			node = getClassNode(node);
//        else if (node instanceof XmlTagNode || node instanceof JspTagNode)
//            node = getFileNode(node);
//        else if (node instanceof DatabaseColumnNode) {
//            node = getTableNode(node);
//        }
		return node;
	}


	public static Node getFileNode(Node node) {
		if (node == null || node instanceof FileNode)
			return node;
		else return getFileNode(node.getParent());
	}

	public static Node getClassNode(Node node) {
		if (node == null || node instanceof JavaClassNode)
			return node;
		else if (node instanceof FileNode) {
			for (Node child : node.getChildren())
				return getClassNode(child);
		}
		return getClassNode(node.getParent());
	}

//    public static Node getFileAndTableScopedNode(Node node) {
//        if (node instanceof JavaElementNode || node instanceof XmlTagNode || node instanceof JspTagNode) {
//            node = getFileNode(node);
//        } else if (node instanceof DatabaseColumnNode) {
//            node = getTableNode(node);
//        }
//        return node;
//    }
//
//    public static Node getClassAndTableScopeNode(Node node) {
//        if (node instanceof JavaElementNode)
//            node = getClassNode(node);
//        else if (node instanceof XmlTagNode || node instanceof JspTagNode)
//            node = getFileNode(node);
//        else if (node instanceof DatabaseColumnNode) {
//            node = getTableNode(node);
//        }
//        return node;
//    }

	public static Node replaceNode(Node oldNode, Node newNode) {
		Node parent = oldNode.getParent();
		if (parent == null) return oldNode;
		List<Node> children = parent.getChildren();
		int pos = children.indexOf(oldNode);
		children.set(pos, newNode);
		return newNode;
	}

}
