/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {testrayURL} from '~/util/testray';

/**
 * Back to Testray's home route.
 *
 * The triage views live on their own Liferay page, which renders none of
 * Testray's chrome — no sidebar, so none of the TESTRAY brand link, the
 * Results item or anything else that gets you out. Every route into the
 * module (the sidebar item, the build-list diamond, a shared link) therefore
 * arrived somewhere with no way back except the browser button, and a
 * bookmarked report had none at all.
 *
 * A house rather than the Testray wordmark: the wordmark is the sidebar's
 * home affordance and copying it here would imply this page has the sidebar's
 * chrome. Inline SVG for the same reason as the Actions kebab — this CX has
 * no Clay spritemap wired up.
 */
const HomeLink: React.FC = () => (
	<a
		className="home-link"
		href={testrayURL()}
		title="Back to Testray"
	>
		<svg aria-hidden="true" height="12" viewBox="0 0 16 16" width="12">
			<path d="M8 1.3 0.8 7.2c-.3.2-.3.6-.1.9.2.3.6.3.9.1L2 7.8V14c0 .4.3.7.7.7h3.1c.4 0 .7-.3.7-.7v-3.3h2.9V14c0 .4.3.7.7.7h3.1c.4 0 .7-.3.7-.7V7.8l.5.4c.3.2.7.2.9-.1.2-.3.2-.7-.1-.9L8 1.3z" />
		</svg>{' '}
		Testray
	</a>
);

export default HomeLink;
