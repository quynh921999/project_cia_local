package com.fit.cia.core.parser;

import com.fit.cia.core.treemodel.CiaData;
import com.fit.cia.core.treemodel.FileNode;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.core.treemodel.java.JavaAbstractableNode;
import com.fit.cia.core.treemodel.java.JavaClassNode;
import com.fit.cia.core.treemodel.java.JavaElementNode;
import com.fit.cia.core.treemodel.java.JavaFieldNode;
import com.fit.cia.core.treemodel.java.JavaMethodNode;
import com.fit.cia.core.treemodel.java.JavaParameterNode;
import com.fit.cia.core.treemodel.java.JavaVisibleNode;
import com.fit.cia.core.utils.FileHelper;
import org.apache.logging.log4j.util.Strings;
import org.eclipse.jdt.core.dom.ASTVisitor;
import org.eclipse.jdt.core.dom.Annotation;
import org.eclipse.jdt.core.dom.ArrayType;
import org.eclipse.jdt.core.dom.CompilationUnit;
import org.eclipse.jdt.core.dom.FieldDeclaration;
import org.eclipse.jdt.core.dom.IMethodBinding;
import org.eclipse.jdt.core.dom.ITypeBinding;
import org.eclipse.jdt.core.dom.IVariableBinding;
import org.eclipse.jdt.core.dom.ImportDeclaration;
import org.eclipse.jdt.core.dom.MethodDeclaration;
import org.eclipse.jdt.core.dom.Modifier;
import org.eclipse.jdt.core.dom.PackageDeclaration;
import org.eclipse.jdt.core.dom.ParameterizedType;
import org.eclipse.jdt.core.dom.SimpleType;
import org.eclipse.jdt.core.dom.SingleVariableDeclaration;
import org.eclipse.jdt.core.dom.Type;
import org.eclipse.jdt.core.dom.TypeDeclaration;
import org.eclipse.jdt.core.dom.VariableDeclaration;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public final class JavaFileParser {
	private FileNode fileNode;
	private final String javaSourcePath;
	private final Map<String, Node> jdtKeyNodeIdMap;

	public JavaFileParser(String javaSourcePath) {
		this.javaSourcePath = javaSourcePath;
		this.jdtKeyNodeIdMap = (Map<String, Node>) CiaData.getInstance().getData(CiaData.KEY_NODE_ID);
	}

	public Node parse(String path) {
		path = FileHelper.normalizePath(path);
		FileNode node = new FileNode();
		node.setAbsolutePath(path);
		node.setName(path.substring(path.lastIndexOf(File.separator) + 1));
		return parse(node);
	}

	public Node parse(Node rootNode) {
		try {
			this.fileNode = (FileNode) rootNode;

			CompilationUnit compilationUnit = JdtParsingHelper.getJdtRoot(rootNode.getAbsolutePath(), this.javaSourcePath);
			compilationUnit.accept(new ASTVisitor() {
				@Override
				public boolean visit(PackageDeclaration node) {
					return true;
				}

				@Override
				public boolean visit(ImportDeclaration node) {
					fileNode.addImportDeclaration(node);
					return true;
				}

				@Override
				public void endVisit(PackageDeclaration node) {
					fileNode.setPackageDeclaration(node);
				}

				@Override
				public boolean visit(TypeDeclaration node) {
					ITypeBinding binding = node.resolveBinding();
					if (binding != null) parseJavaClass(node, fileNode);
					return false;
				}
			});

		} catch (IllegalStateException e) { //jdt error
			e.printStackTrace();
//            throw new CiaNotFoundException("Your java source path is not valid, make sure it is placed in root context of zip file");

		} catch (IOException | ClassCastException e) {
			e.printStackTrace();
		}
		return fileNode;
	}

	protected void parseJavaClass(TypeDeclaration astNode, Node parentNode) {

		final JavaClassNode classNode = new JavaClassNode();
		parentNode.addChild(classNode);
		classNode.setParent(parentNode);

		// set astNode
		classNode.setAstNode(astNode);

		// get name of class node
		classNode.setName(astNode.getName().toString());
		classNode.setType(getFullyQualifiedTypeName(classNode.getName()));

		// get all field and method declarations
		for (FieldDeclaration field : astNode.getFields()) {
			parseJavaFieldDeclaration(field, classNode);
		}

		for (MethodDeclaration method : astNode.getMethods()) {
			IMethodBinding binding = method.resolveBinding();
			if (binding != null) {
				parseJavaMethod(method, classNode);
			}
		}

		for (TypeDeclaration type : astNode.getTypes()) {
			ITypeBinding binding = type.resolveBinding();
			if (binding != null) {
				parseJavaClass(type, classNode);
			}
		}

		// get class modifier, annotations
		processModifiers(classNode, astNode.modifiers());

		// get parent class
		Type superClass = astNode.getSuperclassType();
		if (superClass instanceof SimpleType) {
			String superClassTypeName = getFullyQualifiedTypeName(superClass.toString());
			classNode.setParentClass(superClassTypeName);
		}

		// get interfaces
		for (Object i : astNode.superInterfaceTypes()) {
			if (i instanceof SimpleType) {
				String interfaceTypeName = getFullyQualifiedTypeName(i.toString());
				classNode.addInterface(interfaceTypeName);
			}
		}

		// is interface?
		classNode.setInterface(astNode.isInterface());

		// put to jdt key - cia node id map
		this.jdtKeyNodeIdMap.put(astNode.resolveBinding().getKey(), classNode);

		classNode.setNumOfMethod(classNode.getFieldList().size());
		classNode.setNumOfVariable(classNode.getMethodList().size());
	}

	protected void parseJavaMethod(MethodDeclaration astNode, final Node classNode) {
		final JavaMethodNode methodNode = new JavaMethodNode();

		classNode.addChild(methodNode);
		methodNode.setParent(classNode);

		// set astNode
		methodNode.setAstNode(astNode);

		List<?> paramList = astNode.parameters();
		List<String> parameterStrList = new ArrayList<>();

		if (paramList != null) {
			for (Object param : paramList) {
				SingleVariableDeclaration variableDeclaration = (SingleVariableDeclaration) param;

				String name = variableDeclaration.getName().toString();
				String type = null;

				// Cover all variable type
				Type varType = variableDeclaration.getType();
				type = getFullyQualifiedName(varType);
				parameterStrList.add(type);

				JavaParameterNode parameterNode = new JavaParameterNode(name, type);

				// set astNode for parameter
				parameterNode.setAstNode(variableDeclaration);

				methodNode.addParameter(parameterNode);
			}
		}

		String simpleName = astNode.getName().toString();
		methodNode.setSimpleName(simpleName);
		methodNode.setName(simpleName + "(" + Strings.join(parameterStrList, ',') + ")");

		// get return type
		String returnType = astNode.getReturnType2() == null // in case of method is constructor
				? null : getFullyQualifiedName(astNode.getReturnType2());
		methodNode.setReturnType(returnType);

		// get modifiers and annotations
		processModifiers(methodNode, astNode.modifiers());

		// put to jdt key - cia node id map
		this.jdtKeyNodeIdMap.put(astNode.resolveBinding().getKey(), methodNode);
	}

	protected void parseJavaFieldDeclaration(FieldDeclaration astNode, final Node classNode) {
		// get variable name, variable value of variables in field declaration
		// int a;
		// int a, b;
		for (Object fragment : astNode.fragments()) {
			if (fragment instanceof VariableDeclaration) {
				VariableDeclaration variable = (VariableDeclaration) fragment;
				IVariableBinding binding = variable.resolveBinding();
				if (binding != null) {
					// for cia tree
					JavaFieldNode fieldNode = new JavaFieldNode();

					classNode.addChild(fieldNode);
					fieldNode.setParent(classNode);

					// set astNode
					fieldNode.setAstNode(astNode);

					// get type of field declaration
					String fieldType = getFullyQualifiedName(astNode.getType());
					fieldNode.setType(fieldType);

					// get name
					fieldNode.setName(variable.getName().toString());

					// get modifiers and annotations
					processModifiers(fieldNode, astNode.modifiers());

					// put to jdt key - cia node id map
					this.jdtKeyNodeIdMap.put(variable.resolveBinding().getKey(), fieldNode);
				}
			}
		}
	}

	protected void processModifiers(JavaElementNode node, List<?> modifiers) {
		node.setAnnotationList(getAnnotationsFromAstModifierList(modifiers));
		for (Object object : modifiers) {
			if (!(object instanceof Modifier)) continue;
			Modifier modifier = (Modifier) object;
			if (modifier.isFinal()) {
				node.setFinal(true);
			}
			if (modifier.isAbstract() && node instanceof JavaAbstractableNode) {
				((JavaAbstractableNode) node).setAbstract(true);
			}
			if (node instanceof JavaVisibleNode) {
				final JavaVisibleNode visibleNode = (JavaVisibleNode) node;
				if (modifier.isStatic()) {
					visibleNode.setStatic(true);
				} else if (modifier.isPublic()) {
					visibleNode.setVisibility(JavaVisibleNode.Visibility.PUBLIC);
				} else if (modifier.isProtected()) {
					visibleNode.setVisibility(JavaVisibleNode.Visibility.PROTECTED);
				} else if (modifier.isPrivate()) {
					visibleNode.setVisibility(JavaVisibleNode.Visibility.PRIVATE);
				}
			}
		}
	}

	protected List<Annotation> getAnnotationsFromAstModifierList(List<?> modifiers) {
		List<Annotation> annotationList = new ArrayList<>();
		for (Object modifier : modifiers) {
			if (modifier instanceof Annotation) {
				annotationList.add((Annotation) modifier);
			}
		}
		return annotationList;
	}

	protected String getFullyQualifiedName(Type type) {
		if (type.isParameterizedType()) {
			ParameterizedType parameterizedType = (ParameterizedType) type;
			return getFullyQualifiedTypeName(parameterizedType);
		} else if (type.isArrayType()) {
			ArrayType arrayType = (ArrayType) type;
			return getFullyQualifiedTypeName(arrayType);
		} else
			return getFullyQualifiedTypeName(type.toString());
	}

	protected String getFullyQualifiedTypeName(ParameterizedType parameterizedType) {
		StringBuilder result = new StringBuilder();
		String type = parameterizedType.getType().toString();
		result.append(getFullyQualifiedTypeName(type)).append("<");

		List<?> args = parameterizedType.typeArguments();
		if (args.size() == 1) {
			String argQualifiedName = getFullyQualifiedTypeName(args.get(0).toString());
			result.append(argQualifiedName);
		} else {
			for (Object arg : args) {
				String argQualifiedName = getFullyQualifiedTypeName(arg.toString());
				result.append(argQualifiedName).append(",");
			}
			result = new StringBuilder(result.substring(0, result.length() - 1));
		}
		result.append(">");
		return result.toString();
	}

	protected String getFullyQualifiedTypeName(ArrayType arrayType) {
		StringBuilder result = new StringBuilder();
		result.append(getFullyQualifiedTypeName(arrayType.getElementType().toString()));
		for (Object dimension : arrayType.dimensions()) {
			result.append(dimension.toString());
		}
		return result.toString();
	}

	protected String getFullyQualifiedTypeName(String typeName) {
		// input is null or input is already a fully qualified type
		if (typeName == null || typeName.contains(".")) return typeName;

		// is primitive type?
		if (primitiveTypes.contains(typeName)) return typeName;

		// find in import statements
		for (ImportDeclaration id : fileNode.getImportDeclarationList()) {
			String idStr = id.getName().getFullyQualifiedName();
			if (idStr.endsWith("." + typeName)) {
				return idStr;
			}
		}

		// find in java.lang package
		if (javaLangTypes.contains(typeName)) {
			return "java.lang." + typeName;
		}

		PackageDeclaration packageDeclaration = fileNode.getPackageDeclaration();
		if (packageDeclaration == null) {
			return typeName;
		} else return packageDeclaration.getName() + "." + typeName;
	}

	public FileNode getFileNode() {
		return fileNode;
	}

	protected static final String[] PRIMITIVE_TYPES = {
			"boolean", "short", "int", "long", "float", "double", "void"
	};

	protected static final String[] JAVA_LANG_TYPES = {
			"Boolean", "Byte", "Character.Subset", "Character.UnicodeBlock", "ClassLoader", "Double",
			"Float", "Integer", "Long", "Math", "Number", "Object", "Package", "Process", "Runtime",
			"Short", "String", "StringBuffer", "StringBuilder", "System", "Thread", "ThreadGroup",
			"Throwable", "Void"
	};

	protected static List<String> primitiveTypes = Arrays.asList(PRIMITIVE_TYPES);
	protected static List<String> javaLangTypes = Arrays.asList(JAVA_LANG_TYPES);
}
