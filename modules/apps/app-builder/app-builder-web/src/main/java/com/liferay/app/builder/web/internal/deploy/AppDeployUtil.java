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

package com.liferay.app.builder.web.internal.deploy;

import com.liferay.app.builder.portlet.tab.AppBuilderAppPortletTab;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerCustomizerFactory;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerCustomizerFactory.ServiceWrapper;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMap;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMapFactory;
import com.liferay.portal.kernel.portlet.bridges.mvc.MVCResourceCommand;

import java.util.List;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;

/**
 * @author Inácio Nery
 */
@Component(immediate = true, service = {})
public class AppDeployUtil {

	public static AppBuilderAppPortletTab getAppBuilderAppPortletTab(
		String name) {

		return _appBuilderAppPortletTabServiceTrackerMap.getService(name);
	}

	public static List<ServiceWrapper<MVCResourceCommand>> getServices(
		String name) {

		return _appPortletMVCResourceCommandServiceTrackerMap.getService(name);
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
		_appBuilderAppPortletTabServiceTrackerMap =
			ServiceTrackerMapFactory.openSingleValueMap(
				bundleContext, AppBuilderAppPortletTab.class,
				"app.builder.app.tab.name");
		_appPortletMVCResourceCommandServiceTrackerMap =
			ServiceTrackerMapFactory.openMultiValueMap(
				bundleContext, MVCResourceCommand.class,
				"app.builder.app.scope",
				ServiceTrackerCustomizerFactory.
					<MVCResourceCommand>serviceWrapper(bundleContext));
	}

	@Deactivate
	protected void deactivate() {
		_appBuilderAppPortletTabServiceTrackerMap.close();
		_appPortletMVCResourceCommandServiceTrackerMap.close();
	}

	private static ServiceTrackerMap<String, AppBuilderAppPortletTab>
		_appBuilderAppPortletTabServiceTrackerMap;
	private static ServiceTrackerMap
		<String, List<ServiceWrapper<MVCResourceCommand>>>
			_appPortletMVCResourceCommandServiceTrackerMap;

}