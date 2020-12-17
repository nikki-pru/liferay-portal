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

package com.liferay.document.library.item.selector.web.internal;

<<<<<<< HEAD
import com.liferay.document.library.video.renderer.DLVideoRenderer;
import com.liferay.item.selector.ItemSelectorReturnTypeResolver;
import com.liferay.item.selector.criteria.VideoEmbeddableHTMLItemSelectorReturnType;
import com.liferay.portal.kernel.exception.PortalException;
=======
import com.liferay.document.library.external.video.DLExternalVideo;
import com.liferay.document.library.external.video.resolver.DLExternalVideoResolver;
import com.liferay.item.selector.ItemSelectorReturnTypeResolver;
import com.liferay.item.selector.criteria.VideoEmbeddableHTMLItemSelectorReturnType;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.theme.ThemeDisplay;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Alejandro Tardín
 */
@Component(
	property = "service.ranking:Integer=100",
	service = ItemSelectorReturnTypeResolver.class
)
public class FileEntryVideoEmbeddableHTMLItemSelectorReturnTypeResolver
	implements ItemSelectorReturnTypeResolver
		<VideoEmbeddableHTMLItemSelectorReturnType, FileEntry> {

	@Override
	public Class<VideoEmbeddableHTMLItemSelectorReturnType>
		getItemSelectorReturnTypeClass() {

		return VideoEmbeddableHTMLItemSelectorReturnType.class;
	}

	@Override
	public Class<FileEntry> getModelClass() {
		return FileEntry.class;
	}

	@Override
<<<<<<< HEAD
	public String getValue(FileEntry fileEntry, ThemeDisplay themeDisplay)
		throws PortalException {

		return _dlVideoRenderer.renderHTML(
			fileEntry.getFileVersion(), themeDisplay.getRequest());
	}

	@Reference
	private DLVideoRenderer _dlVideoRenderer;
=======
	public String getValue(FileEntry fileEntry, ThemeDisplay themeDisplay) {
		DLExternalVideo dlExternalVideo = _dlExternalVideoResolver.resolve(
			fileEntry);

		if (dlExternalVideo != null) {
			return dlExternalVideo.getEmbeddableHTML();
		}

		return null;
	}

	@Reference
	private DLExternalVideoResolver _dlExternalVideoResolver;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

}