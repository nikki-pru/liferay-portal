/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

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
const BASE_URL = 'https://liferay.atlassian.net';

/**
 * Jira's CreateIssueDetails takes these as URL parameters, so an over-long
 * field does not truncate gracefully — it makes a URL the browser or the
 * gateway rejects and the button silently does nothing. Cap here instead.
 */
const SUMMARY_MAX = 240;
const DESC_MAX = 8000;
const ERROR_MAX = 1200;

export type ReportMeta = {
	buildId: number;
	buildName?: string;
	caseURL: (caseResultId?: number) => string;
	classifier?: string;
	runId?: string;
};

const truncate = (value: string, limit: number): string =>
	value.length <= limit ? value : `${value.slice(0, limit)}\n… truncated`;

export function jiraDraftURL(
	meta: ReportMeta,
	{
		count = 1,
		rows,
		summaryText,
		verdict,
	}: {count?: number; rows: Row[]; summaryText: string; verdict: string}
): string {
	const first = rows[0];
	const build = meta.buildName || String(meta.buildId);

	let summary = `Investigate ${count} test failure${count === 1 ? '' : 's'}`;

	if (build) {
		summary += ` in ${build}`;
	}

	if (summaryText) {
		summary += ` — ${summaryText}`;
	}

	const parts = [
		`h3. Root cause (${verdict || 'UNCLASSIFIED'}, ${count} test${
			count === 1 ? '' : 's'
		})`,
		'',
		summaryText || '(no reasoning recorded)',
		'',
	];

	if (first?.culpritFile) {
		parts.push('h3. Culprit file', '', `{{${first.culpritFile}}}`, '');

		if (first.culpritCommits) {
			parts.push(`Changed by: ${first.culpritCommits}`, '');
		}
	}

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

	const caseURL = meta.caseURL(first?.caseResultId);

	if (caseURL) {
		parts.push('h3. Testray', '', caseURL, '');
	}

	parts.push(
		'h3. Claude reasoning',
		'',
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
