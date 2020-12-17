/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.dispatch.talend.web.internal.executor;

import com.liferay.dispatch.executor.BaseDispatchTaskExecutor;
import com.liferay.dispatch.executor.DispatchTaskExecutor;
import com.liferay.dispatch.executor.DispatchTaskExecutorOutput;
import com.liferay.dispatch.model.DispatchTrigger;
import com.liferay.dispatch.repository.DispatchFileRepository;
<<<<<<< HEAD
import com.liferay.dispatch.repository.exception.DispatchRepositoryException;
import com.liferay.dispatch.service.DispatchTriggerLocalService;
import com.liferay.dispatch.talend.web.internal.archive.TalendArchive;
import com.liferay.dispatch.talend.web.internal.archive.TalendArchiveParserUtil;
import com.liferay.dispatch.talend.web.internal.process.TalendProcess;
import com.liferay.dispatch.talend.web.internal.process.TalendProcessCallable;
import com.liferay.petra.concurrent.NoticeableFuture;
import com.liferay.petra.process.ProcessChannel;
import com.liferay.petra.process.ProcessExecutor;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
=======
import com.liferay.dispatch.service.DispatchTriggerLocalService;
import com.liferay.petra.io.StreamUtil;
import com.liferay.petra.io.unsync.UnsyncByteArrayOutputStream;
import com.liferay.petra.process.CollectorOutputProcessor;
import com.liferay.petra.process.ConsumerOutputProcessor;
import com.liferay.petra.process.ProcessException;
import com.liferay.petra.process.ProcessUtil;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.exception.PortalException;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.util.FileUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;

import java.io.File;
<<<<<<< HEAD
import java.io.Serializable;

import java.util.Date;
import java.util.Map;
=======
import java.io.IOException;
import java.io.InputStream;

import java.text.SimpleDateFormat;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marco Leo
<<<<<<< HEAD
 * @author Igor Beslic
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
 */
@Component(
	immediate = true,
	property = "dispatch.task.executor.type=" + TalendDispatchTaskExecutor.DISPATCH_TASK_EXECUTOR_TYPE_TALEND,
	service = DispatchTaskExecutor.class
)
public class TalendDispatchTaskExecutor extends BaseDispatchTaskExecutor {

	public static final String DISPATCH_TASK_EXECUTOR_TYPE_TALEND = "talend";

