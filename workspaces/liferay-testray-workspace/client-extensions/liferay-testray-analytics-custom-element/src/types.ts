/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/** Liferay picklist fields read back as {key, name}, not a bare string. */
export type Picklist = {key: string; name: string};

export type Page<T> = {
	items: T[];
	lastPage: number;
	page: number;
	pageSize: number;
	totalCount: number;
};

export type TriageRunStatus =
	| 'QUEUED'
	| 'RUNNING'
	| 'DONE'
	| 'FAILED'
	| 'ABORTED';

/**
 * A Testray CaseResult, as expanded onto a TriageResult.
 *
 * Two things to know about the shape. Numbers arrive as STRINGS — `id`,
 * `baselineSignatureCount` and every `…Id` field — because Object REST
 * serialises bigint columns as text; everything here is coerced through
 * `Number()` in `toRows`. And the expansion key differs by query: with a
 * `fields=` projection the object lands under `caseResultToTriageResults`,
 * without one under `r_caseResultToTriageResults_c_caseResult`. Both are read.
 */
export type CaseResult = {
	dueStatus?: Picklist;
	errors?: string;
	id?: number | string;
	issues?: string;
	r_caseToCaseResult_c_case?: {id?: number | string; name?: string};
	r_caseToCaseResult_c_caseId?: number | string;
	r_componentToCaseResult_c_componentId?: number | string;
	r_teamToCaseResult_c_teamId?: number | string;
};

export type TriageResult = {
	analysisMode?: string;
	baselineSignatureCount?: number | string;
	caseResultToTriageResults?: CaseResult;
	classification?: Picklist;
	classifier?: string;
	clusterKey?: string;
	confidence?: Picklist;
	culpritFile?: string;
	externalReferenceCode: string;
	gitHashA?: string;
	gitHashB?: string;
	id: number;
	r_caseResultToTriageResults_c_caseResult?: CaseResult;
	r_caseResultToTriageResults_c_caseResultId?: number | string;
	reason?: string;
	specificChange?: string;
	statusA?: string;
	suspiciousCommits?: string;
	transition?: string;
};

export type TriageRun = {
	analysisMode?: string;
	baselineRows?: number | string;
	classifier?: string;
	errorMessage?: string;
	externalReferenceCode: string;
	finishedAt?: string;
	id: number;
	r_baselineBuildToTriageRuns_c_buildId?: number;
	r_buildToTriageRuns_c_buildId?: number;
	r_routineToTriageRuns_c_routineId?: number;
	startedAt?: string;
	/** JSON blob: {"PASSED": {"FAILED": 226, …}, …}. */
	statusMatrix?: string;
	targetRows?: number | string;
	totalClassified?: number;
	totalClusters?: number;
	totalExcluded?: number;
	totalFailures?: number;
	totalWritten?: number;
	/** JSON blob: {"new": 226, "changed": 197, …}. */
	transitionCounts?: string;
	triageRunStatus?: Picklist;
	/** JSON blob keyed by verdict, counting CLUSTERS rather than rows. */
	verdictClusterCounts?: string;
	/** JSON blob: {"BUG": 2, "TEST_FIX": 7, …}. Schemaless on purpose — the
	 *  verdict taxonomy has churned once already and a field added after the
	 *  Object exists lands in the `_x` table. */
	verdictCounts?: string;
};

export type TriageRoutineSetting = {
	autoTriage?: boolean;
	baselineStrategy?: Picklist;
	classificationMode?: Picklist;
	externalReferenceCode: string;
	id: number;
	r_routineToTriageRoutineSettings_c_routineId?: number;
};

/**
 * One table row, flattened.
 *
 * The view never touches Liferay's `r_<relationship>_c_<target>Id` keys or the
 * string-typed numbers behind them: `toRows` resolves all of that once, so
 * every component below reads plain fields. Field names deliberately match
 * `report.py`'s dataframe columns so the two renderers can be diffed.
 */
export type Row = {
	baselineSignatureCount?: number;
	caseResultId?: number;
	caseName: string;
	clusterKey: string;
	component: string;
	confidence: string;
	culpritCommits: string;
	culpritFile: string;
	/** Derived, never stored — see `displayVerdict`. */
	displayVerdict: string;
	errorMessage: string;
	id: number;
	linkedIssues: string;
	reason: string;
	specificChange: string;
	statusA: string;
	statusB: string;
	team: string;
	transition: string;
	/** The stored classification, before the NOT_ATTRIBUTABLE relabel. */
	verdict: string;
};

/** A clusterKey and the rows that share it. Built client-side. */
export type Cluster = {
	clusterKey: string;
	/** 1-based display number, stable across regrouping. */
	number: number;
	rows: Row[];
	/** Columns whose value is identical across every member. */
	shared: Set<string>;
	worstVerdict: string;
};

export type GroupMode = 'cluster' | 'component' | 'team' | 'verdict';

export type Group = {
	label: string;
	rows: Row[];
	worstVerdict: string;
};

/**
 * One row of the Triage index: a run, with the names its FKs point at and its
 * stored per-verdict counts already parsed.
 */
export type IndexRow = {
	baselineBuildId?: number;
	baselineName: string;
	buildId: number;
	buildName: string;
	/** Per-verdict CLUSTER counts — the headline unit, see the view contract. */
	clusterCounts: Record<string, number>;
	externalReferenceCode: string;
	failures?: number;
	id: number;
	projectId?: number;
	projectName: string;
	routineId?: number;
	routineName: string;
	/** Per-verdict ROW counts, shown as fan-out where they differ. */
	rowCounts: Record<string, number>;
	startedAt?: string;
	status: string;
	totalClusters?: number;
	written?: number;
};
