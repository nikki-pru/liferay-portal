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

package com.liferay.info.localized.bundle;

import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.petra.lang.HashUtil;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.ResourceBundleUtil;

import java.util.Locale;
import java.util.MissingResourceException;
import java.util.Objects;
import java.util.ResourceBundle;
import java.util.Set;

/**
 * @author Jorge Ferrer
 */
public class ResourceBundleInfoLocalizedValue
	implements InfoLocalizedValue<String> {

	public ResourceBundleInfoLocalizedValue(Class<?> clazz, String valueKey) {
<<<<<<< HEAD
		_clazz = clazz;
=======
		_class = clazz;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		_valueKey = valueKey;

		_symbolicName = null;
	}

	public ResourceBundleInfoLocalizedValue(
		String symbolicName, String valueKey) {

		_symbolicName = symbolicName;
		_valueKey = valueKey;

<<<<<<< HEAD
		_clazz = null;
=======
		_class = null;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	@Override
	public boolean equals(Object object) {
		if (this == object) {
			return true;
		}

		if (!(object instanceof ResourceBundleInfoLocalizedValue)) {
			return false;
		}

		ResourceBundleInfoLocalizedValue resourceBundleInfoLocalizedValue =
			(ResourceBundleInfoLocalizedValue)object;

		return Objects.equals(
			resourceBundleInfoLocalizedValue._valueKey, _valueKey);
	}

	@Override
	public Set<Locale> getAvailableLocales() {
		return LanguageUtil.getAvailableLocales();
	}

	@Override
	public Locale getDefaultLocale() {
		return LocaleUtil.getDefault();
	}

	@Override
	public String getValue() {
		return getValue(getDefaultLocale());
	}

	@Override
	public String getValue(Locale locale) {
		ResourceBundle resourceBundle = null;

		try {
<<<<<<< HEAD
			if (_clazz != null) {
				resourceBundle = ResourceBundleUtil.getBundle(locale, _clazz);
=======
			if (_class != null) {
				resourceBundle = ResourceBundleUtil.getBundle(locale, _class);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			}
			else {
				resourceBundle = ResourceBundleUtil.getBundle(
					locale, _symbolicName);
			}
		}
		catch (MissingResourceException missingResourceException) {
			if (_log.isDebugEnabled()) {
				_log.debug(
					"Reverting to default resource bundle because no " +
						"resource bundle could be found with " + locale,
					missingResourceException);
			}

			return LanguageUtil.get(locale, _valueKey);
		}

		return LanguageUtil.get(resourceBundle, _valueKey);
	}

	@Override
	public int hashCode() {
		return HashUtil.hash(0, _valueKey);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ResourceBundleInfoLocalizedValue.class);

<<<<<<< HEAD
	private final Class<?> _clazz;
=======
	private final Class<?> _class;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	private final String _symbolicName;
	private final String _valueKey;

}