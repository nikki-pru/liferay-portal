/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {Row} from '~/types';

/** Ticket keys the classifier names in `specificChange`. Mirrors report._TICKET_RE. */
const TICKET_RE = /\b((?:LPD|LPP|LPS)-\d+)\b/g;

/** Verdicts where a human still has to finish the job. A BUG or TEST_FIX has
 *  already named its cause, so a "go investigate" prompt is noise there. */
export const NEEDS_HUMAN = new Set([
	'NEEDS_REVIEW',
	'NOT_ATTRIBUTABLE',
	'POSSIBLE_BUG',
]);

/** Tests listed before the prompt collapses to a count. A cluster can hold
 *  sixty, and listing them all buries the instructions. */
const MAX_TESTS = 12;

const COMPARE = 'https://github.com/liferay/liferay-portal/compare';

/**
 * A copy-pasteable prompt for whoever picks a row up in their own Claude Code
 * session, to verify it against a local liferay-portal checkout.
 *
 * Written as an instruction to an agent, not a summary for a human: it names
 * the range so the agent can read the diff itself, lists the candidate tickets
 * triage could not choose between, and says what to DO with them. "Verify
 * this" on its own gives an agent nothing to act on.
 *
 * `verdict` is passed in rather than read off the row: on a cluster header the
 * label shown is the ROLLUP of its members, and reading the first member's own
 * verdict produced prompts opening "classified as FALSE_POSITIVE — it could
 * not settle the cause", which is both wrong and self-contradicting.
 *
 * Mirrors `_reviewer_prompt` in report.py (§12 view contract). One difference
 * is unavoidable: report.py names the git branch from run.yml's `base_branch`,
 * and TriageResult has no such field, so the branch line is omitted here.
 */
export function verificationPrompt(
	row: Row,
	tests: string[],
	verdict: string
): string {
	const a = (row.gitHashA || '').slice(0, 12);
	const b = (row.gitHashB || '').slice(0, 12);
	const range = a && b ? `${a}..${b}` : '';
	const tickets = [...new Set(row.specificChange?.match(TICKET_RE) ?? [])];
	const named = tests.filter(Boolean);

	const L: string[] = [
		`A Liferay test-analysis run classified this failure as ${verdict}` +
			(row.confidence ? ` (${row.confidence} confidence)` : '') +
			' — it could not settle the cause. Please finish the triage.',
		'',
		'Repo:   liferay-portal',
	];

	if (range) {
		L.push(`Range:  ${range}   (the target build ran at ${b})`);
		L.push(`        ${COMPARE}/${row.gitHashA}...${row.gitHashB}`);
	}

	L.push('');
	L.push(
		`Failing test${named.length > 1 ? 's' : ''}` +
			(named.length > MAX_TESTS
				? ` (${named.length} in this cluster, first ${MAX_TESTS} shown)`
				: '') +
			':'
	);
	named.slice(0, MAX_TESTS).forEach((t) => L.push(`  - ${t}`));

	if (named.length > MAX_TESTS) {
		L.push(`  … and ${named.length - MAX_TESTS} more`);
	}

	if (row.errorMessage) {
		L.push('', 'Shared error:', `  ${row.errorMessage.slice(0, 400)}`);
	}

	L.push('');

	if (tickets.length) {
		L.push(
			'Candidate causes triage found but could not choose between:',
			`  ${tickets.join(', ')}`,
			'',
			'Please:',
			"1. Read each candidate's commits in the range",
			`   (git log ${range} --grep=${tickets[0]}) and judge whether that`,
			'   change could produce this error.'
		);
	}
	else {
		L.push(
			'Triage found no concrete candidate, so start from the range.',
			'',
			'Please:',
			"1. Find changes in the range touching the failing test's module",
			`   (git log ${range} -- <module path>) and judge whether any could`,
			'   produce this error.'
		);
	}

	L.push(
		'2. If one is the cause, say which it is:',
		'     BUG      — the production change is a defect',
		'     TEST_FIX — the production change was intentional and the test',
		'                asserts the old behaviour, so the test needs updating',
		'3. Run the failing test locally to confirm before concluding.',
		'4. Report the verdict, the culprit file, and the evidence you used.'
	);

	return L.join('\n');
}
