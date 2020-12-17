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

package com.liferay.frontend.taglib.form.navigator.internal.servlet.taglib.ui;

import com.liferay.frontend.taglib.form.navigator.FormNavigatorCategory;

import java.util.Locale;

/**
 * @author Eudaldo Alonso
 */
public class WrapperFormNavigatorCategory implements FormNavigatorCategory {

	public WrapperFormNavigatorCategory(
		com.liferay.portal.kernel.servlet.taglib.ui.FormNavigatorCategory
			formNavigatorCategory) {

		_formNavigatorCategory = formNavigatorCategory;
	}

<<<<<<< HEAD
	@Override
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	public String getFormNavigatorId() {
		return _formNavigatorCategory.getFormNavigatorId();
	}

<<<<<<< HEAD
	@Override
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	public String getKey() {
		return _formNavigatorCategory.getKey();
	}

<<<<<<< HEAD
	@Override
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	public String getLabel(Locale locale) {
		return _formNavigatorCategory.getLabel(locale);
	}

	private final
		com.liferay.portal.kernel.servlet.taglib.ui.FormNavigatorCategory
			_formNavigatorCategory;

}