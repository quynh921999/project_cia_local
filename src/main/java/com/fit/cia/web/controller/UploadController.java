package com.fit.cia.web.controller;

import com.fit.cia.utils.LogLevel;
import com.fit.cia.core.CallMeCore;
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
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Component
@Scope(value = "session")
@ManagedBean
public final class UploadController {
	private static final Logger LOGGER = LogManager.getLogger(UploadController.class);
	private final RandomService randomService;
	private String messageError;
	private Part postData;
	private String javaSourceFolder = CallMeCore.DEFAULT_JAVA_SOURCE_FOLDER;
	private String ignoredComponents = String.join(",", CallMeCore.DEFAULT_IGNORED_COMPONENTS);
	private boolean usingNewWeight;

	public UploadController(RandomService randomService) {
		this.randomService = randomService;
	}

	private static boolean fileFilter(Path path) {
		final String file = path.getFileName().toString();
		final int dot = file.lastIndexOf('.');
		return dot >= 0 && file.substring(dot).toLowerCase().equals(".java");
	}

	static Node createRootNode(String partId, Path userPath, InputStream fileInputStream,
			String javaSourceFolder, String ignoredComponents, boolean usingNewWeight) {
		try {
			final Path extractPath = Files.createDirectory(userPath.resolve(partId));
			LOGGER.info("Start uploading project...");

			try (final ZipInputStream zipInputStream = new ZipInputStream(fileInputStream)) {
				final Path javaSourcePath = javaSourceFolder != null && !javaSourceFolder.isBlank()
						? Files.createDirectories(extractPath.resolve(javaSourceFolder))
						: extractPath;
				while (true) {
					final ZipEntry entry = zipInputStream.getNextEntry();
					if (entry == null) break;

					final Path outputPath = extractPath.resolve(entry.getName());
					if (entry.isDirectory()) {
						if (!Files.exists(outputPath)) Files.createDirectories(outputPath);
					} else if (outputPath.startsWith(javaSourcePath) && fileFilter(outputPath)) {
						Files.copy(zipInputStream, outputPath);
					}
				}
			}

			final Node treeNode = CallMeCore.buildTree(extractPath.toString(), javaSourceFolder);
			CallMeCore.analyzeDependencies(treeNode, usingNewWeight);
			return treeNode;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public String index() {
		ControllerUtils.putSession(ControllerUtils.CURRENT_LANGUAGE, "JAVA");
		return "uploadJava?faces-redirect=true";
	}

	/**
	 * Extract uploaded zip file, parse and store data in extracted file in a JSON file.
	 *
	 * @return /viewer.xhtml if upload success. Otherwise return /upload-result.xhtml  .
	 */
	public String upload() throws CiaException {
		this.messageError = null;

		try {
			if (postData == null) {
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
			final Node rootNodeA = createRootNode(partIdA, userPath,
					postData.getInputStream(), javaSourceFolder, ignoredComponents, usingNewWeight);
			if (rootNodeA == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partIdA));
			}
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partIdA));


			LOGGER.info(String.format("Start rendering: [%s/%s]", partUser, partIdA));
			JsonConverterImpl jsonConverter = new JsonConverterImpl();
			jsonConverter.convert(rootNodeA);
			LOGGER.info(String.format("Finish rendering: [%s/%s]", partUser, partIdA));

			ControllerUtils.putSession(ControllerUtils.CLIENT_TREE_SESSION_KEY, jsonConverter.getJsonNode());
			ControllerUtils.putSession(ControllerUtils.CLIENT_DEPENDENCY_SESSION_KEY, jsonConverter.getJsonDependencyNodes());

			LOGGER.info(String.format("Finish processing project in %d milliseconds.", (System.nanoTime() - startTime) / 1000000));

			return "viewer?faces-redirect=true";

		} catch (Exception e) {
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

	public Part getPostData() {
		return postData;
	}

	public void setPostData(Part postData) {
		this.postData = postData;
	}

	public String getJavaSourceFolder() {
		return javaSourceFolder;
	}

	public void setJavaSourceFolder(String javaSourceFolder) {
		this.javaSourceFolder = javaSourceFolder;
	}

	public String getIgnoredComponents() {
		return ignoredComponents;
	}

	public void setIgnoredComponents(String ignoredComponents) {
		this.ignoredComponents = ignoredComponents;
	}

	public boolean isUsingNewWeight() {
		return usingNewWeight;
	}

	public void setUsingNewWeight(boolean usingNewWeight) {
		this.usingNewWeight = usingNewWeight;
	}
}
