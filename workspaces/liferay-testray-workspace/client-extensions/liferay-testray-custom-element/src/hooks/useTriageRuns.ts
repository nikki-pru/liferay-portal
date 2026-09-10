/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import useSWR from 'swr';

import {Liferay} from '~/services/liferay';

/**
 * Triage state for a routine's builds — the only Testray-side dependency on the
 * analytics client extension.
 *
 * This hook and the two call sites that use it (the build-index column and the
 * Triage sidebar item) are deliberately the ENTIRE Testray-side footprint of
 * the triage feature. They contain no triage logic: they read one Object and
 * link out. Everything that renders lives in
 * liferay-testray-analytics-custom-element.
 *
 * When that CX is not deployed, `/o/c/triageruns` does not exist, the request
 * 404s, `data` stays undefined and every consumer renders nothing. So this is
 * inert on a stock Testray rather than broken — which is what lets the column
 * ship to instances that never triage. Never throw from here.
 */

export type TriageRunStatus =
	| 'QUEUED'
	| 'RUNNING'
	| 'DONE'
	| 'FAILED'
	| 'ABORTED';

type TriageRun = {
	externalReferenceCode: string;
	id: number;
	r_buildToTriageRuns_c_buildId?: number;
	startedAt?: string;
	triageRunStatus?: {key: TriageRunStatus; name: string};
};

// One request per routine, not per page of builds: the routine FK means
// pagination does not change the query, so paging the build list costs nothing
// extra. Bounded because a long-lived routine accumulates runs — the newest
// win, and only the newest per build is ever displayed.
const PAGE_SIZE = 500;

/**
 * The SWR key for a routine's triage runs.
 *
 * Exported because Testray persists its whole SWR cache to storage on
 * `beforeunload` and restores it on boot (`SWRCacheProvider`). A write that
 * does not invalidate this key is therefore invisible not just until the next
 * revalidation but *across reloads* — the restored cache serves the pre-write
 * answer. Anything that creates or changes a TriageRun must `mutate` this.
 */
export const triageRunsKey = (routineId?: string | number) =>
	routineId
		? `/triageruns?pageSize=${PAGE_SIZE}&sort=startedAt:desc&filter=${encodeURIComponent(
				// Relationship FKs compare as strings even though the column is
				// a bigint; unquoted yields 400 "Incompatible types".
				`r_routineToTriageRuns_c_routineId eq '${routineId}'`
			)}`
		: null;

export default function useTriageRuns(routineId?: string) {
	const key = triageRunsKey(routineId);

	const {data} = useSWR<{items: TriageRun[]}>(key, {
		// A stock Testray has no such Object. That is an expected state, not a
		// failure, so do not retry and do not surface an error.
		shouldRetryOnError: false,
	});

	const byBuildId = new Map<number, TriageRun>();

	for (const run of data?.items ?? []) {
		// Normalised, because the lookup side uses Number(): a Map keyed by a
		// string would miss every build and render the column empty with no
		// error — the hardest failure to notice. Object REST returns this as a
		// number today, on prod ids too; this costs nothing and removes the
		// class of bug.
		const buildId = Number(run.r_buildToTriageRuns_c_buildId);

		// sort=startedAt:desc means the first run seen for a build is newest.
		if (buildId && !byBuildId.has(buildId)) {
			byBuildId.set(buildId, run);
		}
	}

	return byBuildId;
}

/**
 * Presentation for the build-index diamond.
 *
 * A diamond, not a circle: the neighbouring Build Status column already uses a
 * circle for task/testflow state, and repeating the shape would read as the
 * same vocabulary. Colours are Testray's own status tokens.
 */
export const TRIAGE_RUN_DISPLAY: Record<
	TriageRunStatus,
	{clickable: boolean; color: string; label: string}
> = {
	// Grey, outside the traffic-light set: a withdrawn request is not a failure.
	ABORTED: {clickable: false, color: '#a7a9bc', label: 'Triage aborted'},
	DONE: {clickable: true, color: '#37d27e', label: 'Triage ready'},
	FAILED: {clickable: true, color: '#fe5160', label: 'Triage failed'},
	QUEUED: {clickable: false, color: '#ffd764', label: 'Triage queued'},
	RUNNING: {clickable: false, color: '#ffd764', label: 'Triage in progress'},
};

/**
 * Queue a triage run for a baseline/target pair.
 *
 * The ONE write this side performs, and it writes nothing triage-specific
 * beyond identity: a status and three foreign keys. Everything else on the row
 * — counts, clusters, the status matrix — is filled in by the pipeline when it
 * runs. So this stays a request, not a result.
 *
 * The ERC is derived from the pair rather than random, so double-clicking the
 * button upserts the same row instead of queueing the work twice.
 *
 * Returns the created/updated run, or throws. Callers surface failure via a
 * toast: a queue write that silently fails would leave the user believing a run
 * was requested.
 */
export async function queueTriageRun({
	baselineBuildId,
	routineId,
	targetBuildId,
}: {
	baselineBuildId: number;
	routineId: number;
	targetBuildId: number;
}) {
	const erc = `queued-${baselineBuildId}-${targetBuildId}`;

	const response = await fetch(
		`/o/c/triageruns/by-external-reference-code/${encodeURIComponent(erc)}`,
		{
			body: JSON.stringify({
				analysisMode: 'build-vs-build',
				r_baselineBuildToTriageRuns_c_buildId: baselineBuildId,
				r_buildToTriageRuns_c_buildId: targetBuildId,
				r_routineToTriageRuns_c_routineId: routineId,
				triageRunStatus: {key: 'QUEUED'},
			}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'x-csrf-token': Liferay.authToken,
			},
			method: 'PUT',
		}
	);

	if (!response.ok) {
		throw new Error(`Could not queue the run (HTTP ${response.status})`);
	}

	return response.json();
}

/**
 * The Liferay site this page is served from, e.g. `/web/testray`.
 *
 * Derived rather than hardcoded: the friendly URL differs per environment —
 * `/web/testray` on dev and prod, `/web/liferay-testray` on local docker — so
 * a literal 404s in at least one of them. Testray renders inside the site, so
 * the first two path segments ARE the site, whatever route follows.
 */
const sitePath = (): string => {
	const [, prefix, site] = window.location.pathname.split('/');

	return prefix && site ? `/${prefix}/${site}` : '/web/testray';
};

/** Where the analytics CX renders. Kept here so both call sites agree. */
/** Where the analytics CX renders. Kept here so both call sites agree. */
export const TRIAGE_PATH = `${sitePath()}/triage`;

export const triageURL = (buildId: number | string) =>
	`${TRIAGE_PATH}?buildId=${buildId}`;
