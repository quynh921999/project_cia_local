package com.fit.cia.core.treemodel.java;

public abstract class JavaVisibleNode extends JavaElementNode {
	private Visibility visibility = Visibility.PACKAGE_PRIVATE;
	private boolean isStatic = false;

	public Visibility getVisibility() {
		return visibility;
	}

	public void setVisibility(Visibility visibility) {
		this.visibility = visibility;
	}

	public boolean isStatic() {
		return isStatic;
	}

	public void setStatic(boolean aStatic) {
		isStatic = aStatic;
	}

	public enum Visibility {
		PUBLIC("public"),
		PROTECTED("protected"),
		PACKAGE_PRIVATE("default"),
		PRIVATE("private");

		private final String string;

		Visibility(String string) {
			this.string = string;
		}

		@Override
		public final String toString() {
			return string;
		}
	}
}
