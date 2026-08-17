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

export type Verdict =
	| 'BUG'
	| 'POSSIBLEBUG'
	| 'TESTFIX'
	| 'NEEDSREVIEW'
	| 'FALSEPOSITIVE';

export type TriageRunStatus = 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';

export type TriageResult = {
	analysisMode?: string;
	classification?: Picklist;
	classifier?: string;
	clusterKey?: string;
	confidence?: Picklist;
	culpritFile?: string;
	externalReferenceCode: string;
	gitHashA?: string;
	gitHashB?: string;
	id: number;
	r_caseResultToTriageResults_c_caseResultId?: number;
	reason?: string;
	specificChange?: string;
	suspiciousCommits?: string;
};

export type TriageRun = {
	analysisMode?: string;
	classifier?: string;
	errorMessage?: string;
	externalReferenceCode: string;
	finishedAt?: string;
	id: number;
	r_baselineBuildToTriageRuns_c_buildId?: number;
	r_buildToTriageRuns_c_buildId?: number;
	r_routineToTriageRuns_c_routineId?: number;
	startedAt?: string;
	totalClassified?: number;
	totalClusters?: number;
	totalExcluded?: number;
	totalFailures?: number;
	totalWritten?: number;
	triageRunStatus?: Picklist;
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

/** A clusterKey and the failures that share it. Built client-side. */
export type Cluster = {
	clusterKey: string;
	culpritFile?: string;
	members: TriageResult[];
	worstVerdict?: string;
};
