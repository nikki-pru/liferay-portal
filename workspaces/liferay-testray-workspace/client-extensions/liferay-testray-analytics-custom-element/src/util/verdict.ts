/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * Verdict presentation, kept in step with the CLI's `report.py`.
 *
 * The two renderers must agree, so this file mirrors `_VERDICT_ORDER`,
 * `_VERDICT_CLASS`, `display_verdict`, `_rollup` and the explicit sort ranks
 * rather than inventing a second vocabulary. Where they disagree the report is
 * the authority — it is the artifact people have already read.
 *
 * Verdicts are ours rather than Testray statuses, so colours are mapped onto
 * the nearest product meaning from `styles/_variables.scss`: BUG takes the
 * FAILED red, POSSIBLE_BUG the lighter status-pill red, NEEDS_REVIEW the
 * BLOCKED amber, TEST_FIX the exact TEST_FIX blue, and the non-actionable
 * buckets the incomplete/untested greys.
 */

/**
 * Liferay strips underscores from picklist entry keys, so the stored verdict
 * reads back as POSSIBLEBUG where the report says POSSIBLE_BUG. Canonicalise
 * on the way in: one vocabulary downstream, and it is the report's.
 */
const CANONICAL: Record<string, string> = {
	AUTOCLASSIFIED: 'AUTO_CLASSIFIED',
	DIDNOTRUN: 'DID_NOT_RUN',
	ENVFAILURE: 'ENV_FAILURE',
	FALSEPOSITIVE: 'FALSE_POSITIVE',
	NEEDSREVIEW: 'NEEDS_REVIEW',
	NOTATTRIBUTABLE: 'NOT_ATTRIBUTABLE',
	POSSIBLEBUG: 'POSSIBLE_BUG',
	TESTFIX: 'TEST_FIX',
};

export const canonicalVerdict = (key?: string): string =>
	key ? CANONICAL[key] ?? key : '';

/** Severity order — the index doubles as the sort rank. */
export const VERDICT_ORDER = [
	'BUG',
	'POSSIBLE_BUG',
	'NEEDS_REVIEW',
	'TEST_FIX',
	'NOT_ATTRIBUTABLE',
	'FALSE_POSITIVE',
	'ENV_FAILURE',
	'DID_NOT_RUN',
	'AUTO_CLASSIFIED',
	'PENDING',
] as const;

/**
 * NOT_ATTRIBUTABLE is a DISPLAY label, never a stored verdict.
 *
 * A low-confidence NEEDS_REVIEW is the classifier saying "I could not
 * attribute this", not "a human must review 153 failures" — and reporting the
 * latter to a dev team misrepresents what was actually said. The stored
 * classification stays NEEDS_REVIEW, so nothing in the picklist or the writer
 * moves.
 */
const UNATTRIBUTED_FROM = 'NEEDS_REVIEW';
const UNATTRIBUTED_AT = new Set(['low']);

/** Candidate tickets the classifier names in `specificChange`. The display
 *  rule depends on it. Mirrors verdicts.CANDIDATE_RE. */
const CANDIDATE_RE = /\b(?:LPD|LPP|LPS)-\d+\b/;

export function displayVerdict(
	verdict?: string,
	confidence?: string,
	specificChange?: string
): string {
	const cls = canonicalVerdict(verdict);

	if (cls !== UNATTRIBUTED_FROM) {
		return cls;
	}

	// Only a genuine `low` from the classifier relabels. A row with NO
	// confidence never reached the model — it carries an auto label, and
	// nothing failed to attribute it because nothing was asked.
	if ((confidence ?? '').toLowerCase() !== 'low') {
		return cls;
	}

	// A low-confidence verdict that still NAMED candidate tickets attributed
	// something; it just could not choose. Only a verdict naming nothing is
	// honestly "not attributable".
	if (CANDIDATE_RE.test(specificChange ?? '')) {
		return cls;
	}

	return 'NOT_ATTRIBUTABLE';
}

/**
 * CSS class per verdict. Several non-actionable buckets share `auto` because
 * they are all "the pipeline decided this without reasoning about it".
 */
const VERDICT_CLASS: Record<string, string> = {
	AUTO_CLASSIFIED: 'auto',
	BUG: 'bug',
	DID_NOT_RUN: 'auto',
	ENV_FAILURE: 'auto',
	FALSE_POSITIVE: 'fp',
	NEEDS_REVIEW: 'needs',
	NOT_ATTRIBUTABLE: 'unattr',
	PENDING: 'auto',
	POSSIBLE_BUG: 'pbug',
	TEST_FIX: 'testfix',
};

