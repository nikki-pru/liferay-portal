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

import React from 'react';

import BasicInfoPanel from './BasicInfoPanel.es';
<<<<<<< HEAD
=======
import {Component} from './PluginContext.es';
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

/**
 * Entry-point for "Properties" (sidebar pane) functionality.
 */
export default class {
<<<<<<< HEAD
	constructor({panel}) {
=======
	constructor({app, panel}) {
		this.Component = Component(app);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		this.title = panel.label;
		this.url = panel.url;
	}

	renderSidebar() {
<<<<<<< HEAD
		return <BasicInfoPanel url={this.url} />;
=======
		const {Component} = this;

		return (
			<Component>
				<BasicInfoPanel url={this.url} />
			</Component>
		);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}
}
