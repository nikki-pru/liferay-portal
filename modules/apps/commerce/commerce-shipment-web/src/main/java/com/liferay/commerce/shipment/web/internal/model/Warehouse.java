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

package com.liferay.commerce.shipment.web.internal.model;

/**
 * @author Alec Sloan
 */
public class Warehouse {

	public Warehouse(
<<<<<<< HEAD
		long warehouseId, WarehouseItem warehouseItem, int available,
=======
		long warehouseId, WarehouseItem warehouseItem, int availabile,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		String distance, String name) {

		_warehouseId = warehouseId;
		_warehouseItem = warehouseItem;
<<<<<<< HEAD
		_available = available;
=======
		_available = availabile;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		_distance = distance;
		_name = name;
	}

	public int getAvailable() {
		return _available;
	}

	public String getDistance() {
		return _distance;
	}

	public String getName() {
		return _name;
	}

	public long getWarehouseId() {
		return _warehouseId;
	}

	public WarehouseItem getWarehouseItem() {
		return _warehouseItem;
	}

	private final int _available;
	private final String _distance;
	private final String _name;
	private final long _warehouseId;
	private final WarehouseItem _warehouseItem;

}