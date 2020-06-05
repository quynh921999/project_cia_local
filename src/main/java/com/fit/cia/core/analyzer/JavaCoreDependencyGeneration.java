package com.fit.cia.core.analyzer;

import com.fit.cia.core.dependency.Dependency;
import com.fit.cia.core.dependency.FieldAccessDependency;
import com.fit.cia.core.dependency.MethodInvocationDependency;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.java.JavaFieldNode;
import com.fit.cia.core.treemodel.java.JavaMethodNode;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.IBinding;
import org.eclipse.jdt.core.dom.SimpleName;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class JavaCoreDependencyGeneration {
	private JavaCoreDependencyGeneration() {
	}

	public static void buildDependency(JavaClassNode javaClassNode, Map<String, Node> jdtKeyNodeIdMap) {
		final List<Dependency> dependencies = new ArrayList<>();
		for (Node methodItem : javaClassNode.getChildren()) {
			if (methodItem instanceof JavaMethodNode) {
				ASTNode ast = ((JavaMethodNode) methodItem).getAstNode();
				if (ast != null) {
					final Node currentMethodNode = methodItem;
					ast.accept(new ASTVisitor() {
						@Override
						public boolean visit(SimpleName node) {
							IBinding binding = node.resolveBinding();
							if (binding != null) {
								String bindingKey = binding.getKey();
								Node toNode = jdtKeyNodeIdMap.get(bindingKey);
								if (toNode instanceof JavaMethodNode || toNode instanceof JavaFieldNode) {
									addToCallDependencies(dependencies, toNode, currentMethodNode);
								}
							}
							return super.visit(node);
						}
					});
				}
			}
		}
	}

	private static void addToCallDependencies(List<Dependency> dependencies, Node calleeMethodNode, Node callerMethodNode) {
		for (Dependency dependency : dependencies) {
			if (dependency.getToNode().equals(calleeMethodNode) && dependency.getFromNode().equals(callerMethodNode)) {
				return;
			}
		}
		if (calleeMethodNode instanceof JavaMethodNode) {
			dependencies.add(new MethodInvocationDependency(callerMethodNode, calleeMethodNode));
		} else if (calleeMethodNode instanceof JavaFieldNode) {
			dependencies.add(new FieldAccessDependency(callerMethodNode, calleeMethodNode));
		}
	}
}
