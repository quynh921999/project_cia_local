package com.fit.cia.core.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;

/**
 *
 */
public class XmlParsingHelper {
	private static final Logger logger = LogManager.getLogger(XmlParsingHelper.class);
	private DocumentBuilder dbBuilder;
	private static XmlParsingHelper instance;

	public static synchronized XmlParsingHelper getInstance() {
		if (instance == null)
			instance = new XmlParsingHelper();
		return instance;
	}

	private XmlParsingHelper() {
		try {
			DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			dbFactory.setValidating(false);
			dbFactory.setIgnoringComments(true);
			// ignore validating xml file
			dbFactory.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false);
			dbFactory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);

			// create new instance of builder
			dbBuilder = dbFactory.newDocumentBuilder();
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		}
	}

	public Document getDomTree(String xmlPath) throws IOException, SAXException {
		return dbBuilder.parse(xmlPath);
	}

	public Document getDomTree(InputStream is) throws IOException, SAXException {
		return dbBuilder.parse(is);
	}
}
