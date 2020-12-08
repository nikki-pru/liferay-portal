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

import MessageQueue from '../src/messageQueue';
import {STORAGE_KEY_MESSAGES} from '../src/utils/constants';
import {setItem} from '../src/utils/storage';
import {getDummyEvent} from './helpers';

const getMockMessageItem = (id = 0, data = {}) => {
	return {
		dataSourceId: 'foo-datasource',
		events: [getDummyEvent()],
		id: `${id}`,
		...data,
	};
};

describe('MessageQueue', () => {
	let messageQueue;

	afterEach(() => {
		messageQueue.reset();
	});

	beforeEach(() => {
		messageQueue = new MessageQueue(STORAGE_KEY_MESSAGES);
	});

	it('adds an item to its queue', async () => {
		expect(messageQueue.getMessages().length).toEqual(0);

		await messageQueue.addItem(getMockMessageItem('test-1'));

		expect(messageQueue.getMessages().length).toEqual(1);
	});

	it('dequeues an item after add', async () => {
		await messageQueue.addItem(getMockMessageItem('test-3'));

		expect(messageQueue.getMessages().length).toEqual(1);

		messageQueue._dequeue('test-3');

		expect(messageQueue.getMessages().length).toEqual(0);
	});

	it('dequeues first entry when the storage limit is reached', async () => {
		const mockItems = [1, 2, 3, 4, 5].map(getMockMessageItem);

		setItem(STORAGE_KEY_MESSAGES, mockItems); // slightly larger than .5kb

		messageQueue.maxSize = 0.5;

		const newMessage = getMockMessageItem('6');

		await messageQueue.addItem(newMessage);
		const messageArray = messageQueue.getMessages();

		expect(messageArray).toEqual(
			expect.not.arrayContaining([mockItems[0]])
		);

		expect(messageArray[messageArray.length - 1].id).toEqual(newMessage.id);
	});
});
