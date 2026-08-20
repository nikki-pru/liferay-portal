/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {Cluster, Row, TriageRun} from '~/types';
import {VERDICT_ORDER} from '~/util/verdict';
import {Verdict} from './Cells';

type Props = {
	activeVerdict: string;
	clusters: Cluster[];
	/** Case results that ran on BOTH builds — the size of the diff's join. */
	compared?: number;
	onPickVerdict: (verdict: string) => void;
	rows: Row[];
	run?: TriageRun;
};

/**
 * Below this share of the target build, the comparison covers so little that
 * its verdicts describe a different test suite than the one that ran.
 */
const LOW_COVERAGE = 0.5;

const int = (value?: number | string): number | undefined => {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	const n = Number(value);

	return Number.isNaN(n) ? undefined : n;
};

/**
 * Headline counts, led by CLUSTERS with case rows as fan-out.
 *
 * The pipeline has already clustered, so the case count is the wrong headline
 * unit: "6 possible bugs" was three defects each counted twice, and "153 need
 * review" was 100 clusters, one of which held 23 cases. Leading with rows makes
 * a tractable morning read like a crisis. Clusters are the unit a human works
 * through; the fan-out says how much of the suite each one covers.
 */
const Totals: React.FC<Props> = ({
	activeVerdict,
	clusters,
	compared,
	onPickVerdict,
	rows,
	run,
}) => {
	const rowCounts = new Map<string, number>();

	for (const row of rows) {
		if (row.displayVerdict) {
			rowCounts.set(
				row.displayVerdict,
				(rowCounts.get(row.displayVerdict) ?? 0) + 1
			);
		}
	}

	// A cluster's verdict is its worst member's — the same rollup the cluster
	// header shows, so the pill and the table cannot disagree.
	const clusterCounts = new Map<string, number>();

	for (const cluster of clusters) {
		if (cluster.worstVerdict) {
			clusterCounts.set(
				cluster.worstVerdict,
				(clusterCounts.get(cluster.worstVerdict) ?? 0) + 1
			);
		}
	}

	const triaged = int(run?.totalFailures);
	const targetRows = int(run?.targetRows);
	const written = rows.length;

	// The writer skips high-confidence FALSE_POSITIVE and pre-classified rows,
	// so the table holds fewer rows than the run triaged. Showing 183 with no
	// denominator reads as "this build had 183 failures", which is wrong by a
	// factor of three. Say both numbers.
	const excluded =
		triaged !== undefined && triaged > written ? triaged - written : 0;

	return (
		<div className="totals">
			{VERDICT_ORDER.filter(
				(verdict) => rowCounts.has(verdict) || clusterCounts.has(verdict)
			).map((verdict) => {
				const nClusters = clusterCounts.get(verdict) ?? 0;
				const nRows = rowCounts.get(verdict) ?? 0;

				return (
					<a
						className={`pill${activeVerdict === verdict ? ' on' : ''}`}
						href="#"
						key={verdict}
						onClick={(event) => {
							event.preventDefault();
							onPickVerdict(
								activeVerdict === verdict ? '' : verdict
							);
						}}
						title={`${nClusters} cluster(s), ${nRows} case row(s) — click to filter`}
					>
						<Verdict verdict={verdict} />

						<span className="n">{nClusters || nRows}</span>

						{/* Only when it differs — "3 (3 tests)" is noise,
						    "3 (6 tests)" is the point. */}
						{nRows && nRows !== nClusters ? (
							<span className="fanout">{nRows} tests</span>
						) : null}
					</a>
				);
			})}

			<span
				className="pill"
				title="Rows stored in Testray for this run — what this table shows."
			>
				<strong>Shown:</strong> <span className="n">{written}</span>
			</span>

			{triaged !== undefined && (
				<span
					className="pill"
					title="New, changed and blocked failures the run triaged. Not the number of tests run."
				>
					<strong>Failures triaged:</strong>{' '}
					<span className="n">{triaged.toLocaleString()}</span>
				</span>
			)}

			{excluded > 0 && (
				<span
					className="pill warn"
					title="Triaged but not written: high-confidence FALSE_POSITIVE and pre-classified rows are excluded by the write policy, so they are counted above but absent from the table."
				>
					<strong>Not written:</strong>{' '}
					<span className="n">{excluded.toLocaleString()}</span>
				</span>
			)}

			{targetRows !== undefined && (
				<span className="pill" title="Case results in the target build.">
					<strong>Tests in build:</strong>{' '}
					<span className="n">{targetRows.toLocaleString()}</span>
				</span>
			)}

			{/* How much of the build the comparison could see. The diff is an
			    inner join on case id, so a pair whose suites were re-selected
			    between them shares almost nothing — and "Tests in build:
			    3,579" beside a 54-row matrix reads as a full comparison. */}
			{compared !== undefined && compared > 0 && (
				<span
					className={`pill${
						targetRows !== undefined &&
						compared < targetRows * LOW_COVERAGE
							? ' warn'
							: ''
					}`}
					title="Case results that ran on BOTH builds. The diff is an inner join on case id, so anything outside this is invisible to it."
				>
					<strong>Compared:</strong>{' '}
					<span className="n">{compared.toLocaleString()}</span>

					{targetRows ? (
						<span className="fanout">
							{`(${
								(100 * compared) / targetRows < 10
									? ((100 * compared) / targetRows).toFixed(1)
									: Math.round(
											(100 * compared) / targetRows
										)
							}%)`}
						</span>
					) : null}
				</span>
			)}

			<span
				className="pill"
				title="Distinct clusterKey values among the rows shown — one cluster per normalized error signature (ARCHITECTURE §7)."
			>
				<strong>Root-cause clusters:</strong>{' '}
				<span className="n">{clusters.length}</span>
				{int(run?.totalClusters) !== undefined &&
				int(run?.totalClusters) !== clusters.length ? (
					<span className="fanout">
						of {int(run?.totalClusters)!.toLocaleString()} triaged
					</span>
				) : null}
			</span>
		</div>
	);
};

export default Totals;
