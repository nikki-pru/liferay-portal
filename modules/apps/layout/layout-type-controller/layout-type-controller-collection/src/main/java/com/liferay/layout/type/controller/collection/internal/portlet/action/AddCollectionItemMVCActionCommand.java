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

package com.liferay.layout.type.controller.collection.internal.portlet.action;

import com.liferay.asset.kernel.model.AssetEntry;
import com.liferay.asset.kernel.service.AssetEntryService;
import com.liferay.asset.list.constants.AssetListEntryTypeConstants;
import com.liferay.asset.list.model.AssetListEntry;
import com.liferay.asset.list.service.AssetListEntryService;
import com.liferay.portal.kernel.portlet.bridges.mvc.BaseMVCActionCommand;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCActionCommand;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextFactory;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.product.navigation.control.menu.constants.ProductNavigationControlMenuPortletKeys;
<<<<<<< HEAD
import com.liferay.segments.SegmentsEntryRetriever;
import com.liferay.segments.constants.SegmentsEntryConstants;
import com.liferay.segments.context.RequestContextMapper;
=======
import com.liferay.segments.constants.SegmentsEntryConstants;
import com.liferay.segments.constants.SegmentsWebKeys;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;

<<<<<<< HEAD
import javax.servlet.http.HttpServletRequest;

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Víctor Galán
 */
@Component(
	immediate = true,
	property = {
		"javax.portlet.name=" + ProductNavigationControlMenuPortletKeys.PRODUCT_NAVIGATION_CONTROL_MENU,
		"mvc.command.name=/control_menu/add_collection_item"
	},
	service = MVCActionCommand.class
)
public class AddCollectionItemMVCActionCommand extends BaseMVCActionCommand {

	@Override
	protected void doProcessAction(
			ActionRequest actionRequest, ActionResponse actionResponse)
		throws Exception {

		long assetListEntryId = ParamUtil.getLong(
			actionRequest, "assetListEntryId");

		String className = ParamUtil.getString(actionRequest, "className");
		long classPK = ParamUtil.getLong(actionRequest, "classPK");

		AssetListEntry assetListEntry =
			_assetListEntryService.getAssetListEntry(assetListEntryId);

		hideDefaultSuccessMessage(actionRequest);

<<<<<<< HEAD
		HttpServletRequest httpServletRequest = _portal.getHttpServletRequest(
			actionRequest);

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		if ((assetListEntry.getType() ==
				AssetListEntryTypeConstants.TYPE_MANUAL) &&
			Validator.isNotNull(className) && (classPK > 0)) {

			AssetEntry assetEntry = _assetEntryService.getEntry(
				className, classPK);

			ServiceContext serviceContext = ServiceContextFactory.getInstance(
				actionRequest);

			long[] segmentsEntryIds = GetterUtil.getLongValues(
<<<<<<< HEAD
				_getSegmentsEntryIds(httpServletRequest),
=======
				actionRequest.getAttribute(SegmentsWebKeys.SEGMENTS_ENTRY_IDS),
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
				new long[] {SegmentsEntryConstants.ID_DEFAULT});

			for (long segmentsEntryId : segmentsEntryIds) {
				_assetListEntryService.addAssetEntrySelection(
					assetListEntryId, assetEntry.getEntryId(), segmentsEntryId,
					serviceContext);
			}
		}

<<<<<<< HEAD
		SessionMessages.add(httpServletRequest, "collectionItemAdded");
=======
		SessionMessages.add(
			_portal.getHttpServletRequest(actionRequest),
			"collectionItemAdded");
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		sendRedirect(actionRequest, actionResponse);
	}

<<<<<<< HEAD
	private long[] _getSegmentsEntryIds(HttpServletRequest httpServletRequest)
		throws Exception {

		return _segmentsEntryRetriever.getSegmentsEntryIds(
			_portal.getScopeGroupId(httpServletRequest),
			_portal.getUserId(httpServletRequest),
			_requestContextMapper.map(httpServletRequest));
	}

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	@Reference
	private AssetEntryService _assetEntryService;

	@Reference
	private AssetListEntryService _assetListEntryService;

	@Reference
	private Portal _portal;

<<<<<<< HEAD
	@Reference
	private RequestContextMapper _requestContextMapper;

	@Reference
	private SegmentsEntryRetriever _segmentsEntryRetriever;

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
}