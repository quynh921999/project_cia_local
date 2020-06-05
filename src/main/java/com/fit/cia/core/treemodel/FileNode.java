package com.fit.cia.core.treemodel;

import org.eclipse.jdt.core.dom.ImportDeclaration;
import org.eclipse.jdt.core.dom.PackageDeclaration;

import java.util.ArrayList;
import java.util.List;

public final class FileNode extends Node {
	protected PackageDeclaration packageDeclaration;
	protected List<ImportDeclaration> importDeclarationList = new ArrayList<>();

	public FileNode() {
	}

	public PackageDeclaration getPackageDeclaration() {
		return packageDeclaration;
	}

	public void setPackageDeclaration(PackageDeclaration packageDeclaration) {
		this.packageDeclaration = packageDeclaration;
	}

	public List<ImportDeclaration> getImportDeclarationList() {
		return importDeclarationList;
	}

	public void setImportDeclarationList(List<ImportDeclaration> importDeclarationList) {
		this.importDeclarationList = importDeclarationList;
	}

	public void addImportDeclaration(ImportDeclaration importDeclaration) {
		this.importDeclarationList.add(importDeclaration);
	}
}