	@Override
	public void doExecute(
			DispatchTrigger dispatchTrigger,
			DispatchTaskExecutorOutput dispatchTaskExecutorOutput)
<<<<<<< HEAD
		throws PortalException {

		TalendArchive talendArchive = fetchTalendArchive(
			dispatchTrigger.getDispatchTriggerId());

		if (talendArchive == null) {
			throw new PortalException("Unable to fetch Talend archive");
		}

		TalendProcess talendProcess = _getTalendProcess(
			dispatchTrigger, talendArchive);

		try {
			ProcessChannel<Serializable> processChannel =
				_processExecutor.execute(
					talendProcess.getProcessConfig(),
					new TalendProcessCallable(
						talendProcess.getMainMethodArguments(),
						talendArchive.getJobMainClassFQN()));

			NoticeableFuture<Serializable> future =
				processChannel.getProcessNoticeableFuture();

			future.get();

			if (_log.isInfoEnabled()) {
				_log.info(
					"Completed job for dispatch trigger ID " +
						dispatchTrigger.getDispatchTriggerId());
			}
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}
		finally {
			FileUtil.deltree(new File(talendArchive.getJobDirectory()));
=======
		throws IOException, PortalException {

		FileEntry fileEntry = _dispatchFileRepository.fetchFileEntry(
			dispatchTrigger.getDispatchTriggerId());

		InputStream inputStream = fileEntry.getContentStream();

		File tempFile = FileUtil.createTempFile(inputStream);

		File tempFolder = FileUtil.createTempFolder();

		FileUtil.unzip(tempFile, tempFolder);

		String rootDirectoryName = tempFolder.getAbsolutePath();

		String shFileName = _getSHFileName(rootDirectoryName);

		_addExecutePermission(shFileName);

		DispatchTalendCollectorOutputProcessor
			dispatchTalendCollectorOutputProcessor =
				new DispatchTalendCollectorOutputProcessor();

		try {
			Future<Map.Entry<byte[], byte[]>> future = ProcessUtil.execute(
				dispatchTalendCollectorOutputProcessor,
				_getArguments(dispatchTrigger, rootDirectoryName, shFileName));

			Map.Entry<byte[], byte[]> entry = future.get();

			dispatchTaskExecutorOutput.setError(entry.getValue());
			dispatchTaskExecutorOutput.setOutput(entry.getKey());
		}
		catch (Exception exception) {
			dispatchTaskExecutorOutput.setError(
				dispatchTalendCollectorOutputProcessor._stdErrByteArray);

			throw new PortalException(exception);
		}
		finally {
			FileUtil.deltree(rootDirectoryName);

			if (tempFile != null) {
				FileUtil.delete(tempFile);
			}
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		}
	}

	@Override
	public String getName() {
		return DISPATCH_TASK_EXECUTOR_TYPE_TALEND;
	}

<<<<<<< HEAD
	protected TalendArchive fetchTalendArchive(long dispatchTriggerId)
		throws PortalException {

		FileEntry fileEntry = _dispatchFileRepository.fetchFileEntry(
			dispatchTriggerId);

		if (fileEntry == null) {
			throw new DispatchRepositoryException(
				"Unable to get file entry for dispatch trigger ID " +
					dispatchTriggerId);
		}

		return TalendArchiveParserUtil.parse(fileEntry.getContentStream());
	}

	private TalendProcess _getTalendProcess(
		DispatchTrigger dispatchTrigger, TalendArchive talendArchive) {

		TalendProcess.Builder talendProcessBuilder =
			new TalendProcess.Builder();

		talendProcessBuilder.companyId(dispatchTrigger.getCompanyId());
=======
	private void _addExecutePermission(String shFileName)
		throws PortalException {

		try {
			ProcessUtil.execute(
				ConsumerOutputProcessor.INSTANCE, "chmod", "+x", shFileName);
		}
		catch (ProcessException processException) {
			throw new PortalException(processException);
		}
	}

	private List<String> _getArguments(
			DispatchTrigger dispatchTrigger, String rootDirectoryName,
			String shFileName)
		throws PortalException {

		List<String> arguments = new ArrayList<>();

		arguments.add(shFileName);

		arguments.add(
			"--context_param companyId=" + dispatchTrigger.getCompanyId());
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		Date lastRunStateDate =
			_dispatchTriggerLocalService.fetchPreviousFireDate(
				dispatchTrigger.getDispatchTriggerId());

<<<<<<< HEAD
		talendProcessBuilder.lastRunStartDate(lastRunStateDate);

		talendProcessBuilder.talendArchive(talendArchive);
=======
		if (lastRunStateDate != null) {
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat(
				"yyyy-MM-dd'T'HH:mm:ss'Z'");

			arguments.add(
				"--context_param lastRunStartDate=" +
					simpleDateFormat.format(lastRunStateDate));
		}

		arguments.add("--context_param jobWorkDirectory=" + rootDirectoryName);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		UnicodeProperties taskSettingsUnicodeProperties =
			dispatchTrigger.getTaskSettingsUnicodeProperties();

		if (taskSettingsUnicodeProperties != null) {
			for (Map.Entry<String, String> propEntry :
					taskSettingsUnicodeProperties.entrySet()) {

<<<<<<< HEAD
				talendProcessBuilder.contextParam(
					propEntry.getKey(), propEntry.getValue());
			}
		}

		return talendProcessBuilder.build();
	}

	private static final Log _log = LogFactoryUtil.getLog(
		TalendDispatchTaskExecutor.class);
=======
				StringBundler contextSB = new StringBundler(4);

				contextSB.append("--context_param ");
				contextSB.append(propEntry.getKey());
				contextSB.append(StringPool.EQUAL);
				contextSB.append(propEntry.getValue());

				arguments.add(contextSB.toString());
			}
		}

		return arguments;
	}

	private String _getSHFileName(String rootDirectoryName) {
		String[] strings = FileUtil.find(rootDirectoryName, "**\\*.sh", null);

		return strings[0];
	}
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

	@Reference
	private DispatchFileRepository _dispatchFileRepository;

	@Reference
	private DispatchTriggerLocalService _dispatchTriggerLocalService;

<<<<<<< HEAD
	@Reference
	private ProcessExecutor _processExecutor;
=======
	private class DispatchTalendCollectorOutputProcessor
		extends CollectorOutputProcessor {

		@Override
		public byte[] processStdErr(InputStream stdErrInputStream)
			throws ProcessException {

			UnsyncByteArrayOutputStream unsyncByteArrayOutputStream =
				new UnsyncByteArrayOutputStream();

			try {
				StreamUtil.transfer(
					stdErrInputStream, unsyncByteArrayOutputStream, false);
			}
			catch (IOException ioException) {
				throw new ProcessException(ioException);
			}

			_stdErrByteArray = unsyncByteArrayOutputStream.toByteArray();

			return _stdErrByteArray;
		}

		private byte[] _stdErrByteArray;

	}
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

}