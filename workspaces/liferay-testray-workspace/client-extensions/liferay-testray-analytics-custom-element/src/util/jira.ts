/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {TESTRAY_PATH} from './testray';

import type {Row} from '~/types';

/**
 * Prefilled Jira draft links. Opens a draft — nothing is ever filed.
 *
 * Three fields the CLI can supply are deliberately absent here: `parent`,
 * `reporter` and `labels` are per-run, not per-view. The release's triage
 * parent changes every release, the reporter is whoever is filing, and a
 * standing label would tag every draft from every release alike. Jira reads an
 * empty parameter as a deliberate clear, so they are omitted rather than sent
 * blank — the person filing sets them in the draft.
 */

/** Liferay's LPD project and its Task issue type. */
const PROJECT_ID = '11106';
const ISSUE_TYPE = '10002';
export const BASE_URL = 'https://liferay.atlassian.net';

/**
 * Jira's CreateIssueDetails takes these as URL parameters, so an over-long
 * field does not truncate gracefully — it makes a URL the browser or the
 * gateway rejects and the button silently does nothing. Cap here instead.
 */
/**
 * Jira's hard limit is 255; 120 is a READABILITY budget. A summary is a title —
 * the reasoning belongs in the description under 'Claude reasoning'.
 */
const SUMMARY_MAX = 120;
const DESC_MAX = 8000;
const ERROR_MAX = 1200;

/**
 * Testray links listed before the cap starts costing later sections. A
 * 36-member cluster produces ~6.5 KB of links, which pushed the causes and the
 * provenance footer past DESC_MAX and silently lost them.
 */
const TESTRAY_LINKS = 20;

export type ReportMeta = {
	buildId: number;
	buildName?: string;
	caseURL: (caseResultId?: number) => string;
	classifier?: string;
	runId?: string;
};

/**
 * A test identifier short enough for a ticket title.
 *
 * Four shapes arrive here and each wastes the budget differently:
 *   - `LocalFile.Foo#Bar`           the Poshi prefix carries no information
 *   - `a/b/c.spec.ts > prose title` Playwright appends the whole test title
 *   - `com.liferay.x.y.FooTest#it`  the package is ~40 identical characters, so
 *     truncating from the left produced `com.liferay.headless.commerce.deli…`
 *     for a dozen different tests — indistinguishable in a Jira list
 *   - `path/to/file`                only the basename identifies it
 */
export function shortTestName(name?: string, cap = 45): string {
	let text = String(name ?? '')
		.trim()
		.replace(/^LocalFile\./, '')
		.split(/\s+[>›]\s+/)[0]
		.replace(/\.spec\.(ts|js)x?$/, '');

	if (text.includes('.') && !text.includes('/')) {
		const segments = text.split('.');
		const first = segments.findIndex((segment) => /^[A-Z]/.test(segment));

		if (first > -1) {
			text = segments.slice(first).join('.');
		}
	}

	text = text.split('/').pop() ?? text;

	return text.length <= cap ? text : `${text.slice(0, cap).trimEnd()}…`;
}

/**
 * Trim on a word boundary. A raw slice produced titles ending mid-word
 * ('...clearing the multi-select ref synchron').
 */
export function trimWords(text?: string, cap = 110): string {
	const value = String(text ?? '')
		.split(/\s+/)
		.filter(Boolean)
		.join(' ');

	if (value.length <= cap) {
		return value;
	}

	return `${value
		.slice(0, cap)
		.replace(/\s+\S*$/, '')
		.replace(/[\s,;:—-]+$/, '')}…`;
}

const FQN_RE = /\b(?:[a-z][\w]*\.){2,}([A-Z]\w*)/g;
const EXC_RE = /^([A-Z]\w*(?:Exception|Error|Failure))\s*:\s*([\s\S]*)/;

/**
 * The identifying fragment of a failure, for a ticket title.
 *
 * The error is what makes a ticket findable and de-duplicable — two people
 * hitting the same `PathNotFoundException` should land on the same ticket,
 * which prose reasoning never achieves. Four things bury it: a Playwright
 * `› file:line › title` prefix, fully-qualified names, a trailing JSON
 * payload, and — when what remains is still long — an ALL_CAPS token that is
 * usually the real signal.
 */
