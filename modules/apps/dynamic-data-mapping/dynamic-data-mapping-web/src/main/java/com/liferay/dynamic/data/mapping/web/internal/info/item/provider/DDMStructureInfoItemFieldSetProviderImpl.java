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

package com.liferay.dynamic.data.mapping.web.internal.info.item.provider;

import com.liferay.dynamic.data.mapping.exception.NoSuchStructureException;
import com.liferay.dynamic.data.mapping.info.field.converter.DDMFormFieldInfoFieldConverter;
import com.liferay.dynamic.data.mapping.info.item.provider.DDMStructureInfoItemFieldSetProvider;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
<<<<<<< HEAD
import com.liferay.dynamic.data.mapping.model.DDMFormFieldType;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.service.DDMStructureLocalService;
import com.liferay.info.field.InfoFieldSet;
import com.liferay.info.localized.InfoLocalizedValue;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.util.ArrayUtil;
import com.liferay.portal.kernel.util.Validator;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Jürgen Kappler
 * @author Jorge Ferrer
 */
@Component(service = DDMStructureInfoItemFieldSetProvider.class)
public class DDMStructureInfoItemFieldSetProviderImpl
	implements DDMStructureInfoItemFieldSetProvider {

	@Override
	public InfoFieldSet getInfoItemFieldSet(long ddmStructureId)
		throws NoSuchStructureException {

		return getInfoItemFieldSet(ddmStructureId, null);
	}

	@Override
	public InfoFieldSet getInfoItemFieldSet(
			long ddmStructureId,
			InfoLocalizedValue<String> fieldSetNameInfoLocalizedValue)
		throws NoSuchStructureException {

		try {
			DDMStructure ddmStructure =
				_ddmStructureLocalService.getDDMStructure(ddmStructureId);

			if (fieldSetNameInfoLocalizedValue == null) {
				fieldSetNameInfoLocalizedValue =
					InfoLocalizedValue.<String>builder(
					).values(
						ddmStructure.getNameMap()
					).build();
			}

			return InfoFieldSet.builder(
			).infoFieldSetEntry(
				consumer -> {
					for (DDMFormField ddmFormField :
							ddmStructure.getDDMFormFields(false)) {

						if (Validator.isNotNull(ddmFormField.getIndexType()) &&
							ArrayUtil.contains(
								_SELECTABLE_DDM_STRUCTURE_FIELDS,
								ddmFormField.getType())) {

							consumer.accept(
								_ddmFormFieldInfoFieldConverter.convert(
									ddmFormField));
						}
					}
				}
			).labelInfoLocalizedValue(
				fieldSetNameInfoLocalizedValue
			).name(
				ddmStructure.getStructureKey()
			).build();
		}
		catch (NoSuchStructureException noSuchStructureException) {
			throw noSuchStructureException;
		}
		catch (PortalException portalException) {
			throw new RuntimeException(
				"Caught unexpected exception", portalException);
		}
	}

	private static final String[] _SELECTABLE_DDM_STRUCTURE_FIELDS = {
<<<<<<< HEAD
		DDMFormFieldType.CHECKBOX, DDMFormFieldType.DATE,
		DDMFormFieldType.DECIMAL, DDMFormFieldType.IMAGE,
		DDMFormFieldType.INTEGER, DDMFormFieldType.NUMBER,
		DDMFormFieldType.TEXT_HTML, DDMFormFieldType.RADIO,
		DDMFormFieldType.SELECT, DDMFormFieldType.TEXT,
		DDMFormFieldType.TEXT_AREA, "image", "rich_text"
=======
		"checkbox", "ddm-date", "ddm-decimal", "ddm-image", "ddm-integer",
		"ddm-number", "ddm-text-html", "image", "radio", "rich_text", "select",
		"text", "textarea"
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	};

	@Reference
	private DDMFormFieldInfoFieldConverter _ddmFormFieldInfoFieldConverter;

	@Reference
	private DDMStructureLocalService _ddmStructureLocalService;

}