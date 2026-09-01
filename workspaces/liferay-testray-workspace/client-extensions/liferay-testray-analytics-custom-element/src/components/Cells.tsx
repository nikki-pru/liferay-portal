/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {BASE_URL} from '~/util/jira';
import {verdictClass} from '~/util/verdict';

/** Ticket keys the classifier names in `specificChange`. Mirrors report._TICKET_RE. */
const TICKET_RE = /\b((?:LPD|LPP|LPS)-\d+)\b/g;

/**
 * The Suspicious cause cell: the culprit file when the classifier committed to
 * one, otherwise the candidate tickets it named instead.
 *
 * The rubric tells the classifier to leave `culpritFile` NULL and list every
 * candidate in `specificChange` whenever two or more changes could explain a
 * failure ("NEEDS_REVIEW - two or more candidate causes"). Without this the
 * actionable half of that answer never reaches the column: `culpritCommits` is
 * derived from the FILE, so a null culprit yields no commits either and the
 * cell rendered "-" for a row the classifier did have an opinion about.
 *
 * `culpritFile` itself is untouched - it is a stored verdict field feeding
 * defect-attribution training data and the cluster key, so this is a rendering
 * fallback, not a repurposing of the field.
 */
export const CauseTickets: React.FC<{specificChange?: string}> = ({
	specificChange,
}) => {
	const keys = [...new Set(specificChange?.match(TICKET_RE) ?? [])];

	if (!keys.length) {
		return null;
	}

	return (
		<div className="cause-tickets">
			{keys.map((key) => (
				<a
					className="cause-ticket"
					href={`${BASE_URL}/browse/${key}`}
					key={key}
					rel="noopener"
					target="_blank"
				>
					{key}
				</a>
			))}
		</div>
	);
};

/** The stored verdict, or an em dash when nothing classified the row. */
export const Verdict: React.FC<{verdict?: string}> = ({verdict}) =>
	verdict ? (
		<span className={`verdict ${verdictClass(verdict)}`}>{verdict}</span>
	) : (
		<span className="conf">&mdash;</span>
	);

/**
 * Issues already linked to the case result in Testray.
 *
 * Each key is rendered in its own non-wrapping span. `word-break: normal` is
 * not enough on its own: normal wrapping still treats the hyphen in
 * "LPD-99999" as a break opportunity, so in a narrow column the key split
 * across two lines as "LPD-" / "99999". Wrapping is allowed BETWEEN keys.
 *
 * The source is Testray's raw `caseResult.issues` string, whose separator is
 * not guaranteed, so it is split on commas and whitespace alike — a value that
 * matches neither simply stays one token and still renders.
 *
 * Shared by cluster headers and member rows so the two cannot disagree. A
 * cluster whose members cite different issues rolls up to "N values" the same
 * way Team and Component do; listing them all would overflow a column this
 * narrow.
 */
export const Tickets: React.FC<{cluster?: boolean; values: string[]}> = ({
	cluster,
	values,
}) => {
	const distinct = [...new Set(values.filter(Boolean))];

	if (!distinct.length) {
		return (
			<td className={`col-ticket${cluster ? ' cluster-cell' : ''}`}>
				{/* A cluster header leaves shared-but-absent cells blank; a
				    member row says "nothing linked" explicitly. */}
				{cluster ? null : <span className="ticket-none">&mdash;</span>}
			</td>
		);
	}

	if (distinct.length > 1) {
		return (
			<td className={`col-ticket${cluster ? ' cluster-cell' : ''}`}>
				<span
					className="cluster-culprit-none"
					title={distinct.slice().sort().join(' · ')}
				>
					{distinct.length} values
				</span>
			</td>
		);
	}

	return (
		<td className={`col-ticket${cluster ? ' cluster-cell' : ''}`}>
			{distinct[0]
				.split(/[,\s]+/)
				.filter(Boolean)
				.map((key, index) => (
					<span className="ticket-key" key={`${key}-${index}`}>
						{key}
					</span>
				))}
		</td>
	);
};

/** Absent confidence reads as `auto` — the pipeline decided without reasoning. */
export const Confidence: React.FC<{confidence?: string}> = ({confidence}) => {
	const value = (confidence ?? '').toLowerCase();

	return value ? (
		<span className={`conf ${value}`}>{value}</span>
	) : (
		<span className="conf">auto</span>
	);
};

/** `PASSED → FAILED`. One status alone renders alone rather than half an arrow. */
export const Status: React.FC<{a?: string; b?: string}> = ({a, b}) => {
	if (!a && !b) {
		return null;
	}

	if (!a || !b) {
		const one = (b || a)!;

		return (
			<span className="status">
				<span className={one.toLowerCase()}>{one}</span>
			</span>
		);
	}

	return (
		<span className="status">
			<span className={a.toLowerCase()}>{a}</span>{' '}
			<span className="arrow">&rarr;</span>{' '}
			<span className={b.toLowerCase()}>{b}</span>
		</span>
	);
};