export function errorGist(error?: string, cap = 52): string {
	let text = String(error ?? '')
		.split(/\s+/)
		.filter(Boolean)
		.join(' ');

	if (!text) {
		return '';
	}

	if (text.includes('›')) {
		const marker = text.search(/(Error:|Timed out|expect\()/);

		if (marker > -1) {
			text = text.slice(marker);
		}
	}

	text = text.replace(/^Error:\s*/, '').replace(FQN_RE, '$1');

	const exception = EXC_RE.exec(text);

	if (exception) {
		const message = exception[2].split('{')[0].replace(/^[\s:]+|[\s:]+$/g, '');

		text = message ? `${exception[1]}: ${message}` : exception[1];
	}

	const upper = /"?\b([A-Z][A-Z0-9_]{6,})\b"?/.exec(text);

	if (upper && text.length > cap) {
		text = upper[1];
	}

	text = text.trim().replace(/^"|"$/g, '');

	// "2 Failed tests testJoinCount testJoinSelect" names WHICH tests failed
	// but never says what went wrong, so putting it in a title reads as an
	// error while carrying no information. Returning '' makes the caller drop
	// the clause and let the test name identify the ticket instead.

	if (
		/^\d+\s+(?:failed|skipped)\s+tests?\b/i.test(text) &&
		!/[:=]|Exception|Error\b|Failure/.test(text)
	) {
		return '';
	}

	return text.length <= cap ? text : trimWords(text, cap);
}

const truncate = (value: string, limit: number): string =>
	value.length <= limit ? value : `${value.slice(0, limit)}\n… truncated`;

export function jiraDraftURL(
	meta: ReportMeta,
	{
		anchor,
		clusterNumber,
		count = 1,
		rows,
		summaryText,
		verdict,
	}: {
		anchor?: string;
		clusterNumber?: number;
		count?: number;
		rows: Row[];
		summaryText: string;
		verdict: string;
	}
): string {
	const first = rows[0];
	const build = meta.buildName || String(meta.buildId);

	// Built from structured fields, not prose. The component is deliberately
	// absent — it is its own Jira field, so repeating it here spends
	// characters on something the form already captures. The test name
	// identifies the ticket; a count does not.

	const unit =
		count === 1 ? shortTestName(first?.caseName) : `${count} tests`;

	let summary = `Investigate ${unit || `${count} tests`}`;

	if (build) {
		summary += ` failing in ${build}`;
	}

	// Append what it failed WITH only when that is an actual message. No
	// fallback to the reasoning: with no real error the title stops at the
	// build, because the model's prose trailed off mid-thought here.

	const gist = errorGist(first?.errorMessage);

	if (gist) {
		summary += ` with ${gist}`;
	}

	// Order is deliberate: observed fact first, then where to see it, then the
	// interpretation, then the guess. Opening with the reasoning asserted as
	// settled fact something the verdict itself only rates POSSIBLE_BUG — a
	// reader saw a conclusion before any evidence for it.

	const parts: string[] = [];

	if (first?.errorMessage) {
		parts.push(
			'h3. Error',
			'',
			'{code}',
			truncate(first.errorMessage, ERROR_MAX),
			'{code}',
			''
		);
	}

	// One line per member, not just rows[0]: a cluster's whole point is that
	// several tests failed together, and a reviewer needs to reach each result.

	const links = rows
		.map((row) => {
			const url = meta.caseURL(row.caseResultId);

			return url
				? `* [${trimWords(row.caseName || String(row.caseResultId ?? ''))}|${url}]`
				: '';
		})
		.filter(Boolean);

	if (links.length) {
		parts.push('h3. Testray', '', ...links.slice(0, TESTRAY_LINKS));

		const extra = links.length - TESTRAY_LINKS;

		if (extra > 0) {
			parts.push(
				`* … and ${extra} more failing test${
					extra === 1 ? '' : 's'
				} in this cluster`
			);
		}

		parts.push('');
	}

	parts.push(
		`h3. Claude reasoning (${verdict || 'UNCLASSIFIED'}, ${count} test${
			count === 1 ? '' : 's'
		})`,
		'',
		summaryText || '(no reasoning recorded)',
		''
	);

	// "Possible cause", not "Culprit file": this is the classifier's candidate,
	// not an established fact, and the heading should not outrank the verdict.

	const causes: string[] = [];

	if (first?.culpritFile) {
		causes.push(`{{${first.culpritFile}}}`);
	}

	if (first?.culpritCommits) {
		causes.push(first.culpritCommits);
	}

	if (causes.length) {
		parts.push(
			causes.length > 1 ? 'h3. Possible causes' : 'h3. Possible cause',
			'',
			...causes,
			''
		);
	}

	// Provenance last: which classifier and which run produced this draft. It
	// is what you check when a verdict looks wrong, not what you read first.

	parts.push('----');

	if (first?.clusterKey) {
		// The clusterKey is the stable identity of this failure group — what
		// Testray stores and what the ledger re-attributes against — so a
		// ticket carrying it can be traced back to the analysis long after
		// this page has moved on.
		//
		// Worded to match report.py: point the reader at the row's "Copy
		// prompt" action, because the ticket should say how to VERIFY the
		// claim, not just where it came from. The label is the number printed
		// on the row (1-based); the anchor is 0-based.
		//
		// The CX always has somewhere to link — the report is this page — so
		// the Python's no-report fallback (printing the bare key) cannot
		// happen here. The key still travels in the link text when there is no
		// cluster number to name.

		const report = `${window.location.origin}${TESTRAY_PATH}/triage?buildId=${meta.buildId}`;
		const target = anchor ? `${report}#${anchor}` : report;
		const nth = clusterNumber ? `Cluster ${clusterNumber}` : 'the cluster';

		parts.push(
			`Cluster: Copy prompt from [${nth}|${target}] for local verification`,
			`Cluster key: ${first.clusterKey}`
		);
	}

	parts.push(
		`Classifier: ${meta.classifier ?? ''}`,
		`Run: ${meta.runId ?? ''}`
	);

	const params = new URLSearchParams({
		description: parts.join('\n').slice(0, DESC_MAX),
		issuetype: ISSUE_TYPE,
		pid: PROJECT_ID,
		summary: summary.slice(0, SUMMARY_MAX),
	});

	return `${BASE_URL}/secure/CreateIssueDetails!init.jspa?${params}`;
}
