package com.fit.cia.core.treemodel.json.dom;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

public class JsonJavaElementNode extends JsonNode {
	@JsonProperty("visibility")
	protected String visibility = "default";

	@JsonProperty("isStatic")
	protected boolean isStatic;

	@JsonProperty("isFinal")
	protected boolean isFinal;

//	@JsonProperty("start_position")
//	protected NodePosition startPosition;
//
//	@JsonProperty("end_position")
//	protected NodePosition endPosition;

	public JsonJavaElementNode() {
	}

	public String getVisibility() {
		return visibility;
	}

	public void setVisibility(String visibility) {
		this.visibility = visibility;
	}

	public boolean isStatic() {
		return isStatic;
	}

	public void setStatic(boolean aStatic) {
		isStatic = aStatic;
	}

	public boolean isFinal() {
		return isFinal;
	}

	public void setFinal(boolean aFinal) {
		isFinal = aFinal;
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

//	public static class NodePosition implements Serializable {
//		@JsonProperty("line_number")
//		private final int lineNumber;
//
//		@JsonProperty("column_number")
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
