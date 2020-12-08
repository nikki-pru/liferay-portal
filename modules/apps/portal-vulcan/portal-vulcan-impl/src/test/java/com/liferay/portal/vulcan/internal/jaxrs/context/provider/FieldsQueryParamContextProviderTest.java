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

package com.liferay.portal.vulcan.internal.jaxrs.context.provider;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

import com.liferay.portal.vulcan.fields.FieldsQueryParam;

import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.cxf.jaxrs.ext.ContextProvider;
import org.apache.cxf.message.Message;

import org.junit.Test;

import org.mockito.Mockito;

/**
 * @author Alejandro Hernández
 */
public class FieldsQueryParamContextProviderTest {

	@Test
	public void test() {

		// Null

		assertThat(_getFieldNames(null), is(nullValue()));

		// Empty

		assertThat(_getFieldNames(""), is(empty()));

		// Expanded

		assertThat(
			_getFieldNames("hello.hi.hello,potato"),
			containsInAnyOrder(
				"hello", "hello.hi", "hello.hi.hello", "potato"));

		// No duplicates

		assertThat(
			_getFieldNames("hello,hi,hello"),
			containsInAnyOrder("hello", "hi"));
	}

	private Set<String> _getFieldNames(String fieldNames) {
		ContextProvider<FieldsQueryParam> contextProvider =
			new FieldsQueryParamContextProvider();

		FieldsQueryParam fieldsQueryParam = contextProvider.createContext(
			_getMessage(fieldNames));

		return fieldsQueryParam.getFieldNames();
	}

	private Message _getMessage(String fieldNames) {
		Message message = Mockito.mock(Message.class);

		HttpServletRequest httpServletRequest = Mockito.mock(
			HttpServletRequest.class);

		Mockito.when(
			message.getContextualProperty("HTTP.REQUEST")
		).thenReturn(
			httpServletRequest
		);

		Mockito.when(
			httpServletRequest.getParameter("fields")
		).thenReturn(
			fieldNames
		);

		return message;
	}

}