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

import * as Utils from '../../../src/main/resources/META-INF/resources/components/quantity_selector/utils/index';

describe('generateOption`s working', () => {
	it('display allowedQuantities as options if this is not empty', () => {
		const allowed = [2, 4, 65, 33, 913, 267, 323, 122, 90, 113];
		expect(Utils.generateOptions({allowedQuantity: allowed})).toEqual(
			allowed
		);
	});

	it('options must be from minQuantity to maxQuantity if allowedQuantities is empty', () => {
		expect(
			Utils.generateOptions({
				allowedQuantity: [],
				maxQuantity: 5,
				minQuantity: 2,
			})
		).toEqual([2, 3, 4, 5]);
	});

	it('display allowedQuantity as options if it is not empty, even if minQuantity and maxQuantity are setted', () => {
		expect(
			Utils.generateOptions({
				allowedQuantity: [3, 5, 7, 9],
				maxQuantity: 9,
				minQuantity: 1,
				multipleQuantity: 2,
			})
		).toEqual([3, 5, 7, 9]);
	});

	it('display multiplied quantites if multipleQuantity is more than 1', () => {
		expect(
			Utils.generateOptions({
				allowedQuantity: [],
				maxQuantity: 4,
				minQuantity: 1,
				multipleQuantity: 2,
			})
		).toEqual([2, 4, 6, 8]);
	});

	it('display only one option if allowedQuantity, maxQuantity, minQuantity and multipleQuantity are not set', () => {
		expect(Utils.generateOptions({})).toEqual([1]);
	});
});
