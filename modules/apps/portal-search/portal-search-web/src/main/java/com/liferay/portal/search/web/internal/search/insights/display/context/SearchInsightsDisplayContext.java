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

package com.liferay.portal.search.web.internal.search.insights.display.context;

import java.io.Serializable;

/**
 * @author Bryan Engler
 */
public class SearchInsightsDisplayContext implements Serializable {

	public String getHelpMessage() {
		return _helpMessage;
	}

	public String getRequestString() {
		return _requestString;
	}

	public String getResponseString() {
		return _responseString;
	}

	public void setHelpMessage(String helpMessage) {
		_helpMessage = helpMessage;
	}

	public void setRequestString(String queryString) {
		_requestString = queryString;
	}

	public void setResponseString(String responseString) {
		_responseString = responseString;
	}

	private String _helpMessage;
	private String _requestString;
	private String _responseString;

}