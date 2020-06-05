package com.fit.cia.core.treemodel.java;

import com.fit.cia.core.treemodel.Node;
import org.eclipse.jdt.core.dom.ASTNode;
import org.eclipse.jdt.core.dom.Annotation;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class JavaElementNode extends Node {
	protected boolean isFinal;
	protected ASTNode astNode;
	protected List<Annotation> annotationList = new ArrayList<>();
//	protected NodePosition startPosition;
//	protected NodePosition endPosition;

	public ASTNode getAstNode() {
		return astNode;
	}

	public void setAstNode(ASTNode astNode) {
		this.astNode = astNode;
	}

	public List<Annotation> getAnnotationList() {
		return annotationList;
	}

	public void setAnnotationList(List<Annotation> annotationList) {
		this.annotationList = annotationList;
	}

	public void addAnnotation(Annotation annotation) {
		this.annotationList.add(annotation);
	}

	public boolean isFinal() {
		return isFinal;
	}

	public void setFinal(boolean isFinal) {
		this.isFinal = isFinal;
	}

//	public NodePosition getStartPosition() {
//		return startPosition;
//	}
//
//	public void setStartPosition(NodePosition startPosition) {
//		this.startPosition = startPosition;
//	}
//
//	public NodePosition getEndPosition() {
//		return endPosition;
//	}
//
//	public void setEndPosition(NodePosition endPosition) {
//		this.endPosition = endPosition;
//	}
//
//	public static class NodePosition implements Serializable {
//		private final int lineNumber;
//		private final int columnNumber;
//
//		public NodePosition(int lineNumber, int columnNumber) {
//			this.lineNumber = lineNumber;
//			this.columnNumber = columnNumber;
//		}
//
//		public int getLineNumber() {
//			return lineNumber;
//		}
//
//		public int getColumnNumber() {
//			return columnNumber;
//		}
//	}
}
