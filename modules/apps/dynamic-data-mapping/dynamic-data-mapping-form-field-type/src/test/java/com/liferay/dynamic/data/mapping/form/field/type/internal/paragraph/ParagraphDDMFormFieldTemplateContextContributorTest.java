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

package com.liferay.dynamic.data.mapping.form.field.type.internal.paragraph;

<<<<<<< HEAD
=======
import com.google.template.soy.data.SanitizedContent;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.dynamic.data.mapping.form.field.type.BaseDDMFormFieldTypeSettingsTestCase;
import com.liferay.dynamic.data.mapping.model.DDMFormField;
import com.liferay.dynamic.data.mapping.model.LocalizedValue;
import com.liferay.dynamic.data.mapping.render.DDMFormFieldRenderingContext;
<<<<<<< HEAD
=======
import com.liferay.portal.kernel.test.ReflectionTestUtil;
import com.liferay.portal.kernel.util.HtmlUtil;
import com.liferay.portal.template.soy.internal.data.SoyDataFactoryImpl;
import com.liferay.portal.util.HtmlImpl;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

import java.util.Map;

import org.junit.Assert;
<<<<<<< HEAD
=======
import org.junit.Before;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import org.junit.Test;

/**
 * @author Pedro Queiroz
 */
public class ParagraphDDMFormFieldTemplateContextContributorTest
	extends BaseDDMFormFieldTypeSettingsTestCase {

<<<<<<< HEAD
=======
	@Before
	@Override
	public void setUp() {
		HtmlUtil htmlUtil = new HtmlUtil();

		htmlUtil.setHtml(new HtmlImpl());

		ReflectionTestUtil.setFieldValue(
			_paragraphDDMFormFieldTemplateContextContributor, "_soyDataFactory",
			new SoyDataFactoryImpl());
	}

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	@Test
	public void testGetParameters() {
		DDMFormField ddmFormField = new DDMFormField("field", "paragraph");

		LocalizedValue text = new LocalizedValue();

		text.addString(text.getDefaultLocale(), "<b>This is a header</b>\n");

		ddmFormField.setProperty("text", text);

		Map<String, Object> parameters =
			_paragraphDDMFormFieldTemplateContextContributor.getParameters(
				ddmFormField, new DDMFormFieldRenderingContext());

<<<<<<< HEAD
		Assert.assertEquals(
			text.getString(text.getDefaultLocale()), parameters.get("text"));
=======
		SanitizedContent sanitizedContent = (SanitizedContent)parameters.get(
			"text");

		Assert.assertEquals(
			text.getString(text.getDefaultLocale()),
			sanitizedContent.getContent());
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	@Test
	public void testGetParametersWhenInViewMode() {
		DDMFormField ddmFormField = new DDMFormField("field", "paragraph");

		LocalizedValue text = new LocalizedValue();

		text.addString(text.getDefaultLocale(), "<p>This is a paragraph</p>\n");

		ddmFormField.setProperty("text", text);

		DDMFormFieldRenderingContext ddmFormFieldRenderingContext =
			new DDMFormFieldRenderingContext();

		ddmFormFieldRenderingContext.setViewMode(true);

		Map<String, Object> parameters =
			_paragraphDDMFormFieldTemplateContextContributor.getParameters(
				ddmFormField, ddmFormFieldRenderingContext);

<<<<<<< HEAD
		Assert.assertEquals(
			text.getString(text.getDefaultLocale()), parameters.get("text"));
=======
		SanitizedContent sanitizedContent = (SanitizedContent)parameters.get(
			"text");

		Assert.assertEquals(
			text.getString(text.getDefaultLocale()),
			sanitizedContent.getContent());
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	private final ParagraphDDMFormFieldTemplateContextContributor
		_paragraphDDMFormFieldTemplateContextContributor =
			new ParagraphDDMFormFieldTemplateContextContributor();

}