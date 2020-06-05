package com.fit.cia.web.controller;

import com.fit.cia.utils.CiaException;
import com.fit.cia.utils.CiaNotFoundException;
import com.fit.cia.utils.LogLevel;
import com.fit.cia.web.bean.RandomService;
import com.fit.cia.web.config.AppConfig;
import mrmathami.cia.cpp.builder.ProjectVersion;
import mrmathami.cia.cpp.differ.VersionDifference;
import mrmathami.cia.cpp.differ.VersionDiffer;
import mrmathami.cia.cpp.json.JsonDiffBuilder;
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
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Scope(value = "session")
@ManagedBean
@SuppressWarnings("Duplicates")
public final class CppUploadVersionsController {
	private static final Logger LOGGER = LogManager.getLogger(CppUploadVersionsController.class);
	private static final String[] EXTENSIONS = new String[]{
			".c", ".cc", ".cpp", ".c++", ".cxx",
			".h", ".hh", ".hpp", ".h++", ".hxx"
	};

	private final RandomService randomService;
	private String messageError;

	private Part postDataA;
	private String cppSourceFolderA;
	private String cppIncludeFolderA;

	private Part postDataB;
	private String cppSourceFolderB;
	private String cppIncludeFolderB;
	private boolean usingNewWeight;

	public CppUploadVersionsController(RandomService randomService) {
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

	public final String index() {
		ControllerUtils.putSession(ControllerUtils.CURRENT_LANGUAGE, "CPP");
		return "versionCpp?faces-redirect=true";
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
				LOGGER.log(LogLevel.C_ERROR, "Request part is null");
				throw new CiaNotFoundException("Request part is null");
			}

			final String partUser = ControllerUtils.getUserName();
			final Path userPath = Files.createDirectories(AppConfig.UPLOAD_PATH.resolve(partUser));

			final long startTime = System.nanoTime();
			LOGGER.info("Start processing project...");


			final String partIdA = randomService.randomString();
			final Path extractPathA = Files.createDirectories(userPath.resolve(partIdA));
			LOGGER.info(String.format("Start analyzing: [%s/%s]", partUser, partIdA));

//			final VersionBuilderDebugger debuggerA = new VersionBuilderDebugger();
//			debuggerA.setSaveRoot(true);
//			debuggerA.setSaveTranslationUnit(true);
//			final ProjectVersion versionA = CppUploadController.createProjectVersion(partIdA, extractPathA,
//					postDataA.getInputStream(), cppSourceFolderA, cppIncludeFolderA, usingNewWeight, debuggerA);
			final ProjectVersion versionA = CppUploadController.createProjectVersion(partIdA, extractPathA,
					postDataA.getInputStream(), cppSourceFolderA, cppIncludeFolderA);
			if (versionA == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partIdA));
			}
//			final Path debugPathA = Files.createDirectories(userPath.resolve("debug_" + partIdA));
//			debuggerA.debugOutput(debugPathA);
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partIdA));


			final String partIdB = randomService.randomString();
			final Path extractPathB = Files.createDirectories(userPath.resolve(partIdB));
			LOGGER.info(String.format("Start analyzing: [%s/%s]", partUser, partIdB));

//			final VersionBuilderDebugger debuggerB = new VersionBuilderDebugger();
//			debuggerB.setSaveRoot(true);
//			debuggerB.setSaveTranslationUnit(true);
//			final ProjectVersion versionB = CppUploadController.createProjectVersion(partIdB, extractPathB,
//					postDataB.getInputStream(), cppSourceFolderB, cppIncludeFolderB, usingNewWeight, debuggerB);
			final ProjectVersion versionB = CppUploadController.createProjectVersion(partIdB, extractPathB,
					postDataB.getInputStream(), cppSourceFolderB, cppIncludeFolderB);
			if (versionB == null) {
				throw new CiaException(String.format("Encountered error when analyzing [%s/%s]", partUser, partIdB));
			}
//			final Path debugPathB = Files.createDirectories(userPath.resolve("debug_" + partIdB));
//			debuggerB.debugOutput(debugPathB);
			LOGGER.info(String.format("Finish analyzing: [%s/%s]", partUser, partIdB));


			LOGGER.info(String.format("Start comparing: [%s/%s]", partIdA, partIdB));
			final VersionDifference difference = VersionDiffer.compare(versionA, versionB, VersionDiffer.IMPACT_WEIGHT_MAP);
			final JsonWrapper wrapper = JsonDiffBuilder.build(difference);
			LOGGER.info(String.format("Finish comparing: [%s/%s]", partIdA, partIdB));

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

	public Part getPostDataA() {
		return postDataA;
	}

	public void setPostDataA(Part postDataA) {
		this.postDataA = postDataA;
	}

	public String getCppSourceFolderA() {
		return cppSourceFolderA;
	}

	public void setCppSourceFolderA(String cppSourceFolderA) {
		this.cppSourceFolderA = cppSourceFolderA;
	}

	public String getCppIncludeFolderA() {
		return cppIncludeFolderA;
	}

	public void setCppIncludeFolderA(String cppIncludeFolderA) {
		this.cppIncludeFolderA = cppIncludeFolderA;
	}

	public Part getPostDataB() {
		return postDataB;
	}

	public void setPostDataB(Part postDataB) {
		this.postDataB = postDataB;
	}

	public String getCppSourceFolderB() {
		return cppSourceFolderB;
	}

	public void setCppSourceFolderB(String cppSourceFolderB) {
		this.cppSourceFolderB = cppSourceFolderB;
	}

	public String getCppIncludeFolderB() {
		return cppIncludeFolderB;
	}

	public void setCppIncludeFolderB(String cppIncludeFolderB) {
		this.cppIncludeFolderB = cppIncludeFolderB;
	}

	public boolean getUsingNewWeight() {
		return usingNewWeight;
	}

	public void setUsingNewWeight(boolean usingNewWeight) {
		this.usingNewWeight = usingNewWeight;
	}
}
