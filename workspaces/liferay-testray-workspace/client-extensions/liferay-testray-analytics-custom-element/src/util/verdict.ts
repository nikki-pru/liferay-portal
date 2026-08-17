/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * Verdict presentation, kept in step with the CLI's `report.py`.
 *
 * Colours are Testray's own, so the triage view reads as part of the product:
 * `styles/_variables.scss` ($failedColor, $passedColor, $blockedColor) and
 * `util/constants.ts` DATA_COLORS. Verdicts are ours rather than Testray
 * statuses, so they are mapped onto the nearest product meaning — BUG takes the
 * FAILED red, POSSIBLEBUG the lighter status-pill red, NEEDSREVIEW the BLOCKED
 * amber ("needs attention"), TESTFIX the exact TEST_FIX blue, and the
 * non-actionable buckets the incomplete/untested greys.
 *
 * Picklist keys arrive flattened (`POSSIBLEBUG`, not `POSSIBLE_BUG`): Liferay
 * strips underscores from list-type entry keys, which is why the writer
 * flattens enums on the way in.
 */

type Swatch = {bg: string; fg: string; label: string};

/** Severity order — index doubles as the sort rank. */
export const VERDICT_ORDER = [
	'BUG',
	'POSSIBLEBUG',
	'TESTFIX',
	'NEEDSREVIEW',
	'FALSEPOSITIVE',
	'ENVFAILURE',
	'DIDNOTRUN',
] as const;

const UNKNOWN: Swatch = {bg: '#E3E9EE', fg: '#22262a', label: 'Unclassified'};

export const VERDICT: Record<string, Swatch> = {
	BUG: {bg: '#E73A45', fg: '#fff', label: 'Bug'},
	DIDNOTRUN: {bg: '#E3E9EE', fg: '#22262a', label: 'Did Not Run'},
	ENVFAILURE: {bg: '#E3E9EE', fg: '#22262a', label: 'Env Failure'},
	FALSEPOSITIVE: {bg: '#BCBDC0', fg: '#22262a', label: 'False Positive'},
	NEEDSREVIEW: {bg: '#F8D72E', fg: '#3a3000', label: 'Needs Review'},
	POSSIBLEBUG: {bg: '#FE5160', fg: '#fff', label: 'Possible Bug'},
	TESTFIX: {bg: '#59BBFC', fg: '#08243c', label: 'Test Fix'},
};

export const swatch = (verdict?: string): Swatch =>
	(verdict && VERDICT[verdict]) || UNKNOWN;

export const verdictRank = (verdict?: string): number => {
	const index = VERDICT_ORDER.indexOf(verdict as never);

	return index === -1 ? VERDICT_ORDER.length : index;
};

/**
 * Triage-run state for the build-index diamond.
 *
 * A diamond rather than a circle on purpose: the neighbouring Build Status
 * column already uses a circle for task/testflow state, and reusing the shape
 * would read as the same vocabulary. Absent runs render nothing at all — the
 * same way an unpromoted build renders no star — which is what keeps the column
 * quiet on routines that never triage.
 */
export const RUN_STATUS: Record<
	string,
	{clickable: boolean; color: string; title: string}
> = {
	DONE: {clickable: true, color: '#37d27e', title: 'Triage ready'},
	FAILED: {clickable: true, color: '#fe5160', title: 'Triage failed'},
	QUEUED: {clickable: false, color: '#ffd764', title: 'Triage queued'},
	RUNNING: {clickable: false, color: '#ffd764', title: 'Triage generating'},
};
