/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Fragment} from 'react';

import type {Row} from '~/types';
import type {ReportMeta} from '~/util/jira';
import {Status} from './Cells';

type Props = {
	css: string;
	meta: ReportMeta;
	row: Row;
};

/**
 * Long build logs are attached in full to the run bundle; the panel shows
 * enough to recognise the failure and says when it cut.
 */
const ERROR_MAX = 2000;

const truncate = (value: string): string =>
	value.length <= ERROR_MAX
		? value
		: `${value.slice(0, ERROR_MAX)}\n… truncated, see the run bundle`;

/**
 * `prepare` emits lowercase transition tokens; older fixtures use
 * CHANGED_FAILURE. Accept both — matching only one is how the baseline warning
 * below came to never render on real data.
 */
const CHANGED = new Set(['changed', 'changed_failure']);

const isChangedFailure = (transition: string): boolean =>
	CHANGED.has(transition.trim().toLowerCase());

/** The per-row detail panel: everything the table had to truncate. */
const RowDetail: React.FC<Props> = ({css, meta, row}) => {
	const items: Array<[string, React.ReactNode]> = [];

	items.push(['Status', <Status a={row.statusA} b={row.statusB} />]);

	if (row.transition) {
		items.push(['Transition', <code>{row.transition}</code>]);
	}

	// A changed failure was already failing on the baseline. Presenting it as a
	// fresh regression is the single most misleading thing this view could do,
	// so it is called out.
	//
	// The artifact goes further and shows both error texts side by side. The CX
	// cannot: `baselineErrorMessage` is not stored on TriageResult, so there is
	// nothing here to compare against. The note therefore explains WHY the row
	// was triaged rather than pointing at the run bundle — that bundle lives on
	// the machine that ran `prepare` and is not reachable from Testray, so
	// naming it just told the reader to go somewhere they cannot go.
	if (isChangedFailure(row.transition)) {
		items.push([
			'Note',
			<strong>
				Already failing on the baseline — a changed failure, not a new
				one. It was triaged because the error signature changed, not
				because the test started failing.
			</strong>,
		]);
	}

	if (row.errorMessage) {
		items.push([
			'Error',
			<pre className="error">{truncate(row.errorMessage)}</pre>,
		]);
	}

	items.push([
		'Culprit file',
		row.culpritFile ? <code>{row.culpritFile}</code> : '—',
	]);

	if (row.culpritCommits) {
		items.push(['Changed by', row.culpritCommits]);
	}

	if (row.specificChange) {
		items.push(['Specific change', row.specificChange]);
	}

	items.push(['Reasoning', row.reason || '—']);
	items.push(['Ticket already linked', row.linkedIssues || '—']);
	items.push(['Cluster key', <code>{row.clusterKey}</code>]);

	if (row.caseResultId !== undefined) {
		const url = meta.caseURL(row.caseResultId);

		items.push([
			'Case result id',
			url ? (
				<a href={url} rel="noopener" target="_blank">
					<code>{row.caseResultId}</code>
				</a>
			) : (
				<code>{row.caseResultId}</code>
			),
		]);
	}

	return (
		<tr className={`case-detail ${css}`}>
			<td colSpan={11}>
				<div className="case-detail-inner">
					<dl>
						{items.map(([label, value], index) => (
							<Fragment key={`${label}-${index}`}>
								<dt>{label}</dt>

								<dd>{value}</dd>
							</Fragment>
						))}
					</dl>
				</div>
			</td>
		</tr>
	);
};

export default RowDetail;
