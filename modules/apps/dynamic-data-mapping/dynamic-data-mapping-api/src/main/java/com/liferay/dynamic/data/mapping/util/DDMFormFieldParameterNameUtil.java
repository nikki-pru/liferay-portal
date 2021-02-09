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

package com.liferay.dynamic.data.mapping.util;

import com.liferay.dynamic.data.mapping.form.renderer.constants.DDMFormRendererConstants;
import com.liferay.portal.kernel.util.StringUtil;

import java.util.Optional;

/**
 * @author Marcos Martins
 * @author Rodrigo Paulino
 */
public class DDMFormFieldParameterNameUtil {

	public static final int DDM_FORM_FIELD_INDEX_INDEX = 2;

	public static final int DDM_FORM_FIELD_INSTANCE_ID_INDEX = 1;

	public static final int DDM_FORM_FIELD_NAME_INDEX = 0;

	public static String[] getLastDDMFormFieldParameterNameParts(
		String ddmFormFieldParameterName) {

		return StringUtil.split(
			Optional.ofNullable(
				StringUtil.extractLast(
					ddmFormFieldParameterName,
					DDMFormRendererConstants.DDM_FORM_FIELDS_SEPARATOR)
			).orElse(
				ddmFormFieldParameterName
			),
			DDMFormRendererConstants.DDM_FORM_FIELD_PARTS_SEPARATOR);
	}

}