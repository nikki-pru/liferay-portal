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

import {bindAll} from '../utils/utils';
import PaneOrgInfo from './PaneOrgInfo';
import PaneSearchBar from './PaneSearchBar';
import PaneViewSelector from './PaneViewSelector';

class PaneHeader extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showMenu: false,
		};

		bindAll(this, 'hideMenu', 'showMenu');
	}

	hideMenu() {
		this.setState(() => ({
			showMenu: false,
		}));
	}

	showMenu() {
		this.setState((state) => ({
			showMenu: !state.showMenu,
		}));
	}

	render() {
		const {
			colorIdentifier,
			listBy,
			onLookUp,
			onViewSelected,
			orgName,
			spritemap,
			totalAccounts,
			totalSubOrg,
			totalUsers,
		} = this.props;

		return (
			<div className="pane-header">
				<PaneOrgInfo
					childrenNo={totalSubOrg}
					colorIdentifier={colorIdentifier}
					orgName={orgName}
					showMenu={this.showMenu}
				/>

				<PaneViewSelector
					listBy={listBy}
					onViewSelected={onViewSelected}
					totalAccounts={totalAccounts}
					totalUsers={totalUsers}
				/>

				<PaneSearchBar onLookUp={onLookUp} spritemap={spritemap} />
			</div>
		);
	}
}

export default PaneHeader;
