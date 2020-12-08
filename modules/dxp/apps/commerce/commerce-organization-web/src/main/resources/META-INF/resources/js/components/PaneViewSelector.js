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

import {LIST_BY} from '../utils/constants';

const {ACCOUNTS, USERS} = LIST_BY;

function isSelected(listBy, callee) {
	return listBy === callee ? 'selected-pane' : '';
}

function Tab(props) {
	const {listBy, onViewSelected, totalMembers, viewName} = props;

	return (
		<span
			className={
				!totalMembers ? 'disabled' : isSelected(listBy, viewName)
			}
			onClick={!totalMembers ? null : onViewSelected.bind(this, viewName)}
			role="button"
			tabIndex="-1"
		>
			{`${viewName} (${totalMembers})`}
		</span>
	);
}

class PaneViewSelector extends Component {
	render() {
		const {listBy, onViewSelected, totalAccounts, totalUsers} = this.props;

		return (
			<div className="pane-list-selector">
				{[USERS, ACCOUNTS].map((viewName, i) => {
					const totalMembers =
						viewName === USERS ? totalUsers : totalAccounts;

					return (
						<Tab
							key={i}
							listBy={listBy}
							onViewSelected={onViewSelected}
							totalMembers={totalMembers}
							viewName={viewName}
						/>
					);
				})}
			</div>
		);
	}
}

export default PaneViewSelector;
