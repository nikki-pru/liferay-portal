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

package com.liferay.portal.service.impl;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Country;
import com.liferay.portal.kernel.security.access.control.AccessControlled;
import com.liferay.portal.kernel.security.auth.PrincipalException;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.service.ServiceContext;
<<<<<<< HEAD
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.service.base.CountryServiceBaseImpl;
import com.liferay.portal.util.PortalInstances;

import java.util.List;
=======
import com.liferay.portal.service.base.CountryServiceBaseImpl;
import com.liferay.portal.util.PortalInstances;
import com.liferay.portal.util.PropsValues;

import java.util.Collections;
import java.util.List;
import java.util.Map;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

/**
 * @author Brian Wing Shun Chan
 */
public class CountryServiceImpl extends CountryServiceBaseImpl {

	@Override
	public Country addCountry(
			String a2, String a3, boolean active, boolean billingAllowed,
			String idd, String name, String number, double position,
			boolean shippingAllowed, boolean subjectToVAT, boolean zipRequired,
<<<<<<< HEAD
			ServiceContext serviceContext)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		if (!permissionChecker.isOmniadmin()) {
=======
			Map<String, String> titleMap, ServiceContext serviceContext)
		throws PortalException {

		if (!getPermissionChecker().isOmniadmin()) {
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			throw new PrincipalException.MustBeOmniadmin(
				getPermissionChecker());
		}

		return countryLocalService.addCountry(
			a2, a3, active, billingAllowed, idd, name, number, position,
<<<<<<< HEAD
			shippingAllowed, subjectToVAT, zipRequired, serviceContext);
=======
			shippingAllowed, subjectToVAT, zipRequired, titleMap,
			serviceContext);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country addCountry(
			String name, String a2, String a3, String number, String idd,
			boolean active)
		throws PortalException {

		ServiceContext serviceContext = new ServiceContext();

		PermissionChecker permissionChecker = getPermissionChecker();

		serviceContext.setCompanyId(permissionChecker.getCompanyId());
		serviceContext.setUserId(permissionChecker.getUserId());

		return addCountry(
			a2, a3, active, true, idd, name, number, 0, true, false, true,
<<<<<<< HEAD
=======
			Collections.singletonMap(PropsValues.COMPANY_DEFAULT_LOCALE, name),
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			serviceContext);
	}

	@Override
<<<<<<< HEAD
	public void deleteCountry(long countryId) throws PortalException {
		PermissionChecker permissionChecker = getPermissionChecker();

		if (!permissionChecker.isOmniadmin()) {
			throw new PrincipalException.MustBeOmniadmin(
				getPermissionChecker());
		}

		countryLocalService.deleteCountry(countryId);
	}

	@Override
	public Country fetchCountry(long countryId) {
		return countryLocalService.fetchCountry(countryId);
	}

