/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import useSWR from 'swr';

import type {
	CaseResult,
	Page,
	Row,
	TriageResult,
	TriageRoutineSetting,
	TriageRun,
} from '~/types';
import {displayVerdict} from '~/util/verdict';
import {
	chunk,
	fetcher,
	fkEquals,
	fkIn,
	idIn,
	paginate,
	request,
} from './fetcher';

const PAGE_SIZE = 200;

const q = (path: string, filter?: string, pageSize = PAGE_SIZE) =>
	`${path}?pageSize=${pageSize}` +
	(filter ? `&filter=${encodeURIComponent(filter)}` : '');

/**
 * The columns the table and detail panel actually read.
 *
 * A `fields=` projection is not premature tuning here: the unprojected row
 * carries the full build log twice over, and on a real run it was the
 * difference between 402 KiB and 135 KiB. The nested CaseResult is NOT
 * projected — `fields` does not reach into an expansion — so the expansion is
 * what the payload costs, and it is why only one relationship is expanded.
 */
const RESULT_FIELDS = [
	'id',
	'externalReferenceCode',
	'clusterKey',
	'classification',
	'confidence',
	'culpritFile',
	'reason',
	'specificChange',
	'transition',
	'statusA',
	'baselineSignatureCount',
	'suspiciousCommits',
	'caseResultToTriageResults',
].join(',');

/**
 * Every TriageResult for a build, with its CaseResult and Case expanded.
 *
 * `nestedFieldsDepth=2` is what makes this one request instead of three: depth
 * 1 expands the CaseResult (status, error text, component and team ids) and
 * depth 2 reaches the Case, which is the only place the test NAME lives. Only
 * `case` and `creator` expand at depth 2 — component and team do not — so
 * those two still need resolving by id, which `useReport` does below.
 */
const resultsURL = (buildId: number) => (page: number) =>
	`/o/c/triageresults?page=${page}&pageSize=${PAGE_SIZE}` +
	`&filter=${encodeURIComponent(`startswith(externalReferenceCode,'${buildId}_')`)}` +
	`&fields=${encodeURIComponent(RESULT_FIELDS)}` +
	`&nestedFields=caseResultToTriageResults&nestedFieldsDepth=2`;

/** Object REST serialises bigint columns as strings; '' and null both mean absent. */
const num = (value: unknown): number | undefined => {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	const n = Number(value);

	return Number.isNaN(n) ? undefined : n;
};

const str = (value: unknown): string =>
	value === undefined || value === null ? '' : String(value);

/**
 * The expansion lands under a different key depending on the query: with a
 * `fields=` projection it is `caseResultToTriageResults`, without one it is
 * `r_caseResultToTriageResults_c_caseResult`. Read whichever is present rather
 * than coupling this to the projection above.
 */
const caseResultOf = (result: TriageResult): CaseResult =>
	result.caseResultToTriageResults ??
	result.r_caseResultToTriageResults_c_caseResult ??
	{};

/** Resolve `{id: name}` for a set of ids, batched to stay inside the URL limit. */
async function namesById(
	path: string,
	ids: number[]
): Promise<Map<number, string>> {
	const out = new Map<number, string>();

	if (!ids.length) {
		return out;
	}

	const pages = await Promise.all(
		chunk(ids).map((batch) =>
			request<Page<{id: number | string; name?: string}>>(
				`${path}?pageSize=${batch.length}` +
					`&fields=${encodeURIComponent('id,name')}` +
					`&filter=${encodeURIComponent(idIn(batch))}`
			)
		)
	);

	for (const page of pages) {
		for (const item of page.items ?? []) {
			const id = num(item.id);

			if (id !== undefined) {
				out.set(id, str(item.name));
			}
		}
	}

	return out;
}

/**
 * Flatten TriageResults into table rows.
 *
 * Field names match `report.py`'s dataframe columns so the two renderers can
 * be read side by side. Every FK and string-typed number is resolved here so
 * no component below has to know about Liferay's relationship key naming.
 */
