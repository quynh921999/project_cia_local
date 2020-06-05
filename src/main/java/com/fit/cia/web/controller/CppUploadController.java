package com.fit.cia.web.controller;

import com.fit.cia.utils.CiaException;
import com.fit.cia.utils.CiaNotFoundException;
import com.fit.cia.utils.LogLevel;
import com.fit.cia.web.bean.RandomService;
import com.fit.cia.web.config.AppConfig;
import mrmathami.cia.cpp.builder.ProjectVersion;
import mrmathami.cia.cpp.builder.VersionBuilder;
import mrmathami.cia.cpp.json.JsonBuilder;
import mrmathami.cia.cpp.json.JsonWrapper;
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
public final class CppUploadController {
	private static final Logger LOGGER = LogManager.getLogger(CppUploadController.class);
	private static final String[] EXTENSIONS = new String[]{
			".c", ".cc", ".cpp", ".c++", ".cxx",
			".h", ".hh", ".hpp", ".h++", ".hxx"
	};

	private final RandomService randomService;
	private String messageError;

	private Part postData;
	private String cppSourceFolder;
	private String cppIncludeFolder;
	private boolean usingNewWeight;

	public CppUploadController(RandomService randomService) {
		this.randomService = randomService;
	}

	private static boolean fileFilter(Path path) {
		final String file = path.getFileName().toString();
		final int dot = file.lastIndexOf('.');
		if (dot >= 0) {
			final String fileExt = file.substring(dot).toLowerCase();
			for (final String extension : EXTENSIONS) {
				if (fileExt.equals(extension)) return true;
			}
		}
		return false;
	}

	static ProjectVersion createProjectVersion(String partId, Path extractPath, InputStream fileInputStream,
			String cppSourceFolder, String cppIncludeFolder) {
		try {
			final List<Path> projectFiles = new ArrayList<>();
			final List<Path> includePaths = new ArrayList<>();
			try (final ZipInputStream zipInputStream = new ZipInputStream(fileInputStream)) {
				final Path sourcePath = cppSourceFolder.isBlank() ? extractPath : extractPath.resolve(cppSourceFolder);
				final Path includePath = cppIncludeFolder.isBlank() ? null : extractPath.resolve(cppIncludeFolder);
				while (true) {
					final ZipEntry entry = zipInputStream.getNextEntry();
					if (entry == null) break;

					final Path outputPath = extractPath.resolve(entry.getName());
					if (entry.isDirectory()) {
						if (outputPath.startsWith(sourcePath) || includePath != null && outputPath.startsWith(includePath)) {
							Files.createDirectories(outputPath);
						}
					} else if (fileFilter(outputPath)) {
						if (outputPath.startsWith(sourcePath)) {
							projectFiles.add(outputPath);
						} else if (includePath != null && outputPath.startsWith(includePath)) {
							includePaths.add(outputPath);
						} else {
							continue;
						}
						Files.copy(zipInputStream, outputPath);
					}
				}
			}
			return VersionBuilder.build(partId, extractPath, projectFiles, includePaths, VersionBuilder.WEIGHT_MAP);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	public final String index() {
		ControllerUtils.putSession(ControllerUtils.CURRENT_LANGUAGE, "CPP");
		return "uploadCpp?faces-redirect=true";
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
				LOGGER.log(LogLevel.C_ERROR, "Request part is null");
				throw new CiaNotFoundException("Request part is null");
			}

			final String partUser = ControllerUtils.getUserName();
			final Path userPath = Files.createDirectories(AppConfig.UPLOAD_PATH.resolve(partUser));

			final long startTime = System.nanoTime();
			LOGGER.info("Start processing project...");


			final String partId = randomService.randomString();
			final Path extractPath = Files.createDirectories(userPath.resolve(partId));
			LOGGER.info(String.format("Start analyzing: [%s/%s]", partUser, partId));
			final ProjectVersion version = createProjectVersion(partId, extractPath,
					postData.getInputStream(), cppSourceFolder, cppIncludeFolder);
			if (version == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partId));
			}
//			final Path debugPath = Files.createDirectories(userPath.resolve("debug_" + partId));
//			debugger.debugOutput(debugPath);
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partId));


			LOGGER.info(String.format("Start rendering: [%s/%s]", partUser, partId));
			final JsonWrapper wrapper = JsonBuilder.build(version);
			LOGGER.info(String.format("Finish rendering: [%s/%s]", partUser, partId));

			ControllerUtils.putSession(ControllerUtils.CLIENT_TREE_SESSION_KEY, wrapper.getJsonNode());
			ControllerUtils.putSession(ControllerUtils.CLIENT_DEPENDENCY_SESSION_KEY, wrapper.getDependencyList());

			LOGGER.info(String.format("Finish processing project in %d milliseconds.", (System.nanoTime() - startTime) / 1000000));

			return "viewer?faces-redirect=true";

		} catch (Exception e) {
			e.printStackTrace();
			throw new CiaException("Encountered error when analyzing postData", e);
		}
	}

	/**
	 * Validate upload file, show message whenever get error
	 *
	 * @param context   Current Face Context.
	 * @param component Base class for all UI ComponentType .
	 * @param value     Validating object.
	 */
	public void validateFile(FacesContext context, UIComponent component, Object value) {
		final List<FacesMessage> messages = new ArrayList<>();
		if (value == null) throw new ValidatorException(new FacesMessage("Requested part is null"));

		final String contentType = ((Part) value).getContentType();
		if (contentType.equals("application/zip") || contentType.equals("application/octet-stream")
				|| contentType.equals("application/x-zip-compressed")) return;

		this.messageError = "Must be a zip file.";
		throw new ValidatorException(new FacesMessage("Must be a zip file."));
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

	public String getCppSourceFolder() {
		return cppSourceFolder;
	}

	public void setCppSourceFolder(String cppSourceFolder) {
		this.cppSourceFolder = cppSourceFolder;
	}

	public String getCppIncludeFolder() {
		return cppIncludeFolder;
	}

	public void setCppIncludeFolder(String cppIncludeFolder) {
		this.cppIncludeFolder = cppIncludeFolder;
	}

	public boolean getUsingNewWeight() {
		return usingNewWeight;
	}

	public void setUsingNewWeight(boolean usingNewWeight) {
		this.usingNewWeight = usingNewWeight;
	}
}
