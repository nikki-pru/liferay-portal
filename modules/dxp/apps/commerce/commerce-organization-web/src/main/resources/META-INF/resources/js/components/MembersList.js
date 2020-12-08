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

import Member from './Member';
import NoMembers from './NoMembers';

class MembersList extends Component {
	render() {
		const {imagesPath, isLoading, members, spritemap} = this.props;

		return (
			<div className="pane-members-list">
				{
					<ul>
						{!isLoading &&
							!!members.length &&
							members.map((member, index) => {
								return (
									<Member
										imagesPath={imagesPath}
										key={index}
										member={member}
									/>
								);
							})}
					</ul>
				}

				{!isLoading && !members.length && (
					<NoMembers spritemap={spritemap} />
				)}
			</div>
		);
	}
}

export default MembersList;
