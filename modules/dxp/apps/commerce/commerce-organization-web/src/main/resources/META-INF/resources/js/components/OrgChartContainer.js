/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import React, {Component} from 'react';

import {bindAll, callApi, setupDataset} from '../utils/utils';
import MembersPane from './MembersPane';
import OrgChart from './OrgChart';

class OrgChartContainer extends Component {
	constructor(props) {
		super(props);

		bindAll(this, 'handleNodeClick', 'setSelection', 'handleInitialLoad');

		const apiParameters = {
			baseURL: props.apiURL,
		};

		this.$didMount = new Promise((resolve) =>
			callApi(apiParameters).then((data) => {
				this.setState(
					() => {
						return {
							rootData: setupDataset(data),
							selectedId: 0,
						};
					},
					() => {
						resolve(true);
					}
				);
			})
		);
	}

	handleInitialLoad() {
		this.setState(() => {
			return {loading_: false};
		});
	}

	handleNodeClick(id) {
		return callApi({
			baseURL: this.props.apiURL,
			id,
		}).then(({organizations}) =>
			organizations.length ? organizations : null
		);
	}

	setSelection(id, colorIdentifier) {
		this.setState(() => {
			return {colorIdentifier, selectedId: id};
		});
	}

	render() {
		const {apiURL, imagesPath, namespace, spritemap} = this.props;

		const {colorIdentifier, rootData, selectedId} = this.state || {};

		return (
			<div className="organization-network">
				{!!rootData && (
					<OrgChart
						data={rootData}
						namespace={namespace}
						onNodeClick={this.setSelection}
						requestChildren={this.handleNodeClick}
						selectedId={selectedId}
					/>
				)}

				{!!selectedId && (
					<MembersPane
						apiURL={apiURL}
						colorIdentifier={colorIdentifier}
						id={selectedId}
						imagesPath={imagesPath}
						spritemap={spritemap}
					/>
				)}
			</div>
		);
	}
}

export default OrgChartContainer;
