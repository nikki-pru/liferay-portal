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

package com.liferay.portal.bootstrap;

<<<<<<< HEAD
import com.liferay.petra.string.CharPool;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.util.PropsValues;

<<<<<<< HEAD
import java.io.InputStream;

import java.net.URI;
=======
import java.io.IOException;
import java.io.InputStream;

import java.net.URI;
import java.net.URISyntaxException;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipFile;

import org.eclipse.osgi.container.ModuleReadHook;

/**
 * @author Matthew Tambara
 */
public class ModuleReadHookImpl implements ModuleReadHook {

	@Override
	public void process(long bundleId, String location) {
		if ((bundleId == 0) || location.startsWith("webbundle")) {
			return;
		}

		Path bundleRevPath = Paths.get(
			PropsValues.MODULE_FRAMEWORK_STATE_DIR, "org.eclipse.osgi",
			String.valueOf(bundleId), "0");

		if (Files.notExists(bundleRevPath)) {
			return;
		}

		Path path = bundleRevPath.resolve("bundleFile");

		if (Files.exists(path)) {
			return;
		}

		try {
			if (location.startsWith("file")) {
<<<<<<< HEAD
				String jarLocation = _normalizePath(location);

				if (jarLocation.startsWith(
						_normalizePath(
							PropsValues.MODULE_FRAMEWORK_BASE_DIR))) {

					int index = location.indexOf(CharPool.QUESTION);

					if (index != -1) {
						location = location.substring(0, index);
					}

					Files.copy(Paths.get(new URI(location)), path);
=======
				String jarLocation = _getSourceJarLocation(location);

				if (jarLocation.startsWith(
						PropsValues.MODULE_FRAMEWORK_BASE_DIR)) {

					Files.copy(Paths.get(jarLocation), path);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
				}
			}
			else {
				Matcher matcher = _pattern.matcher(location);

				if (matcher.find()) {
					try (ZipFile zipFile = new ZipFile(
<<<<<<< HEAD
							_normalizePath(matcher.group(2)));
=======
							_getSourceJarLocation(matcher.group(2)));
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
						InputStream inputStream = zipFile.getInputStream(
							zipFile.getEntry(matcher.group(1)))) {

						Files.copy(inputStream, path);
					}
				}
				else if (_log.isWarnEnabled()) {
					_log.warn("No bundle found for location " + location);
				}
			}
		}
<<<<<<< HEAD
		catch (Exception exception) {
			_log.error(
				StringBundler.concat(
					"Unable to copy from ", location, " to ", path),
				exception);
		}
	}

	private String _normalizePath(String location) {
		try {
			int index = location.indexOf(CharPool.QUESTION);

			if (index != -1) {
				location = location.substring(0, index);
			}

			URI uri = null;

			Path path = null;

			try {
				uri = new URI(location);

				uri = uri.normalize();

				path = Paths.get(uri);
			}
			catch (Exception exception) {
				path = Paths.get(location);
			}

			uri = path.toUri();

			return uri.getPath();
		}
		catch (Exception exception) {
			throw new IllegalArgumentException(
				"Unable to parse location " + location, exception);
=======
		catch (IOException ioException) {
			_log.error(
				StringBundler.concat(
					"Unable to copy from ", location, " to ", path),
				ioException);
		}
	}

	private String _getSourceJarLocation(String location) {
		try {
			URI uri = new URI(location);

			uri = uri.normalize();

			return uri.getPath();
		}
		catch (URISyntaxException uriSyntaxException) {
			throw new IllegalArgumentException(
				"Unable to parse location " + location, uriSyntaxException);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ModuleReadHookImpl.class);

	private static final Pattern _pattern = Pattern.compile(
		"(.*\\.jar).*lpkgPath=([^&]*)");

}