	@Override
	public Country fetchCountryByA2(long companyId, String a2) {
		return countryLocalService.fetchCountryByA2(companyId, a2);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country fetchCountryByA2(String a2) {
		return fetchCountryByA2(PortalInstances.getDefaultCompanyId(), a2);
	}

	@Override
	public Country fetchCountryByA3(long companyId, String a3) {
		return countryLocalService.fetchCountryByA3(companyId, a3);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country fetchCountryByA3(String a3) {
		return fetchCountryByA3(PortalInstances.getDefaultCompanyId(), a3);
	}

	@Override
	public List<Country> getCompanyCountries(long companyId) {
		return countryLocalService.getCompanyCountries(companyId);
	}

	@AccessControlled(guestAccessEnabled = true)
	@Override
	public List<Country> getCompanyCountries(long companyId, boolean active) {
		return countryLocalService.getCompanyCountries(companyId, active);
	}

	@Override
	public List<Country> getCompanyCountries(
		long companyId, boolean active, int start, int end,
		OrderByComparator<Country> orderByComparator) {

		return countryLocalService.getCompanyCountries(
			companyId, active, start, end, orderByComparator);
	}

	@Override
	public List<Country> getCompanyCountries(
		long companyId, int start, int end,
		OrderByComparator<Country> orderByComparator) {

		return countryLocalService.getCompanyCountries(
			companyId, start, end, orderByComparator);
	}

	@Override
	public int getCompanyCountriesCount(long companyId) {
		return countryLocalService.getCompanyCountriesCount(companyId);
	}

	@Override
	public int getCompanyCountriesCount(long companyId, boolean active) {
		return countryLocalService.getCompanyCountriesCount(companyId, active);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public List<Country> getCountries() {
		return getCompanyCountries(PortalInstances.getDefaultCompanyId());
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@AccessControlled(guestAccessEnabled = true)
	@Deprecated
	@Override
	public List<Country> getCountries(boolean active) {
		return getCompanyCountries(
			PortalInstances.getDefaultCompanyId(), active);
=======
	public Country fetchCountry(long countryId) {
		return countryPersistence.fetchByPrimaryKey(countryId);
	}

	@Override
	public Country fetchCountryByA2(String a2) {
		return countryPersistence.fetchByC_A2(
			PortalInstances.getDefaultCompanyId(), a2);
	}

	@Override
	public Country fetchCountryByA3(String a3) {
		return countryPersistence.fetchByC_A3(
			PortalInstances.getDefaultCompanyId(), a3);
	}

	@Override
	public List<Country> getCountries() {
		return countryPersistence.findAll();
	}

	@AccessControlled(guestAccessEnabled = true)
	@Override
	public List<Country> getCountries(boolean active) {
		return countryPersistence.findByActive(active);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	@Override
	public Country getCountry(long countryId) throws PortalException {
<<<<<<< HEAD
		return countryLocalService.getCountry(countryId);
	}

	@Override
	public Country getCountryByA2(long companyId, String a2)
		throws PortalException {

		return countryLocalService.getCountryByA2(companyId, a2);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country getCountryByA2(String a2) throws PortalException {
		return getCountryByA2(PortalInstances.getDefaultCompanyId(), a2);
	}

	@Override
	public Country getCountryByA3(long companyId, String a3)
		throws PortalException {

		return countryLocalService.getCountryByA3(companyId, a3);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country getCountryByA3(String a3) throws PortalException {
		return getCountryByA3(PortalInstances.getDefaultCompanyId(), a3);
	}

	@Override
	public Country getCountryByName(long companyId, String name)
		throws PortalException {

		return countryLocalService.getCountryByName(companyId, name);
	}

	/**
	 * @deprecated As of Cavanaugh (7.4.x)
	 */
	@Deprecated
	@Override
	public Country getCountryByName(String name) throws PortalException {
		return getCountryByName(PortalInstances.getDefaultCompanyId(), name);
	}

	@Override
	public Country getCountryByNumber(long companyId, String number)
		throws PortalException {

		return countryLocalService.getCountryByNumber(companyId, number);
	}

	@Override
	public Country updateActive(long countryId, boolean active)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		if (!permissionChecker.isOmniadmin()) {
			throw new PrincipalException.MustBeOmniadmin(
				getPermissionChecker());
		}

		return countryLocalService.updateActive(countryId, active);
	}

	@Override
	public Country updateCountry(
			long countryId, String a2, String a3, boolean active,
			boolean billingAllowed, String idd, String name, String number,
			double position, boolean shippingAllowed, boolean subjectToVAT)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		if (!permissionChecker.isOmniadmin()) {
			throw new PrincipalException.MustBeOmniadmin(
				getPermissionChecker());
		}

		return countryLocalService.updateCountry(
			countryId, a2, a3, active, billingAllowed, idd, name, number,
			position, shippingAllowed, subjectToVAT);
	}

	@Override
	public Country updateGroupFilterEnabled(
			long countryId, boolean groupFilterEnabled)
		throws PortalException {

		PermissionChecker permissionChecker = getPermissionChecker();

		if (!permissionChecker.isOmniadmin()) {
			throw new PrincipalException.MustBeOmniadmin(
				getPermissionChecker());
		}

		return countryLocalService.updateGroupFilterEnabled(
			countryId, groupFilterEnabled);
=======
		return countryPersistence.findByPrimaryKey(countryId);
	}

	@Override
	public Country getCountryByA2(String a2) throws PortalException {
		return countryPersistence.findByC_A2(
			PortalInstances.getDefaultCompanyId(), a2);
	}

	@Override
	public Country getCountryByA3(String a3) throws PortalException {
		return countryPersistence.findByC_A3(
			PortalInstances.getDefaultCompanyId(), a3);
	}

	@Override
	public Country getCountryByName(String name) throws PortalException {
		return countryPersistence.findByC_N(
			PortalInstances.getDefaultCompanyId(), name);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

}