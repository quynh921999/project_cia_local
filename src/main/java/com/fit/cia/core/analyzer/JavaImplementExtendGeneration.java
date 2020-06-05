package com.fit.cia.core.analyzer;

import com.fit.cia.core.dependency.ExtensionDependency;
import com.fit.cia.core.dependency.ImplementationDependency;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.ITypeBinding;
import org.eclipse.jdt.core.dom.Type;
import org.eclipse.jdt.core.dom.TypeDeclaration;

import java.util.Map;

public final class JavaImplementExtendGeneration {
	private JavaImplementExtendGeneration() {
	}

	public static void buildDependency(JavaClassNode classNode, Map<String, Node> jdtKeyNodeIdMap) {
		classNode.getAstNode().accept(new ASTVisitor() {
			@Override
			public boolean visit(TypeDeclaration node) {
				// super class
				Type superClassType = node.getSuperclassType();

				if (superClassType != null) {
					ITypeBinding binding = superClassType.resolveBinding();
					if (binding != null) {
						String bindingKey = binding.getKey();
						Node superClassNode = jdtKeyNodeIdMap.get(bindingKey);
						if (superClassNode != null) {
							generateExtDependency(classNode, superClassNode);
						}
					}
				}

				// super interfaces
				for (Object object : node.superInterfaceTypes()) {
					if (object instanceof Type) {
						Type superInterface = (Type) object;
						ITypeBinding binding = superInterface.resolveBinding();
						if (binding != null) {
							String bindingKey = binding.getKey();
							Node superInterfaceNode = jdtKeyNodeIdMap.get(bindingKey);
							if (superInterfaceNode != null) {
								if (!node.isInterface()) {
									generateImplDependency(classNode, superInterfaceNode);
								} else {
									generateExtDependency(classNode, superInterfaceNode);
								}
							}
						}
					}
				}
				return true;
			}
		});
	}

	private static void generateImplDependency(Node deriveNode, Node parentNode) {
		new ImplementationDependency(deriveNode, parentNode);
	}

	private static void generateExtDependency(Node deriveNode, Node parentNode) {
		new ExtensionDependency(deriveNode, parentNode);
	}
}
