/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayEmptyState from '@clayui/empty-state';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {useMemo, useState} from 'react';
import useSWR from 'swr';

import Controls, {
	EMPTY_FILTERS,
	type Filters,
	applyFilters,
} from '~/components/Controls';
import HomeLink from '~/components/HomeLink';
import StatusMatrix from '~/components/StatusMatrix';
import NotAnalysed from '~/components/NotAnalysed';
import VerdictMatrix from '~/components/VerdictMatrix';
import Totals from '~/components/Totals';
import TriageTable, {type SortKey} from '~/components/TriageTable';
import {
	parseBlob,
	useBuildNames,
	useReport,
	useTriageRun,
} from '~/services/triage';
import type {GroupMode} from '~/types';
import type {ReportMeta} from '~/util/jira';
import {toClusters, toGroups} from '~/util/rows';
import {testrayURL} from '~/util/testray';

type Props = {
	buildId: number;
};

/**
 * The clustered triage view — the in-app replacement for `report.html`.
 *
 * Renders from the TriageResult rows already in Testray rather than from a
 * generated artifact, so there is nothing to host and no second copy of data we
 * already store. `report.py` stays as the local dev preview for inspecting a
 * run without DXP, and the two are deliberately kept diffable: same column
 * order, same verdict vocabulary, same cluster-led totals.
 */
