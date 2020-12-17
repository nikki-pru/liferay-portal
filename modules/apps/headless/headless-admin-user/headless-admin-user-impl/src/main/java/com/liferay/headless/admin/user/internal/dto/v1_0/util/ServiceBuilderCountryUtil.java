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

package com.liferay.headless.admin.user.internal.dto.v1_0.util;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Country;
import com.liferay.portal.kernel.service.CountryServiceUtil;

import java.util.Optional;

/**
 * @author Drew Brokke
 */
public class ServiceBuilderCountryUtil {

<<<<<<< HEAD
	public static Country toServiceBuilderCountry(
		long companyId, String addressCountry) {

		try {
			Country country = CountryServiceUtil.fetchCountryByA2(
				companyId, addressCountry);
=======
	public static Country toServiceBuilderCountry(String addressCountry) {
		try {
			Country country = CountryServiceUtil.fetchCountryByA2(
				addressCountry);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

			if (country != null) {
				return country;
			}

<<<<<<< HEAD
			country = CountryServiceUtil.fetchCountryByA3(
				companyId, addressCountry);
=======
			country = CountryServiceUtil.fetchCountryByA3(addressCountry);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

			if (country != null) {
				return country;
			}

<<<<<<< HEAD
			return CountryServiceUtil.getCountryByName(
				companyId, addressCountry);
=======
			return CountryServiceUtil.getCountryByName(addressCountry);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		}
		catch (Exception exception) {
			if (_log.isWarnEnabled()) {
				_log.warn(exception, exception);
			}
		}

		return null;
	}

<<<<<<< HEAD
	public static long toServiceBuilderCountryId(
		long companyId, String addressCountry) {

		return Optional.ofNullable(
			addressCountry
		).map(
			country -> toServiceBuilderCountry(companyId, country)
=======
	public static long toServiceBuilderCountryId(String addressCountry) {
		return Optional.ofNullable(
			addressCountry
		).map(
			ServiceBuilderCountryUtil::toServiceBuilderCountry
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		).map(
			Country::getCountryId
		).orElse(
			(long)0
		);
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ServiceBuilderCountryUtil.class);

}