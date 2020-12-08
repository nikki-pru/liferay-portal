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

import ProcessLock from 'browser-tabs-lock';

import {QUEUE_STORAGE_LIMIT} from './utils/constants';
import {getRetryDelay} from './utils/delay';
import {getItem, setItem, verifyStorageLimitForKey} from './utils/storage';

/**
 * An Analytics Event.
 *
 * @typedef {Object} AnalyticsEvent
 * @property {string} applicationId - The entity type of the event, like Page.
 * @property {string} contextHash - Hash of event context.
 * @property {string} eventDate - Server time of event in ISO 8601.
 * @property {string} eventId - The actual event like pageViewed or pageLoaded.
 * @property {string} eventLocalDate - Local time of event in ISO 8601.
 * @property {Object} properties - Extra event properties.
 */

/**
 * An Analytics Message Item.
 *
 * @typedef {Object} AnalyticsMessage
 * @property {Object} context - The context for all of the events in this message.
 * @property {string} dataSourceId - The Data Source ID for all of the events in this message.
 * @property {Array.<AnalyticsEvent>} events - Analytics events.
 * @property {string} id - The unique identifier of this message.
 * @property {string} userId - The user id hash.
 */

/**
 * MessageQueue class that is designed to receive event batches from
 * Analytics. MessageQueue will serve the Client, who is responsible to
 * send the messages to the server. Its messages are persisted in localStorage.
 */

class MessageQueue {
	constructor(name, config = {}) {
		this.maxSize = config.maxSize || QUEUE_STORAGE_LIMIT;
		this.name = name;
		this.lock = new ProcessLock();

		if (!getItem(this.name)) {
			setItem(this.name, []);
		}

		this.addItem = this.addItem.bind(this);
	}

	/**
	 * Adds an item to the queue.
	 *
	 * @param {AnalyticsMessage} item
	 * @returns {Promise}
	 */
	addItem(item) {
		return verifyStorageLimitForKey(this.name, this.maxSize).then(() => {
			this._enqueue(item);
		});
	}

	/**
	 * Remove an item from the queue by id.
	 *
	 * @param {string} id - The Message ID.
	 */
	_dequeue(id) {
		const queue = this.getMessages();

		setItem(
			this.name,
			queue.filter(({id: idMessage, item}) => {
				if (item) {
					return item.id !== id;
				}

				return id !== idMessage;
			})
		);
	}

	/**
	 * Add a message to the queue and process messages.
	 *
	 * @param {Message} entry
	 * @param {boolean} - Whether _processMessages should run immediately after enqueuing message.
	 */
	_enqueue(entry) {
		const queue = this.getMessages();

		queue.push(entry);

		setItem(this.name, queue);
	}

	/**
	 * Get queued messages.
	 *
	 * @returns {Array.<AnalyticsMessage>}
	 */
	getMessages() {
		return getItem(this.name) || [];
	}

	hasMessages() {
		return !!this.getMessages(false).length;
	}

	acquireLock() {
		return this.lock.acquireLock(this.name);
	}

	releaseLock() {
		return this.lock.releaseLock(this.name);
	}

	/**
	 * Clear queue items.
	 */
	reset() {
		setItem(this.name, []);
	}
}

export {MessageQueue, getRetryDelay};
export default MessageQueue;
