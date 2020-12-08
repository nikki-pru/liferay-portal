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

import PropTypes from 'prop-types';
import React from 'react';

function Member(props) {
	const {email: role, imageUrl, name} = props.member;

	return (
		<li className="member" role="button" tabIndex="-1">
			<span
				className="member-picture"
				style={{
					background: `url(/image${imageUrl}) center no-repeat #CCC`,
				}}
			></span>
			<span className="member-data">
				<p className="member-data-name">{name}</p>
				<p>
					<span className="member-data-role">{role}</span>
				</p>
			</span>
		</li>
	);
}

Member.defaultProps = {
	name: '',
	pictureUrl: '',
	role: '',
	tabIndex: 5,
};

Member.propTypes = {
	name: PropTypes.string,
	pictureUrl: PropTypes.string,
	role: PropTypes.string,
	tabIndex: PropTypes.number,
};

export default Member;
