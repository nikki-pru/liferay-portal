/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {swatch} from '~/util/verdict';

type Props = {
	count?: number;
	verdict?: string;
};

const VerdictPill: React.FC<Props> = ({count, verdict}) => {
	const {bg, fg, label} = swatch(verdict);

	return (
		<span className="triage-pill" style={{background: bg, color: fg}}>
			{label}

			{count === undefined ? '' : `: ${count}`}
		</span>
	);
};

export default VerdictPill;
