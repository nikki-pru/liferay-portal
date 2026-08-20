/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import TriageIndex from '~/pages/TriageIndex';
import TriageReport from '~/pages/TriageReport';

/**
 * Entry point.
 *
 * The widget is addressed by query string rather than a client-side router: it
 * is mounted on a portal page, so the portal already owns the URL, and a second
 * history-manipulating router fighting Testray's hash router is a known source
 * of breakage.
 *
 *   (no params)        the index — which builds have been triaged
 *   ?buildId=<id>      that build's report
 *
 * No params used to render "No build selected", which was a dead end: the
 * Triage sidebar item links here without ids, so the only way to reach a report
 * was to already know a build id. The index is what that link is for.
 *
 * Next slice: `?baseline=&target=` for manual selection, mirroring
 * compare-runs, and `?routineId=` for the autoTriage settings screen.
 */
const App: React.FC = () => {
	const params = new URLSearchParams(window.location.search);
	const buildId = Number(params.get('buildId'));

	return buildId ? <TriageReport buildId={buildId} /> : <TriageIndex />;
};

export default App;
