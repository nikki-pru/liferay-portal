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

package com.liferay.data.engine.rest.strategy.util;

import com.liferay.dynamic.data.mapping.form.renderer.constants.DDMFormRendererConstants;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.util.Validator;

/**
 * @author Marcos Martins
 * @author Rodrigo Paulino
 */
public class DataRecordValueKeyUtil {

	public static String createDataRecordValueKey(
		String fieldName, String instanceId, String parentDataRecordValueKey,
		int repeatableIndex) {

		if (Validator.isNotNull(parentDataRecordValueKey)) {
			parentDataRecordValueKey =
				parentDataRecordValueKey +
					DDMFormRendererConstants.DDM_FORM_FIELDS_SEPARATOR;
		}

		return StringBundler.concat(
			parentDataRecordValueKey, fieldName,
			DDMFormRendererConstants.DDM_FORM_FIELD_PARTS_SEPARATOR, instanceId,
			DDMFormRendererConstants.DDM_FORM_FIELD_PARTS_SEPARATOR,
			repeatableIndex);
	}

}