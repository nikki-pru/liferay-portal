/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import useSWR from 'swr';

import type {
	CaseResult,
	IndexRow,
	Page,
	Row,
	TriageResult,
	TriageRoutineSetting,
	TriageRun,
} from '~/types';
import {canonicalVerdict, displayVerdict} from '~/util/verdict';
import {
	chunk,
	type FetchError,
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

/**
 * Every triage run, with build/routine/project names resolved — the index page.
 *
 * Renders entirely from `TriageRun`, which already stores the per-verdict
 * counts, so the whole page is one paginated query plus three id-batched name
 * lookups. There is deliberately no per-run fetch of TriageResults: doing that
 * to compute counts would be an N+1 that grows with every run ever recorded,
 * for numbers the run row already carries.
 */
export function useTriageIndex() {
	const {data, error, isLoading, mutate} = useSWR(['triageIndex'], async () => {
		const runs = await paginate<TriageRun>(
			(page) =>
				`/o/c/triageruns?page=${page}&pageSize=${PAGE_SIZE}` +
				`&sort=${encodeURIComponent('startedAt:desc')}`
		);

		const buildIds = new Set<number>();
		const routineIds = new Set<number>();

		for (const run of runs) {
			for (const id of [
				num(run.r_buildToTriageRuns_c_buildId),
				num(run.r_baselineBuildToTriageRuns_c_buildId),
			]) {
				if (id) {
					buildIds.add(id);
				}
			}

			const routineId = num(run.r_routineToTriageRuns_c_routineId);

			if (routineId) {
				routineIds.add(routineId);
			}
		}

		const [builds, routines] = await Promise.all([
			namesById('/o/c/builds', [...buildIds]),
			// Routines carry the project FK, so this doubles as the project
			// lookup's input — hence not going through `namesById`.
			(async () => {
				const out = new Map<number, {name: string; projectId?: number}>();

				if (!routineIds.size) {
					return out;
				}

				const pages = await Promise.all(
					chunk([...routineIds]).map((batch) =>
						request<Page<{
							id: number | string;
							name?: string;
							r_routineToProjects_c_projectId?: number | string;
						}>>(
							`/o/c/routines?pageSize=${batch.length}` +
								`&fields=${encodeURIComponent('id,name,r_routineToProjects_c_projectId')}` +
								`&filter=${encodeURIComponent(idIn(batch))}`
						)
					)
				);

				for (const page of pages) {
					for (const item of page.items ?? []) {
						const id = num(item.id);

						if (id !== undefined) {
							out.set(id, {
								name: str(item.name),
								projectId: num(item.r_routineToProjects_c_projectId),
							});
						}
					}
				}

				return out;
			})(),
		]);

		const projectIds = [
			...new Set(
				[...routines.values()]
					.map((r) => r.projectId)
					.filter((id): id is number => Boolean(id))
			),
		];

		const projects = await namesById('/o/c/projects', projectIds);

		return runs.map((run): IndexRow => {
			const buildId = num(run.r_buildToTriageRuns_c_buildId) ?? 0;
			const baselineBuildId = num(run.r_baselineBuildToTriageRuns_c_buildId);
			const routineId = num(run.r_routineToTriageRuns_c_routineId);
			const routine = routineId ? routines.get(routineId) : undefined;
			const projectId = routine?.projectId;

			return {
				baselineBuildId,
				baselineName: baselineBuildId
					? builds.get(baselineBuildId) || String(baselineBuildId)
					: '',
				buildId,
				buildName: builds.get(buildId) || String(buildId || ''),
				clusterCounts: countsOf(run.verdictClusterCounts),
				externalReferenceCode: run.externalReferenceCode,
				failures: num(run.totalFailures),
				id: run.id,
				projectId,
				projectName: projectId ? projects.get(projectId) ?? '' : '',
				routineId,
				routineName: routine?.name ?? '',
				rowCounts: countsOf(run.verdictCounts),
				startedAt: run.startedAt,
				status: run.triageRunStatus?.key ?? '',
				totalClusters: num(run.totalClusters),
				written: num(run.totalWritten),
			};
		});
	});

	return {error, isLoading, mutate, rows: data ?? []};
}

/**
 * Queue a triage run for a baseline/target pair.
 *
 * The mirror of Testray's build-list "Run Triage", and deliberately identical
 * to it — same ERC shape, same payload, same Object — so a pair queued from
 * either place is the same request and `runner.py` cannot tell them apart.
 *
 * Writes nothing but identity: a status and three foreign keys. Every other
 * column on the row — counts, clusters, the status matrix — is filled in by
 * `submit` when the pipeline finishes. So this is a request, not a result.
 *
 * The ERC is derived from the pair rather than random, so a double click
 * upserts the same row instead of queueing the work twice. `runner.py` deletes
 * this row on success, because submit writes its own keyed by the bundle id
 * and leaving both would give one build two runs.
 *
 * Nothing here starts a pipeline. A runner has to be draining the queue
 * (`testray-analysis watch --classify`) or the row sits QUEUED — which is why
 * the caller tells the user a run was *requested*, not that it is running.
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

	try {
		return await request(
			`/o/c/triageruns/by-external-reference-code/${encodeURIComponent(
				erc
			)}`,
			{
				body: JSON.stringify({
					analysisMode: 'build-vs-build',
					r_baselineBuildToTriageRuns_c_buildId: baselineBuildId,
					r_buildToTriageRuns_c_buildId: targetBuildId,
					r_routineToTriageRuns_c_routineId: routineId,
					triageRunStatus: {key: 'QUEUED'},
				}),
				method: 'PUT',
			}
		);
	}
	catch (error) {
		// Same reasoning as abortTriageRun: `Request failed: 400` tells the
		// reader nothing they can act on, and a missing picklist entry is a
		// one-line fix in Picklists rather than anything in this code.
		const info = (error as FetchError).info as {title?: string} | undefined;
		const title = info?.title ?? '';

		if (/list type entry/i.test(title)) {
			throw new Error(
				'The QUEUED status is missing from the Triage Run Statuses ' +
					'picklist — add it (key QUEUED) and try again.'
			);
		}

		throw new Error(title || (error as Error).message);
	}
}

/**
 * Withdraw a queued run.
 *
 * Sets ABORTED rather than deleting the row: a withdrawn request is a fact
 * worth keeping — someone asked, someone changed their mind — and a deleted row
 * is indistinguishable from never having clicked. Only QUEUED runs can be
 * aborted; once the pipeline has claimed one it owns the row's state.
 *
 * The ABORTED key must exist on the Triage Run Statuses picklist. Unlike an
 * unknown *field*, which Liferay silently drops, an unknown picklist key fails
 * the write with `400 ... "not mapped to a valid list type entry"` — so the
 * caller surfaces the error rather than letting the row look aborted when it
 * is not.
 */
export async function abortTriageRun(externalReferenceCode: string) {
	try {
		return await request(
			`/o/c/triageruns/by-external-reference-code/${encodeURIComponent(
				externalReferenceCode
			)}`,
			{
				body: JSON.stringify({triageRunStatus: {key: 'ABORTED'}}),
				method: 'PATCH',
			}
		);
	}
	catch (error) {
		// `Request failed: 400` tells the reader nothing actionable. The one
		// failure worth naming is the missing picklist entry, because the fix
		// is a one-line change in Picklists rather than anything in this code.
		const info = (error as FetchError).info as
			| {title?: string}
			| undefined;
		const title = info?.title ?? '';

		if (/list type entry/i.test(title)) {
			throw new Error(
				'The ABORTED status is missing from the Triage Run Statuses ' +
					'picklist — add it (key ABORTED) and try again.'
			);
		}

		throw new Error(title || (error as Error).message);
	}
}

/**
 * Parse a stored count blob, canonicalising its keys.
 *
 * Runs written before the display split store the raw classification, so a key
 * may be `NEEDSREVIEW` (flattened by Liferay) or `NEEDS_REVIEW`, and older rows
 * carry no `NOT_ATTRIBUTABLE` at all. Canonicalising means the column lines up
 * either way; the missing split is a stale-run artifact that a re-submit fixes,
 * not something to guess at here.
 */
function countsOf(raw?: string): Record<string, number> {
	const parsed = parseBlob<Record<string, number>>(raw, {});
	const out: Record<string, number> = {};

	for (const [key, value] of Object.entries(parsed)) {
		const canonical = canonicalVerdict(key);

		out[canonical] = (out[canonical] ?? 0) + Number(value || 0);
	}

	return out;
}

/**
 * Project / routine / build lists for the picker.
 *
 * Deliberately NOT derived from existing runs the way the index's dropdowns
 * are: the point of the picker is to triage a pair that has never been
 * triaged, so a routine with no runs must still be selectable. Each level
 * loads only once its parent is chosen — `/o/c/cases` is ~48k rows on this
 * instance, and builds are the only list big enough to matter.
 */
export function usePickerProjects() {
	const {data} = useSWR(['pickerProjects'], () =>
		paginate<{id: number | string; name?: string}>(
			(page) =>
				`/o/c/projects?page=${page}&pageSize=${PAGE_SIZE}` +
				`&fields=${encodeURIComponent('id,name')}` +
				`&sort=${encodeURIComponent('name:asc')}`
		)
	);

	return (data ?? []).map((p) => ({id: num(p.id) ?? 0, name: str(p.name)}));
}

/**
 * Routines for a project, EXCLUDING any with no builds mirrored.
 *
 * Most routines are empty here. Liferay Portal 7.4 has 41 and four of them
 * have builds; 2024 Q1 has seven and one does. Offering the other 37 is not a
 * neutral cost — picking one produced two empty Baseline/Target dropdowns and
 * no explanation, so the picker looked broken rather than the routine looking
 * empty.
 *
 * Emptiness is established with one `pageSize=1` count query per routine,
 * concurrently, reading `totalCount`. Deliberately NOT one query for every
 * build in the project: that reads the whole build history to learn a yes/no,
 * and while this mirror holds 56 builds for 7.4, a live routine accumulates
 * thousands. Cost here is bounded by the ROUTINE count, which is small and
 * stays small, whatever the build volume does.
 *
 * A count that fails counts as "has builds". Showing a routine that turns out
 * empty is the behaviour we already had; hiding a real one because a request
 * blipped would be a new and much worse failure, and an invisible one.
 */
export function usePickerRoutines(projectId?: number) {
	const {data, isLoading} = useSWR(
		projectId ? ['pickerRoutines', projectId] : null,
		async () => {
			const routines = await paginate<{
				id: number | string;
				name?: string;
			}>(
				(page) =>
					`/o/c/routines?page=${page}&pageSize=${PAGE_SIZE}` +
					`&fields=${encodeURIComponent('id,name')}` +
					`&filter=${encodeURIComponent(fkEquals('r_routineToProjects_c_projectId', projectId!))}` +
					`&sort=${encodeURIComponent('name:asc')}`
			);

			const counted = await Promise.all(
				routines.map(async (routine) => {
					const id = num(routine.id) ?? 0;
					const entry = {id, name: str(routine.name)};

					try {
						const page = await request<{totalCount?: number}>(
							`/o/c/builds?pageSize=1` +
								`&fields=${encodeURIComponent('id')}` +
								`&filter=${encodeURIComponent(fkEquals('r_routineToBuilds_c_routineId', id))}`
						);

						return {...entry, hasBuilds: (page.totalCount ?? 0) > 0};
					}
					catch {
						return {...entry, hasBuilds: true};
					}
				})
			);

			return counted.filter((routine) => routine.hasBuilds);
		}
	);

	return {isLoading, routines: data ?? []};
}

export type PickerBuild = {
	id: number;
	name: string;
	promoted: boolean;
};

export function usePickerBuilds(routineId?: number) {
	const {data, isLoading} = useSWR(
		routineId ? ['pickerBuilds', routineId] : null,
		() =>
			paginate<{
				id: number | string;
				name?: string;
				promoted?: boolean;
			}>(
				(page) =>
					`/o/c/builds?page=${page}&pageSize=${PAGE_SIZE}` +
					`&fields=${encodeURIComponent('id,name,promoted')}` +
					`&filter=${encodeURIComponent(fkEquals('r_routineToBuilds_c_routineId', routineId!))}` +
					// Newest first: a baseline is almost always recent, and the
					// list is otherwise in insertion order.
					`&sort=${encodeURIComponent('dueDate:desc')}`
			)
	);

	return {
		builds: (data ?? []).map(
			(b): PickerBuild => ({
				id: num(b.id) ?? 0,
				name: str(b.name),
				promoted: Boolean(b.promoted),
			})
		),
		isLoading,
	};
}

/** Sample size for the comparability estimate. See `useComparability`. */
const COMPARABILITY_SAMPLE = 200;

/** Below this share, the pair is reported as probably not comparable. */
const COMPARABLE_THRESHOLD = 0.5;

export type Comparability = {
	comparable: boolean;
	matched: number;
	sampled: number;
	share: number;
};

/**
 * Estimate how much of a candidate pair's case set is shared.
 *
 * The diff is an inner join on case id, so a pair whose suites were re-selected
 * between them produces a tiny, confident-looking verdict list — 54 of 3,579 on
 * the run that prompted this. Catching it before the pipeline runs saves ~20
 * minutes and a misleading report.
 *
 * Sampled rather than exact: the exact answer needs every case id from both
 * builds (~18 requests for a 9k-row pair), and this needs two. Validated
 * against four real pairs — 100% on all three same-generation pairs, 0.5% on
 * the known-bad one whose true figure is 1.6%. Precision does not matter here;
 * the question is only "is this pair broken", and the two regimes are nowhere
 * near each other.
 */
export function useComparability(baselineBuildId?: number, targetBuildId?: number) {
	const ready = Boolean(
		baselineBuildId && targetBuildId && baselineBuildId !== targetBuildId
	);

	const {data, isLoading} = useSWR(
		ready ? ['comparability', baselineBuildId, targetBuildId] : null,
		async (): Promise<Comparability | null> => {
			const field = 'r_caseToCaseResult_c_caseId';

			const sample = await request<Page<Record<string, unknown>>>(
				`/o/c/caseresults?pageSize=${COMPARABILITY_SAMPLE}` +
					`&fields=${encodeURIComponent(field)}` +
					`&filter=${encodeURIComponent(fkEquals('r_buildToCaseResult_c_buildId', targetBuildId!))}`
			);

			const ids = [
				...new Set(
					(sample.items ?? [])
						.map((item) => num(item[field]))
						.filter((id): id is number => Boolean(id))
				),
			];

			if (!ids.length) {
				return null;
			}

			// totalCount only — the ids themselves are not needed, just how many
			// of them the baseline also ran.
			const hit = await request<Page<unknown>>(
				`/o/c/caseresults?pageSize=1` +
					`&fields=${encodeURIComponent(field)}` +
					`&filter=${encodeURIComponent(
						`${fkEquals('r_buildToCaseResult_c_buildId', baselineBuildId!)} and ${fkIn(field, ids)}`
					)}`
			);

			const matched = Math.min(hit.totalCount ?? 0, ids.length);
			const share = matched / ids.length;

			return {
				comparable: share >= COMPARABLE_THRESHOLD,
				matched,
				sampled: ids.length,
				share,
			};
		}
	);

	return {comparability: data ?? null, isLoading: ready && isLoading};
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
