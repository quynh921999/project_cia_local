package com.fit.cia.core.parser;

import com.fit.cia.core.utils.FileHelper;
import org.eclipse.jdt.core.JavaCore;
import org.eclipse.jdt.core.dom.AST;
import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.CompilationUnit;

import java.io.IOException;
import java.util.Hashtable;

final class JdtParsingHelper {
	private JdtParsingHelper() {
	}

	public static CompilationUnit getJdtRoot(String javaFilePath, String sourceFolder) throws IOException {
		final ASTParser parser = ASTParser.newParser(AST.JLS13);
		parser.setResolveBindings(true);
		parser.setKind(ASTParser.K_COMPILATION_UNIT);
		parser.setBindingsRecovery(true);

		final Hashtable<String, String> options = JavaCore.getOptions();
		parser.setCompilerOptions(options);

		final String[] sources = new String[]{sourceFolder};
		final String[] encodings = new String[]{"UTF-8"};

		parser.setEnvironment(null, sources, encodings, true);
		parser.setUnitName(javaFilePath);
		parser.setSource(FileHelper.readFileContent(javaFilePath).toCharArray());

		return (CompilationUnit) parser.createAST(null);
	}
}
