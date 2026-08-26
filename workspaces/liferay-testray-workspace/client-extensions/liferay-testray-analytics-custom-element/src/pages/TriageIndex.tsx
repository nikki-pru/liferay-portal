/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayEmptyState from '@clayui/empty-state';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {useMemo, useState} from 'react';

import {Verdict} from '~/components/Cells';
import TriagePicker from '~/components/TriagePicker';
import {abortTriageRun, useTriageIndex} from '~/services/triage';
import type {IndexRow} from '~/types';
import {RUN_STATUS, VERDICT_ORDER, verdictRank} from '~/util/verdict';

/**
 * Which builds have a triage analysis, and what each one found.
 *
 * This is the landing page for the Triage sidebar item, which previously linked
 * here with no build id and so rendered "No build selected" — a dead end that
 * gave no way to discover an existing run short of hand-editing the URL.
 *
 * The verdict columns mirror the build list's Passed/Failed/Blocked metrics,
 * and like the report they are CLUSTER counts, not row counts: clusters are the
 * unit a person works through, and leading with rows made a tractable morning
 * read like a crisis. Row counts ride along as fan-out where they differ.
 */
const TriageIndex: React.FC = () => {
	const {error, isLoading, mutate, rows} = useTriageIndex();

	const [project, setProject] = useState('');
	const [routine, setRoutine] = useState('');

	const projects = useMemo(
		() => [...new Set(rows.map((r) => r.projectName).filter(Boolean))].sort(),
		[rows]
	);

	// Routine options follow the chosen project, so the pair cannot be set to a
	// combination with no runs behind it.
	const routines = useMemo(
		() =>
			[
				...new Set(
					rows
						.filter((r) => !project || r.projectName === project)
						.map((r) => r.routineName)
						.filter(Boolean)
				),
			].sort(),
		[rows, project]
	);

	const visible = useMemo(
		() =>
			rows.filter(
				(r) =>
					(!project || r.projectName === project) &&
					(!routine || r.routineName === routine)
			),
		[rows, project, routine]
	);

	/**
	 * Verdict columns are derived from every run, not the filtered subset, so
	 * the table keeps the same shape while you change the filters instead of
	 * gaining and losing columns under the cursor.
	 */
	const columns = useMemo(() => {
		const seen = new Set<string>();

		for (const row of rows) {
			for (const key of Object.keys(row.clusterCounts)) {
				seen.add(key);
			}

			for (const key of Object.keys(row.rowCounts)) {
				seen.add(key);
			}
		}

		return VERDICT_ORDER.filter((verdict) => seen.has(verdict));
	}, [rows]);

	if (isLoading) {
		return <ClayLoadingIndicator displayType="secondary" size="md" />;
	}

	if (error) {
		return (
			<ClayEmptyState
				description={`Could not load triage runs. ${
					(error as Error).message ?? ''
				}`}
				title="Failed to load"
			/>
		);
	}

	if (!rows.length) {
		return (
			<div className="triage-report">
				<BackLink />

				<h1>Triage</h1>

				<TriagePicker onQueued={mutate} runs={rows} />

				<ClayEmptyState
					description="No build has been triaged yet. A run is created either by a routine with autoTriage enabled, or by picking a baseline and target above."
					title="No triage runs"
				/>
			</div>
		);
	}

	return (
		<div className="triage-report">
			<BackLink />

			<h1>Triage</h1>

			<TriagePicker onQueued={mutate} runs={rows} />

			{/* The picker above has its own Project/Routine pair, so these
			    need saying what they are for — adjacent identical labels
			    otherwise read as one control that does not work. */}
			<div className="filters">
				<div className="filters-row">
					<span className="filters-label">Filter runs</span>

					<label htmlFor="index-project">Project:</label>

					<select
						id="index-project"
						onChange={(event) => {
							setProject(event.target.value);
							// The old routine may not exist under the new
							// project, which would filter everything away and
							// look like "no runs".
							setRoutine('');
						}}
						value={project}
					>
						<option value="">All</option>

						{projects.map((name) => (
							<option key={name} value={name}>
								{name}
							</option>
						))}
					</select>

					<label htmlFor="index-routine">Routine:</label>

					<select
						id="index-routine"
						onChange={(event) => setRoutine(event.target.value)}
						value={routine}
					>
						<option value="">All</option>

						{routines.map((name) => (
							<option key={name} value={name}>
								{name}
							</option>
						))}
					</select>

					<span className="viewbar-note">
						{visible.length} run{visible.length === 1 ? '' : 's'}
						{visible.length === rows.length
							? ''
							: ` of ${rows.length}`}
					</span>
				</div>
			</div>

			<table className="per-test-table index-table">
				<thead>
					<tr>
						<th className="col-test">Build</th>

						<th className="col-team">Baseline</th>

						<th className="col-comp">Routine</th>

						<th className="col-status">Status</th>

						{columns.map((verdict) => (
							<th className="col-verdict-count" key={verdict}>
								<Verdict verdict={verdict} />
							</th>
						))}

						<th className="col-num-metric" title="Distinct clusterKey values across the whole run.">
							Clusters
						</th>

						<th
							className="col-num-metric"
							title="New, changed and blocked failures the run triaged. Not the number of tests run."
						>
							Triaged
						</th>
					</tr>
				</thead>

				<tbody>
					{visible.map((row) => (
						<IndexRowView
							columns={columns}
							key={row.id}
							onChange={mutate}
							row={row}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};

/**
 * Back to wherever the reader came from.
 *
 * The index is reached from the sidebar, which is reachable from every page in
 * Testray, so there is no single parent to point at the way the report can
 * point at its routine. History is the only thing that knows. Falls back to
 * Testray's home when there is no history — a direct link, or a fresh tab.
 */
const BackLink: React.FC = () => (
	<nav className="crumbs">
		<a
			href={`${window.location.origin}/web/liferay-testray`}
			onClick={(event) => {
				if (window.history.length > 1) {
					event.preventDefault();
					window.history.back();
				}
			}}
		>
			&larr; Back
		</a>
	</nav>
);

const IndexRowView: React.FC<{
	columns: string[];
	onChange: () => void;
	row: IndexRow;
}> = ({columns, onChange, row}) => {
	const worst = useMemo(() => {
		const present = Object.entries(row.clusterCounts)
			.filter(([, n]) => n > 0)
			.map(([verdict]) => verdict);

		return present.sort((a, b) => verdictRank(a) - verdictRank(b))[0] ?? '';
	}, [row.clusterCounts]);

	const [aborting, setAborting] = useState(false);
	const [abortError, setAbortError] = useState('');

	const status = RUN_STATUS[row.status];

	// Only a finished run has anything to show; a queued or failed one would
	// link to an empty report.
	const openable = row.status === 'DONE';

	return (
		<tr className="case-row">
			<td className="col-test">
				{openable ? (
					<a
						className="test-link"
						href={`?buildId=${row.buildId}`}
						title="Open the triage report"
					>
						{row.buildName}
					</a>
				) : (
					row.buildName
				)}
			</td>

			<td className="col-team">{row.baselineName || '—'}</td>

			<td className="col-comp">{row.routineName || '—'}</td>

			<td className="col-status">
				<span
					className="run-status"
					title={status?.title ?? row.status}
				>
					<span
						className="tr-triage-diamond"
						style={{backgroundColor: status?.color ?? '#e3e9ee'}}
					/>{' '}
					{status?.title?.replace('Triage ', '') ?? row.status}
				</span>

				{/* Only QUEUED can be withdrawn. Once the runner claims a row
				    it owns the state, so offering abort on RUNNING would
				    promise a cancellation nothing can deliver. */}
				{row.status === 'QUEUED' && (
					<button
						className="abort-run"
						disabled={aborting}
						onClick={async () => {
							setAborting(true);

							try {
								await abortTriageRun(
									row.externalReferenceCode
								);
								onChange();
							}
							catch (e) {
								// Most likely the ABORTED picklist entry is
								// missing, which fails the write outright.
								// Saying so beats a row that silently stays
								// queued.
								setAbortError(
									(e as Error).message ||
										'Could not abort the run'
								);
							}
							finally {
								setAborting(false);
							}
						}}
						type="button"
					>
						Abort
					</button>
				)}

				{abortError ? (
					<div className="abort-error" title={abortError}>
						{abortError}
					</div>
				) : null}
			</td>

			{columns.map((verdict) => {
				const clusters = row.clusterCounts[verdict] ?? 0;
				const rowCount = row.rowCounts[verdict] ?? 0;

				return (
					<td
						className={`col-verdict-count${
							clusters && verdict === worst ? ' worst' : ''
						}`}
						key={verdict}
						title={
							clusters || rowCount
								? `${clusters} cluster(s), ${rowCount} case row(s)`
								: undefined
						}
					>
						{clusters || rowCount ? (
							<>
								{clusters || rowCount}

								{rowCount && rowCount !== clusters ? (
									<span className="fanout">{rowCount}</span>
								) : null}
							</>
						) : null}
					</td>
				);
			})}

			<td className="col-num-metric">{row.totalClusters ?? '—'}</td>

			<td className="col-num-metric">
				{row.failures?.toLocaleString() ?? '—'}
			</td>
		</tr>
	);
};

export default TriageIndex;
