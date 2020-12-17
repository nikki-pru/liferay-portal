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

package com.liferay.dynamic.data.mapping.internal.render;

<<<<<<< HEAD
import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldTypeServicesTracker;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderer;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRendererRegistry;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRendererRegistryUtil;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMap;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMapFactory;

<<<<<<< HEAD
import java.util.Set;

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
<<<<<<< HEAD
import org.osgi.service.component.annotations.Reference;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

/**
 * @author Pablo Carvalho
 */
@Component(immediate = true, service = DDMFormFieldRendererRegistry.class)
public class DDMFormFieldRendererRegistryImpl
	implements DDMFormFieldRendererRegistry {

	@Override
	public DDMFormFieldRenderer getDDMFormFieldRenderer(
		String ddmFormFieldType) {

<<<<<<< HEAD
		DDMFormFieldRenderer ddmFormFieldRenderer =
			_serviceTrackerMap.getService(ddmFormFieldType);

		if (ddmFormFieldRenderer != null) {
			return ddmFormFieldRenderer;
		}

		Set<String> ddmFormFieldTypeNames =
			_ddmFormFieldTypeServicesTracker.getDDMFormFieldTypeNames();

		if (ddmFormFieldTypeNames.contains(ddmFormFieldType)) {
			return _bundleContext.getService(
				_serviceRegistration.getReference());
		}

		return null;
=======
		return _serviceTrackerMap.getService(ddmFormFieldType);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	@Activate
	protected void activate(BundleContext bundleContext) {
<<<<<<< HEAD
		_bundleContext = bundleContext;

		_serviceRegistration = _bundleContext.registerService(
=======
		_serviceRegistration = bundleContext.registerService(
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			DDMFormFieldRenderer.class, new DDMFormFieldFreeMarkerRenderer(),
			null);

		_serviceTrackerMap = ServiceTrackerMapFactory.openSingleValueMap(
<<<<<<< HEAD
			_bundleContext, DDMFormFieldRenderer.class, null,
			(serviceReference, emitter) -> {
				DDMFormFieldRenderer ddmFormFieldRenderer =
					_bundleContext.getService(serviceReference);
=======
			bundleContext, DDMFormFieldRenderer.class, null,
			(serviceReference, emitter) -> {
				DDMFormFieldRenderer ddmFormFieldRenderer =
					bundleContext.getService(serviceReference);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

				try {
					for (String supportedDDMFormFieldType :
							ddmFormFieldRenderer.
								getSupportedDDMFormFieldTypes()) {

						emitter.emit(supportedDDMFormFieldType);
					}
				}
				finally {
<<<<<<< HEAD
					_bundleContext.ungetService(serviceReference);
=======
					bundleContext.ungetService(serviceReference);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
				}
			});

		DDMFormFieldRendererRegistryUtil ddmFormFieldRendererRegistryUtil =
			new DDMFormFieldRendererRegistryUtil();

		ddmFormFieldRendererRegistryUtil.setDDMFormFieldRendererRegistry(this);
	}

	@Deactivate
	protected void deactivate() {
		_ddmFormFieldRendererRegistryUtil.setDDMFormFieldRendererRegistry(null);

		_serviceTrackerMap.close();

		_serviceRegistration.unregister();
	}

<<<<<<< HEAD
	private BundleContext _bundleContext;
	private final DDMFormFieldRendererRegistryUtil
		_ddmFormFieldRendererRegistryUtil =
			new DDMFormFieldRendererRegistryUtil();

	@Reference
	private DDMFormFieldTypeServicesTracker _ddmFormFieldTypeServicesTracker;

	private ServiceRegistration<DDMFormFieldRenderer> _serviceRegistration;
=======
	private final DDMFormFieldRendererRegistryUtil
		_ddmFormFieldRendererRegistryUtil =
			new DDMFormFieldRendererRegistryUtil();
	private ServiceRegistration<?> _serviceRegistration;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	private ServiceTrackerMap<String, DDMFormFieldRenderer> _serviceTrackerMap;

}