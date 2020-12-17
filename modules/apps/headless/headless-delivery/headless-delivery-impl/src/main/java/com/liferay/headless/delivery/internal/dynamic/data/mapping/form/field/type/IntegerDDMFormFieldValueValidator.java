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

package com.liferay.headless.delivery.internal.dynamic.data.mapping.form.field.type;

import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldValueValidationException;
import com.liferay.dynamic.data.mapping.form.field.type.DDMFormFieldValueValidator;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
<<<<<<< HEAD
import com.liferay.dynamic.data.mapping.model.DDMFormFieldType;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.dynamic.data.mapping.model.Value;
import com.liferay.portal.kernel.util.Validator;

import java.util.Locale;

import org.osgi.service.component.annotations.Component;

/**
 * @author Marcellus Tavares
 */
@Component(
<<<<<<< HEAD
	immediate = true,
	property = "ddm.form.field.type.name=" + DDMFormFieldType.INTEGER,
=======
	immediate = true, property = "ddm.form.field.type.name=ddm-integer",
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	service = DDMFormFieldValueValidator.class
)
public class IntegerDDMFormFieldValueValidator
	implements DDMFormFieldValueValidator {

	@Override
	public void validate(DDMFormField ddmFormField, Value value)
		throws DDMFormFieldValueValidationException {

		for (Locale availableLocale : value.getAvailableLocales()) {
			String valueString = value.getString(availableLocale);

			if (Validator.isNotNull(valueString) &&
				!Validator.isNumber(valueString)) {

				throw new DDMFormFieldValueValidationException(
					String.format(
						"\"%s\" is not a valid integer", valueString));
			}
		}
	}

}