export function toRows(
	results: TriageResult[],
	teams: Map<number, string>,
	components: Map<number, string>
): Row[] {
	return results.map((result) => {
		const caseResult = caseResultOf(result);
		const verdict = str(result.classification?.key);
		const confidence = str(result.confidence?.key).toLowerCase();
		const teamId = num(caseResult.r_teamToCaseResult_c_teamId);
		const componentId = num(caseResult.r_componentToCaseResult_c_componentId);

		return {
			baselineSignatureCount: num(result.baselineSignatureCount),
			caseName:
				str(caseResult.r_caseToCaseResult_c_case?.name) || '(unnamed)',
			caseResultId: num(caseResult.id),
			// An unclustered row must not merge with other unclustered rows,
			// so it gets a key of its own rather than a shared '' bucket.
			clusterKey: result.clusterKey || `unclustered:${result.id}`,
			component: componentId === undefined ? '' : components.get(componentId) ?? '',
			confidence,
			culpritCommits: str(result.suspiciousCommits),
			culpritFile: str(result.culpritFile),
			displayVerdict: displayVerdict(verdict, confidence),
			errorMessage: str(caseResult.errors),
			id: result.id,
			linkedIssues: str(caseResult.issues),
			reason: str(result.reason),
			specificChange: str(result.specificChange),
			statusA: str(result.statusA),
			statusB: str(caseResult.dueStatus?.key),
			team: teamId === undefined ? '' : teams.get(teamId) ?? '',
			transition: str(result.transition),
			verdict,
		};
	});
}

/**
 * Everything the report view needs for one build.
 *
 * One SWR key so the three requests load and revalidate as a unit — a table
 * rendered from results that arrived before their team names would show a
 * column of blanks and then reflow.
 */
export function useReport(buildId?: number) {
	const {data, error, isLoading} = useSWR(
		buildId ? ['report', buildId] : null,
		async () => {
			const results = await paginate<TriageResult>(resultsURL(buildId!));

			const teamIds = new Set<number>();
			const componentIds = new Set<number>();

			for (const result of results) {
				const caseResult = caseResultOf(result);
				const teamId = num(caseResult.r_teamToCaseResult_c_teamId);
				const componentId = num(
					caseResult.r_componentToCaseResult_c_componentId
				);

				if (teamId) {
					teamIds.add(teamId);
				}

				if (componentId) {
					componentIds.add(componentId);
				}
			}

			// By id rather than wholesale: a run touches a few dozen of the
			// ~840 components and ~80 teams, and the id sets are already in
			// hand.
			const [teams, components] = await Promise.all([
				namesById('/o/c/teams', [...teamIds]),
				namesById('/o/c/components', [...componentIds]),
			]);

			return toRows(results, teams, components);
		}
	);

	return {error, isLoading, rows: data ?? []};
}

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
 * Build names, for the report title.
 *
 * `TriageRun` stores the build FKs but not their names, so this is one extra
 * request for the target and baseline together.
 *
 * Worth knowing: `/o/c/builds` appears to 404 by id and return an empty
 * collection when probed with a bare `fetch`. That is not a permission wall —
 * it is a missing `x-csrf-token`, which `request()` always sends. Do not
 * conclude the object is unreadable without that header.
 */
export function useBuildNames(ids: Array<number | undefined>) {
	const wanted = [...new Set(ids.filter((id): id is number => Boolean(id)))];

	const {data} = useSWR(
		wanted.length ? ['buildNames', ...wanted] : null,
		async () => {
			const page = await request<Page<{id: number | string; name?: string}>>(
				`/o/c/builds?pageSize=${wanted.length}` +
					`&fields=${encodeURIComponent('id,name')}` +
					`&filter=${encodeURIComponent(idIn(wanted))}`
			);

			const names = new Map<number, string>();

			for (const item of page.items ?? []) {
				const id = num(item.id);

				if (id !== undefined) {
					names.set(id, str(item.name));
				}
			}

			return names;
		}
	);

	return data ?? new Map<number, string>();
}

/** Parse one of TriageRun's JSON blob fields, tolerating absence and garbage. */
export function parseBlob<T>(raw: string | undefined, fallback: T): T {
	if (!raw) {
		return fallback;
	}

	try {
		return JSON.parse(raw) as T;
	}
	catch {
		// A malformed blob is a writer bug, not a reason to blank the report.
		return fallback;
	}
}