export const verdictClass = (verdict?: string): string =>
	VERDICT_CLASS[verdict ?? ''] ?? 'auto';

export const verdictRank = (verdict?: string): number => {
	const index = VERDICT_ORDER.indexOf((verdict ?? '') as never);

	return index === -1 ? VERDICT_ORDER.length : index;
};

/**
 * The most severe verdict in a group — what a cluster header shows.
 *
 * A cluster is only as safe as its worst member: one BUG among thirty
 * FALSE_POSITIVEs is still a BUG, and rolling up to the majority would hide
 * exactly the row worth acting on. Returns '' when nothing is classified.
 */
export function rollup(verdicts: Array<string | undefined>): string {
	let best = '';
	let bestRank: number = VERDICT_ORDER.length;

	for (const verdict of verdicts) {
		if (!verdict) {
			continue;
		}

		const rank = verdictRank(verdict);

		if (rank < bestRank) {
			best = verdict;
			bestRank = rank;
		}
	}

	return best;
}

export const CONFIDENCE_ORDER: Record<string, number> = {
	high: 0,
	low: 2,
	medium: 1,
};

export const confidenceRank = (confidence?: string): number =>
	CONFIDENCE_ORDER[(confidence ?? '').toLowerCase()] ?? 9;

/** PASSED is the only good state, so anything else is a regression from it. */
export const worse = (a: string, b: string): boolean =>
	a === 'PASSED' && b !== 'PASSED';

/**
 * Colour for one status-matrix cell.
 *
 * Green means ONLY "ended up passing", red means ONLY "was passing and no
 * longer is". Everything else is uncoloured, because it is neither.
 *
 * This used to read `worse(a, b) ? red : green`, which made green the default
 * for every off-diagonal cell — so DNR -> FAILED and FAILED -> DNR both
 * rendered green, reading as good news when nothing good happened. Green is a
 * claim about the target column, not the absence of a regression.
 *
 * Mirrors `_cell_class` in report.py (§12 view contract).
 */
export const cellClass = (a: string, b: string): string => {
	if (a === b) {
		return 'same';
	}

	if (b === 'PASSED') {
		return 'better';
	}

	// Red mirrors green: "ended up failing", wherever it came from, PLUS "was
	// passing and no longer is" (which also covers ending up BLOCKED or
	// not-run). UNTESTED -> FAILED is red on purpose — that is
	// TRANSITION_NO_BASELINE, which prepare treats as a triage candidate
	// because the usual cause is a NEW test that fails.
	if (b === 'FAILED' || worse(a, b)) {
		return 'worse';
	}

	// A move between two non-passing states that does not end in a failure: a
	// lost signal rather than a failure.
	return 'neutral';
};

export const STATUS_ORDER = [
	'PASSED',
	'FAILED',
	'BLOCKED',
	'TESTFIX',
	'UNTESTED',
	'DIDNOTRUN',
];

const STATUS_LABEL: Record<string, string> = {
	DIDNOTRUN: 'DNR',
	TESTFIX: 'Test Fix',
	UNTESTED: 'DNR',
};

export const statusLabel = (code: string): string =>
	STATUS_LABEL[code] ?? code.charAt(0) + code.slice(1).toLowerCase();

/**
 * What each PASSED/FAILED cell MEANS, printed under the number in the status
 * matrix. Reading a cross-tab means holding "row = baseline, column = target"
 * in your head and re-deriving the meaning four times; the caption does that
 * once. Keyed `${A status}|${B status}`.
 *
 * Only the four pass/fail combinations are named. BLOCKED / Test Fix / DNR
 * cells stay bare on purpose — a phrase for every combination would be nine
 * captions of clutter to explain the four a reader acts on.
 *
 * Mirrors `_CELL_NOTE` in report.py (§12 view contract).
 */
export const CELL_NOTE: Record<string, string> = {
	'FAILED|FAILED': 'failed in both',
	'FAILED|PASSED': 'now passing',
	'PASSED|FAILED': 'new failures',
	'PASSED|PASSED': 'passed in both',
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
	// Grey, deliberately outside the traffic-light set: an aborted run is not a
	// failure to investigate, it is a request someone withdrew.
	ABORTED: {clickable: false, color: '#a7a9bc', title: 'Triage aborted'},
	DONE: {clickable: true, color: '#37d27e', title: 'Triage ready'},
	FAILED: {clickable: true, color: '#fe5160', title: 'Triage failed'},
	QUEUED: {clickable: false, color: '#ffd764', title: 'Triage queued'},
	RUNNING: {clickable: false, color: '#ffd764', title: 'Triage in progress'},
};
