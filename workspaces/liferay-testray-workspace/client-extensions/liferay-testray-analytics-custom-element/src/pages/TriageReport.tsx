/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayEmptyState from '@clayui/empty-state';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {useMemo} from 'react';

import ClusterCard from '~/components/ClusterCard';
import VerdictPill from '~/components/VerdictPill';
import {toClusters, useTriageResults, useTriageRun} from '~/services/triage';
import {VERDICT_ORDER} from '~/util/verdict';

type Props = {
	buildId: number;
};

/**
 * The clustered triage view — the in-app replacement for `report.html`.
 *
 * Renders from the TriageResult rows already in Testray rather than from a
 * generated artifact, so there is nothing to host and no second copy of data
 * we already store. `report.py` stays as the local dev preview for inspecting
 * a run without DXP.
 */
const TriageReport: React.FC<Props> = ({buildId}) => {
	const {isLoading: runLoading, run} = useTriageRun(buildId);
	const {isLoading: resultsLoading, results} = useTriageResults(buildId);

	const clusters = useMemo(() => toClusters(results), [results]);

	const counts = useMemo(() => {
		const tally = new Map<string, number>();

		for (const result of results) {
			const key = result.classification?.key ?? 'UNCLASSIFIED';

			tally.set(key, (tally.get(key) ?? 0) + 1);
		}

		return [...tally].sort(
			(a, b) =>
				VERDICT_ORDER.indexOf(a[0] as never) -
				VERDICT_ORDER.indexOf(b[0] as never)
		);
	}, [results]);

	if (runLoading || resultsLoading) {
		return <ClayLoadingIndicator displayType="secondary" size="md" />;
	}

	// No run and no results is the ordinary case for most builds, not an error:
	// triage is opt-in per routine (autoTriage) and manual otherwise.
	if (!run && !results.length) {
		return (
			<ClayEmptyState
				description="This build has not been triaged. Select a baseline and target from the Triage panel to run one."
				title="No triage run"
			/>
		);
	}

	const failed = run?.triageRunStatus?.key === 'FAILED';

	return (
		<div className="triage-report">
			<h1>Triage report — build {buildId}</h1>

			<div className="triage-meta">
				{run?.r_baselineBuildToTriageRuns_c_buildId ? (
					<>baseline {run.r_baselineBuildToTriageRuns_c_buildId} &middot; </>
				) : null}

				{run?.analysisMode ?? 'build-vs-build'}

				{run?.classifier ? <> &middot; {run.classifier}</> : null}

				<> &middot; {results.length} failures</>

				<> &middot; {clusters.length} clusters</>

				<div className="triage-pills">
					{counts.map(([verdict, count]) => (
						<VerdictPill
							count={count}
							key={verdict}
							verdict={verdict}
						/>
					))}
				</div>
			</div>

			{failed && (
				<div className="triage-error">
					<strong>This run failed.</strong>

					<div>{run?.errorMessage ?? 'No error detail recorded.'}</div>
				</div>
			)}

			{clusters.map((cluster) => (
				<ClusterCard cluster={cluster} key={cluster.clusterKey} />
			))}
		</div>
	);
};

export default TriageReport;
