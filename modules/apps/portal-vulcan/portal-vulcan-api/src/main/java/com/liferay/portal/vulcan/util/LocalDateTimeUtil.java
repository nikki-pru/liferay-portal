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

package com.liferay.portal.vulcan.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import java.util.Date;

/**
 * @author Brian Wing Shun Chan
 */
public class LocalDateTimeUtil {

	public static LocalDateTime toLocalDateTime(Date date) {
		return toLocalDateTime(date, null);
	}

	public static LocalDateTime toLocalDateTime(Date date, Date defaultDate) {
		Instant instant = null;

		if (date == null) {
			if (defaultDate == null) {
				defaultDate = new Date();
			}

			instant = defaultDate.toInstant();
		}
		else {
			instant = date.toInstant();
		}

		ZonedDateTime zonedDateTime = instant.atZone(ZoneId.systemDefault());

		return zonedDateTime.toLocalDateTime();
	}

}