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

import com.liferay.app.builder.deploy.AppDeployer;
import com.liferay.app.builder.service.AppBuilderAppLocalService;
import com.liferay.app.builder.web.internal.portlet.AppPortlet;
import com.liferay.application.list.PanelApp;
import com.liferay.portal.kernel.model.LayoutTypeAccessPolicy;
import com.liferay.portal.kernel.model.LayoutTypeController;

import java.util.Dictionary;
import java.util.Map;

import javax.portlet.Portlet;

import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Rafael Praxedes
 */
public abstract class BaseAppDeployer implements AppDeployer {

	@Activate
	protected void activate(BundleContext bundleContext) {
		_bundleContext = bundleContext;
	}

	@Deactivate
	protected void deactivate() {
		_bundleContext = null;
	}

	protected ServiceRegistration<?> deployLayoutTypeAccessPolicy(
		LayoutTypeAccessPolicy layoutTypeAccessPolicy,
		Dictionary<String, Object> properties) {

		return _bundleContext.registerService(
			LayoutTypeAccessPolicy.class, layoutTypeAccessPolicy, properties);
	}

	protected ServiceRegistration<?> deployLayoutTypeController(
		LayoutTypeController layoutTypeController,
		Dictionary<String, Object> properties) {

		return _bundleContext.registerService(
			LayoutTypeController.class, layoutTypeController, properties);
	}

	protected ServiceRegistration<?> deployPanelApp(
		PanelApp panelApp, Dictionary<String, Object> properties) {

		return _bundleContext.registerService(
			PanelApp.class, panelApp, properties);
	}

	protected ServiceRegistration<?> deployPortlet(
		AppPortlet appPortlet, Map<String, Object> customProperties) {

		return _bundleContext.registerService(
			Portlet.class, appPortlet,
			appPortlet.getProperties(customProperties));
	}

	@Reference
	protected AppBuilderAppLocalService appBuilderAppLocalService;

	private BundleContext _bundleContext;

}