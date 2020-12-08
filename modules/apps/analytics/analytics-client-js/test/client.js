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

import fetchMock from 'fetch-mock';

import Client from '../src/client';
import MessageQueue from '../src/messageQueue';
import {STORAGE_KEY_MESSAGES} from '../src/utils/constants';
import {wait} from './helpers';

const getMockMessageItem = (id = 0, data = {}) => {
	return {
		foo: 'bar',
		id: `${id}`,
		...data,
	};
};

const DELAY = 100;

const QUEUE_CONFIG = {
	endpointUrl: 'http://ac-server',
};

describe('Client', () => {
	let client;
	let messageQueue;

	afterEach(() => {
		fetchMock.restore();

		jest.restoreAllMocks();
	});

	beforeEach(() => {
		client = new Client({
			delay: DELAY,
		});

		messageQueue = new MessageQueue(STORAGE_KEY_MESSAGES);
	});

	it('flush queue items', async () => {
		let fetchCalled = 0;
		fetchMock.mock(/ac-server/i, () => {
			fetchCalled += 1;

			return Promise.resolve(200);
		});

		client.addQueue(messageQueue, QUEUE_CONFIG);

		const item = getMockMessageItem('test-1');

		await messageQueue.addItem(item);

		await wait(DELAY);

		expect(fetchCalled).toBe(1);
	});

	it('flush queue items ordered by queue priority', async () => {
		const sentEvents = [];
		const identityQueue = new MessageQueue('identity');
		const priorityItem = getMockMessageItem('priority');

		client.dispose();
		fetchMock.mock(/ac-server/i, (url, {body}) => {
			sentEvents.push(JSON.parse(body));

			return Promise.resolve(200);
		});

		client.addQueue(messageQueue, QUEUE_CONFIG);
		client.addQueue(identityQueue, {
			...QUEUE_CONFIG,
			priority: 10,
		});

		messageQueue.addItem(getMockMessageItem('test-1'));
		identityQueue.addItem(priorityItem);

		client.flush();
		await wait(DELAY);

		expect(sentEvents[0]).toEqual(priorityItem);
	});

	xit('add increase attemptNumber after fail', async () => {
		fetchMock.restore();
		fetchMock.mock(/ac-server/i, () => Promise.reject());

		client.addQueue(messageQueue, QUEUE_CONFIG);

		const item = getMockMessageItem('test-1');

		await messageQueue.addItem(item);

		await wait(DELAY);

		expect(client.attemptNumber).toBe(2);
	});
});
