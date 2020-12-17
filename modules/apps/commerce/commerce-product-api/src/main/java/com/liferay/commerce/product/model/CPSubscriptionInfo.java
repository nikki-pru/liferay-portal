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

package com.liferay.commerce.product.model;

import com.liferay.portal.kernel.util.UnicodeProperties;

/**
 * @author Alessio Antonio Rendina
 */
public class CPSubscriptionInfo {

	public CPSubscriptionInfo(
		int subscriptionLength, String subscriptionType,
		UnicodeProperties subscriptionTypeSettingsUnicodeProperties,
<<<<<<< HEAD
		long maxSubscriptionCycles, int deliverySubscriptionLength,
		String deliverySubscriptionType,
		UnicodeProperties deliverySubscriptionTypeSettingsUnicodeProperties,
		long deliveryMaxSubscriptionCycles) {
=======
		long maxSubscriptionCycleNumber, int deliverySubscriptionLength,
		String deliverySubscriptionType,
		UnicodeProperties deliverySubscriptionTypeSettingsUnicodeProperties,
		long deliveryMaxSubscriptionCycleNumber) {
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		_subscriptionLength = subscriptionLength;
		_subscriptionType = subscriptionType;
		_subscriptionTypeSettingsUnicodeProperties =
			subscriptionTypeSettingsUnicodeProperties;
<<<<<<< HEAD
		_maxSubscriptionCycles = maxSubscriptionCycles;
=======
		_maxSubscriptionCycles = maxSubscriptionCycleNumber;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		_deliverySubscriptionLength = deliverySubscriptionLength;
		_deliverySubscriptionType = deliverySubscriptionType;
		_deliverySubscriptionTypeSettingsUnicodeProperties =
			deliverySubscriptionTypeSettingsUnicodeProperties;
<<<<<<< HEAD
		_deliveryMaxSubscriptionCycles = deliveryMaxSubscriptionCycles;
=======
		_deliveryMaxSubscriptionCycles = deliveryMaxSubscriptionCycleNumber;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	public long getDeliveryMaxSubscriptionCycles() {
		return _deliveryMaxSubscriptionCycles;
	}

	public int getDeliverySubscriptionLength() {
		return _deliverySubscriptionLength;
	}

	public String getDeliverySubscriptionType() {
		return _deliverySubscriptionType;
	}

	public UnicodeProperties getDeliverySubscriptionTypeSettingsProperties() {
		return _deliverySubscriptionTypeSettingsUnicodeProperties;
	}

	public long getMaxSubscriptionCycles() {
		return _maxSubscriptionCycles;
	}

	public int getSubscriptionLength() {
		return _subscriptionLength;
	}

	public String getSubscriptionType() {
		return _subscriptionType;
	}

	public UnicodeProperties getSubscriptionTypeSettingsProperties() {
		return _subscriptionTypeSettingsUnicodeProperties;
	}

	private final long _deliveryMaxSubscriptionCycles;
	private final int _deliverySubscriptionLength;
	private final String _deliverySubscriptionType;
	private final UnicodeProperties
		_deliverySubscriptionTypeSettingsUnicodeProperties;
	private final long _maxSubscriptionCycles;
	private final int _subscriptionLength;
	private final String _subscriptionType;
	private final UnicodeProperties _subscriptionTypeSettingsUnicodeProperties;

}