const TriageReport: React.FC<Props> = ({buildId}) => {
	const {isLoading: runLoading, run} = useTriageRun(buildId);
	const {error, isLoading: rowsLoading, rows} = useReport(buildId);

	const [mode, setMode] = useState<GroupMode>('cluster');
	const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
	const [sort, setSort] = useState<{ascending: boolean; key: SortKey}>({
		ascending: true,
		key: '',
	});

	// Collapsed by default (view contract rule 4): the cluster list IS the
	// overview, and unfolding every member on load buries it under hundreds of
	// rows. Keyed by group label rather than index so the set survives a
	// regroup or a sort.
	const [expanded, setExpanded] = useState<Set<string>>(new Set());

	const routineId = run?.r_routineToTriageRuns_c_routineId;
	const baselineId = run?.r_baselineBuildToTriageRuns_c_buildId;

	const buildNames = useBuildNames([buildId, baselineId]);

	// Falls back to the id so the title is never blank while the names load or
	// if a build has since been removed. An id is a worse label than a name but
	// it still identifies the run.
	const targetLabel = buildNames.get(buildId) || String(buildId);
	const baselineLabel = baselineId
		? buildNames.get(baselineId) || String(baselineId)
		: '';

	// The case deep-link needs a project id, which TriageRun does not store —
	// the routine is the only place to get it. A half-built link would read as
	// a Testray bug rather than a missing field here, so `caseURL` returns ''
	// until this resolves. The routine's name comes along for the back link.
	const {data: routine} = useSWR<{
		name?: string;
		r_routineToProjects_c_projectId?: number;
	}>(routineId ? `/o/c/routines/${routineId}` : null);

	const projectId = routine?.r_routineToProjects_c_projectId;

	// Rows this tool deliberately does not store: tests that never ran, and
	// shard failures with nothing written down. Counted straight off Testray's
	// case results rather than persisted as TriageResult rows — those rows
	// would be verdicts no classifier ever made, and ~199 of them per Stable
	// build buried the one real failure when they were written.
	const countURL = (filter: string) =>
		`/o/c/caseresults?pageSize=1&filter=${encodeURIComponent(filter)}`;

	const {data: neverRan} = useSWR<{totalCount?: number}>(
		buildId
			? countURL(
					`r_buildToCaseResult_c_buildId eq '${buildId}' and dueStatus eq 'UNTESTED'`
				)
			: null
	);

	// The batch/shard component id differs per instance, so it is resolved by
	// name rather than hardcoded — a wrong id silently counts zero.
	//
	// Scoped to the PROJECT, which is not optional: every project has its own
	// component called "Batch" (four of them on this instance), so an unscoped
	// lookup returns whichever sorts first and the count is always 0 — a pill
	// that never appears rather than an error anyone would notice.
	const {data: batchComponent} = useSWR<{items?: Array<{id: number}>}>(
		projectId
			? `/o/c/components?pageSize=1&filter=${encodeURIComponent(
					`name eq 'Batch' and r_projectToComponents_c_projectId eq '${projectId}'`
				)}`
			: null
	);

	const batchComponentId = batchComponent?.items?.[0]?.id;

	const {data: shardFailures} = useSWR<{totalCount?: number}>(
		buildId && batchComponentId
			? countURL(
					`r_buildToCaseResult_c_buildId eq '${buildId}' and dueStatus eq 'FAILED' ` +
						`and r_componentToCaseResult_c_componentId eq '${batchComponentId}'`
				)
			: null
	);

	const routineURL =
		projectId && routineId
			? testrayURL(`/project/${projectId}/routines/${routineId}`)
			: '';

	const visible = useMemo(() => applyFilters(rows, filters), [rows, filters]);

	const clusters = useMemo(() => toClusters(visible), [visible]);

	const clustersByKey = useMemo(
		() => new Map(clusters.map((cluster) => [cluster.clusterKey, cluster])),
		[clusters]
	);

	const groups = useMemo(() => toGroups(visible, mode), [visible, mode]);

	const filtering = useMemo(
		() => Object.values(filters).some(Boolean),
		[filters]
	);

	const buildURL = (id?: number) =>
		routineURL && id ? `${routineURL}/build/${id}` : '';

	const meta: ReportMeta = useMemo(() => {
		return {
			buildId,
			buildName: buildNames.get(buildId),
			caseURL: (caseResultId?: number) =>
				routineURL && caseResultId
					? `${routineURL}/build/${buildId}/case-result/${caseResultId}`
					: '',
			classifier: run?.classifier,
			runId: run?.externalReferenceCode,
		};
	}, [buildId, buildNames, routineURL, run]);

	const matrix = useMemo(
		() =>
			parseBlob<Record<string, Record<string, number>>>(
				run?.statusMatrix,
				{}
			),
		[run]
	);

	// The matrix IS the join, so summing it gives what was compared — no extra
	// field and nothing for the writer to keep in step.
	const compared = useMemo(
		() =>
			Object.values(matrix).reduce(
				(total, row) =>
					total +
					Object.values(row).reduce((sum, n) => sum + Number(n || 0), 0),
				0
			),
		[matrix]
	);

	if (runLoading || rowsLoading) {
		return <ClayLoadingIndicator displayType="secondary" size="md" />;
	}

	if (error) {
		return (
			<ClayEmptyState
				description={`Could not load the triage results for build ${buildId}. ${
					(error as Error).message ?? ''
				}`}
				title="Failed to load"
			/>
		);
	}

	// No run and no results is the ordinary case for most builds, not an error:
	// triage is opt-in per routine (autoTriage) and manual otherwise.
	if (!run && !rows.length) {
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
			{/* The view is its own portal page, outside Testray's router, so
			    it inherits none of Testray's navigation — no sidebar and no
			    breadcrumb of its own. A trail rather than a single back link
			    because there are two ways in: the Triage index, and the
			    diamond in a routine's build list. One "back" cannot serve
			    both, and guessing from a `from=` param breaks on a shared or
			    bookmarked URL. */}
			<nav className="crumbs">
				<HomeLink />

				<span className="sep">/</span>

				<a href="?">Triage</a>

				{routineURL ? (
					<>
						<span className="sep">/</span>

						<a href={routineURL}>
							{routine?.name || 'Routine'}
						</a>
					</>
				) : null}

				<span className="sep">/</span>

				<span className="here">{targetLabel}</span>
			</nav>

			{/* Build names, not ids: "270748 vs 270750" tells a reader nothing,
			    and the version pair is the whole subject of the report. The
			    baseline half is muted because the two names are often wildly
			    asymmetric in length — one routine's builds are named
			    "2026.q1.12-lts", another's carry the routine, sequence and a
			    timestamp — and letting the longer one set the type size makes
			    the target hard to find. */}
			<h1>
				Analysis for:{' '}
				{buildURL(buildId) ? (
					<a className="build-link" href={buildURL(buildId)}>
						{targetLabel}
					</a>
				) : (
					targetLabel
				)}

				{baselineLabel ? (
					<span className="subtitle" title={baselineLabel}>
						{' '}
						vs baseline{' '}
						{buildURL(baselineId) ? (
							<a
								className="build-link"
								href={buildURL(baselineId)}
							>
								{baselineLabel}
							</a>
						) : (
							baselineLabel
						)}
					</span>
				) : null}
			</h1>

			{failed && (
				<div className="triage-error">
					<strong>This run failed.</strong>

					<div>{run?.errorMessage ?? 'No error detail recorded.'}</div>
				</div>
			)}

			<div className="headline">
				<div className="controls">
					<Totals
						activeVerdict={filters.verdict}
						clusters={clusters}
						compared={compared}
						onPickVerdict={(verdict) =>
							setFilters({...filters, verdict})
						}
						rows={visible}
						run={run}
					/>

					<Controls
						filters={filters}
						mode={mode}
						onExpandAll={(expand) =>
							setExpanded(
								expand
									? new Set(
											groups.map((group) => group.label)
										)
									: new Set()
							)
						}
						onFilters={setFilters}
						onMode={setMode}
						rows={rows}
					/>
				</div>

				<div className="side">
					<StatusMatrix matrix={matrix} />
				</div>
			</div>

			{visible.length ? (
				<TriageTable
					clustersByKey={clustersByKey}
					expanded={expanded}
					filtering={filtering}
					groups={groups}
					meta={meta}
					mode={mode}
					onSort={(key) =>
						setSort((current) =>
							current.key === key
								? {ascending: !current.ascending, key}
								: {ascending: true, key}
						)
					}
					onToggleGroup={(label) =>
						setExpanded((current) => {
							const next = new Set(current);

							if (!next.delete(label)) {
								next.add(label);
							}

							return next;
						})
					}
					sort={sort}
				/>
			) : (
				<ClayEmptyState
					description="No rows match the current filters."
					title="Nothing to show"
				/>
			)}

			<NotAnalysed
				batchComponentId={batchComponentId}
				buildId={buildId}
				neverRanCount={neverRan?.totalCount}
				projectId={projectId}
				routineId={routineId}
				shardFailureCount={shardFailures?.totalCount}
			/>

			<VerdictMatrix />
		</div>
	);
};

export default TriageReport;
