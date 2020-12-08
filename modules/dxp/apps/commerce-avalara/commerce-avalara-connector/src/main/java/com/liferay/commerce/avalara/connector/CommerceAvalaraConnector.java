/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */

package com.liferay.commerce.avalara.connector;

import com.liferay.petra.string.StringBundler;

import net.avalara.avatax.rest.client.AvaTaxClient;
import net.avalara.avatax.rest.client.models.PingResultModel;

/**
 * @author Calvin Keum
 */
public class CommerceAvalaraConnector {

	public CommerceAvalaraConnector(String accountId, String licenseKey) {
		setCredentials(accountId, licenseKey, _avaTaxEnvironment);
	}

	public CommerceAvalaraConnector(
		String accountId, String licenseKey, String serviceURL) {

		setCredentials(accountId, licenseKey, serviceURL);
	}

	public void setCredentials(
		String accountId, String licenseKey, String serviceURL) {

		_avaTaxClient = new AvaTaxClient(
			_appName, _appVersion, _machineName, serviceURL);

		StringBundler sb = new StringBundler(3);

		sb.append(accountId);
		sb.append(licenseKey);
		sb.append(serviceURL);

		_avaTaxClient = _avaTaxClient.withSecurity(sb.toString());
	}

	public boolean verifyConnection() {
		try {
			PingResultModel pingResultModel = _avaTaxClient.ping();

			if (pingResultModel.getAuthenticated()) {
				return true;
			}
		}
		catch (Exception exception) {
			return false;
		}

		return false;
	}

	private String _appName = "LiferayCommerceAvalaraConnector";
	private String _appVersion = "1.0";
	private AvaTaxClient _avaTaxClient;
	private String _avaTaxEnvironment =
		"https://sandbox-rest.avatax.com/api/v2/";
	private String _machineName = "Liferay";

}