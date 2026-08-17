/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import useSWR from 'swr';

import type {
	Cluster,
	Page,
	TriageResult,
	TriageRoutineSetting,
	TriageRun,
} from '~/types';
import {verdictRank} from '~/util/verdict';
import {fetcher, fkEquals, fkIn} from './fetcher';

const PAGE_SIZE = 200;

const q = (path: string, filter?: string, pageSize = PAGE_SIZE) =>
	`${path}?pageSize=${pageSize}` +
	(filter ? `&filter=${encodeURIComponent(filter)}` : '');

/**
 * Triage runs for a set of builds — the build-index column's single query.
 *
 * One request for the whole page rather than one per row: there is no nested
 * `/o/c/builds/{id}/triageRuns` endpoint (404), so per-row fetching is not
 * available even as a fallback.
 */
export function useTriageRunsForBuilds(buildIds: number[]) {
	const key = buildIds.length
		? q(
				'/o/c/triageruns',
				fkIn('r_buildToTriageRuns_c_buildId', buildIds),
				Math.max(buildIds.length, 20)
			)
		: null;

	const {data, error, isLoading} = useSWR<Page<TriageRun>>(key, fetcher);

	const byBuildId = new Map<number, TriageRun>();

	// Newest run wins when a build has been triaged more than once.
	for (const run of data?.items ?? []) {
		const buildId = run.r_buildToTriageRuns_c_buildId;

		if (!buildId) {
			continue;
		}

		const current = byBuildId.get(buildId);

		if (!current || (run.startedAt ?? '') > (current.startedAt ?? '')) {
			byBuildId.set(buildId, run);
		}
	}

	return {byBuildId, error, isLoading};
}

export function useTriageRun(buildId?: number) {
	const key = buildId
		? q('/o/c/triageruns', fkEquals('r_buildToTriageRuns_c_buildId', buildId), 1)
		: null;

	const {data, error, isLoading} = useSWR<Page<TriageRun>>(key, fetcher);

	return {error, isLoading, run: data?.items?.[0]};
}

/**
 * A build's triage results.
 *
 * Reached by ERC prefix rather than a relationship: the writer's idempotency
 * key is `<buildB>_<caseId>_<classifier>` (open-Q #1), so the build id is
 * already the leading segment. That is why `TriageRun` needs no
 * `TriageRun`→`TriageResult` relationship — one less field, and no risk of a
 * late-added relationship landing in the `_x` table.
 */
export function useTriageResults(buildId?: number) {
	const key = buildId
		? q(
				'/o/c/triageresults',
				`startswith(externalReferenceCode,'${buildId}_')`
			)
		: null;

	const {data, error, isLoading} = useSWR<Page<TriageResult>>(key, fetcher);

	return {error, isLoading, results: data?.items ?? []};
}

export function useRoutineSetting(routineId?: number) {
	const key = routineId
		? q(
				'/o/c/triageroutinesettings',
				fkEquals('r_routineToTriageRoutineSettings_c_routineId', routineId),
				1
			)
		: null;

	const {data, error, isLoading, mutate} = useSWR<Page<TriageRoutineSetting>>(
		key,
		fetcher
	);

	// An absent row means defaults (autoTriage off) — see ARCHITECTURE §9. The
	// caller must not treat "no row" as an error or backfill one on read.
	return {error, isLoading, mutate, setting: data?.items?.[0]};
}

/**
 * Group results by clusterKey, worst verdict first and biggest within that.
 *
 * Severity outranks size deliberately: a 30-member NEEDSREVIEW cluster still
 * sorts below a single BUG, because the BUG is the thing to act on. Mirrors
 * `report.py::_clusters` so the CLI preview and this view agree.
 */
export function toClusters(results: TriageResult[]): Cluster[] {
	const buckets = new Map<string, TriageResult[]>();

	for (const result of results) {
		const key = result.clusterKey || `unclustered:${result.id}`;
		const bucket = buckets.get(key);

		if (bucket) {
			bucket.push(result);
		}
		else {
			buckets.set(key, [result]);
		}
	}

	const clusters: Cluster[] = [...buckets].map(([clusterKey, members]) => {
		const sorted = [...members].sort(
			(a, b) =>
				verdictRank(a.classification?.key) -
				verdictRank(b.classification?.key)
		);

		return {
			clusterKey,
			culpritFile: sorted.find((m) => m.culpritFile)?.culpritFile,
			members: sorted,
			worstVerdict: sorted[0]?.classification?.key,
		};
	});

	return clusters.sort(
		(a, b) =>
			verdictRank(a.worstVerdict) - verdictRank(b.worstVerdict) ||
			b.members.length - a.members.length
	);
}
