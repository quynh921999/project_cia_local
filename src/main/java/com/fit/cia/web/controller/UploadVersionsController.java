package com.fit.cia.web.controller;

import com.fit.cia.utils.LogLevel;
import com.fit.cia.core.CallMeCore;
import com.fit.cia.core.diff.CompareTwoTreeResult;
import com.fit.cia.core.diff.DifferenceAPI;
import com.fit.cia.core.treemodel.Node;
import com.fit.cia.utils.CiaException;
import com.fit.cia.utils.CiaNotFoundException;
import com.fit.cia.web.bean.RandomService;
import com.fit.cia.web.config.AppConfig;
import com.fit.cia.web.converter.JsonConverterImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.validator.ValidatorException;
import javax.servlet.http.Part;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
@Scope(value = "session")
@ManagedBean
public final class UploadVersionsController {
	private static final Logger LOGGER = LogManager.getLogger(UploadVersionsController.class);
	private final RandomService randomService;
	private String messageError;
	private Part postDataA;
	private String javaSourceFolderA = CallMeCore.DEFAULT_JAVA_SOURCE_FOLDER;
	private String ignoredComponentsA = String.join(",", CallMeCore.DEFAULT_IGNORED_COMPONENTS);
	private Part postDataB;
	private String javaSourceFolderB = CallMeCore.DEFAULT_JAVA_SOURCE_FOLDER;
	private String ignoredComponentsB = String.join(",", CallMeCore.DEFAULT_IGNORED_COMPONENTS);
	private boolean usingNewWeight;

	public UploadVersionsController(RandomService randomService) {
		this.randomService = randomService;
	}

	private static boolean fileFilter(Path path) {
		final String file = path.getFileName().toString();
		final int dot = file.lastIndexOf('.');
		return dot >= 0 && file.substring(dot).toLowerCase().equals(".java");
	}

	public String index() {
		ControllerUtils.putSession(ControllerUtils.CURRENT_LANGUAGE, "JAVA");
		return "versionJava?faces-redirect=true";
	}

	/**
	 * Extract uploaded zip file, parse and store data in extracted file in a JSON file.
	 *
	 * @return /viewer.xhtml if upload success. Otherwise return /upload-result.xhtml  .
	 */
	public String upload() throws CiaException {
		this.messageError = null;

		try {
			if (postDataA == null || postDataB == null) {
				LOGGER.error("Request Part is null");
				LOGGER.log(LogLevel.C_ERROR, "Request Part is null");
				throw new CiaNotFoundException("Request part is null");
			}
			//**************************************************
			// Process zip
			//**************************************************
			final String partUser = ControllerUtils.getUserName();
			final Path userPath = Files.createDirectories(AppConfig.UPLOAD_PATH.resolve(partUser));

			final long startTime = System.nanoTime();
			LOGGER.info("Start uploading project...");

			final String partIdA = randomService.randomString();
			LOGGER.debug(String.format("Start analyzing: [%s/%s]", partUser, partIdA));
			final Node rootNodeA = UploadController.createRootNode(partIdA, userPath,
					postDataA.getInputStream(), javaSourceFolderA, ignoredComponentsA, usingNewWeight);
			if (rootNodeA == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partIdA));
			}
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partIdA));


			final String partIdB = randomService.randomString();
			LOGGER.debug(String.format("Start analyzing: [%s/%s]", partUser, partIdB));
			final Node rootNodeB = UploadController.createRootNode(partIdB, userPath,
					postDataB.getInputStream(), javaSourceFolderB, ignoredComponentsB, usingNewWeight);
			if (rootNodeB == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partIdB));
			}
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partIdB));


			LOGGER.info(String.format("Start comparing: [%s/%s]", partIdA, partIdB));
			CompareTwoTreeResult compareTwoTreeResult = DifferenceAPI.diff(rootNodeA, rootNodeB);
			JsonConverterImpl jsonConverter = new JsonConverterImpl();
			jsonConverter.convertAndSetChange(rootNodeB, compareTwoTreeResult);
			LOGGER.info(String.format("Finish comparing: [%s/%s]", partIdA, partIdB));

			ControllerUtils.putSession(ControllerUtils.CLIENT_TREE_SESSION_KEY, jsonConverter.getJsonNode());
			ControllerUtils.putSession(ControllerUtils.CLIENT_DEPENDENCY_SESSION_KEY, jsonConverter.getJsonDependencyNodes());

			return "viewer?faces-redirect=true";

		} catch (Exception e) {
			e.printStackTrace();
			throw new CiaException("Encountered error when analyzing postData", e);
		}
	}

	/**
	 * Validate upload file, show message whenever get error
	 *
	 * @param ctx   Current Face Context.
	 * @param comp  Base class for all UI ComponentType .
	 * @param value Validating object.
	 */
	@SuppressWarnings("DuplicatedCode")
	public void validateFile(FacesContext ctx, UIComponent comp, Object value) {
		List<FacesMessage> messages = new ArrayList<>();
		if (value != null) {
			Part file = (Part) value;
			String contentType = file.getContentType();
			if (!"application/zip".equals(contentType) && !"application/octet-stream".equals(contentType)
					&& !"application/x-zip-compressed".equals(contentType)) {
				this.messageError = "Must be a zip file.";
				messages.add(new FacesMessage(this.messageError));
			}
		} else {
			messages.add(new FacesMessage("Requested part is null"));
		}
		if (!messages.isEmpty())
			throw new ValidatorException(messages);
	}

	public String getMessageError() {
		return messageError;
	}

	public void setMessageError(String messageError) {
		this.messageError = messageError;
	}

	public Part getPostDataA() {
		return postDataA;
	}

	public void setPostDataA(Part postDataA) {
		this.postDataA = postDataA;
	}

	public String getJavaSourceFolderA() {
		return javaSourceFolderA;
	}

	public void setJavaSourceFolderA(String javaSourceFolderA) {
		this.javaSourceFolderA = javaSourceFolderA;
	}

	public String getIgnoredComponentsA() {
		return ignoredComponentsA;
	}

	public void setIgnoredComponentsA(String ignoredComponentsA) {
		this.ignoredComponentsA = ignoredComponentsA;
	}

	public Part getPostDataB() {
		return postDataB;
	}

	public void setPostDataB(Part postDataB) {
		this.postDataB = postDataB;
	}

	public String getJavaSourceFolderB() {
		return javaSourceFolderB;
	}

	public void setJavaSourceFolderB(String javaSourceFolderB) {
		this.javaSourceFolderB = javaSourceFolderB;
	}

	public String getIgnoredComponentsB() {
		return ignoredComponentsB;
	}

	public void setIgnoredComponentsB(String ignoredComponentsB) {
		this.ignoredComponentsB = ignoredComponentsB;
	}

	public boolean isUsingNewWeight() {
		return usingNewWeight;
	}

	public void setUsingNewWeight(boolean usingNewWeight) {
		this.usingNewWeight = usingNewWeight;
	}
}
