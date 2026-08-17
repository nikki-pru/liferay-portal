/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayEmptyState from '@clayui/empty-state';

import TriageReport from '~/pages/TriageReport';

/**
 * Entry point.
 *
 * The widget is addressed by query string rather than a client-side router:
 * it is mounted on a portal page, so the portal already owns the URL, and a
 * second history-manipulating router fighting Testray's hash router is a known
 * source of breakage. `?buildId=` is the target build; the hook in Testray's
 * custom element links here with it set.
 *
 * Next slices: `?baseline=&target=` (manual selection, mirroring compare-runs)
 * and `?routineId=` (the autoTriage settings screen).
 */
const App: React.FC = () => {
	const params = new URLSearchParams(window.location.search);
	const buildId = Number(params.get('buildId'));

	if (!buildId) {
		return (
			<ClayEmptyState
				description="Open this view from a build's triage icon, or pick a baseline and target from the Triage panel."
				title="No build selected"
			/>
		);
	}

	return <TriageReport buildId={buildId} />;
};

export default App;
