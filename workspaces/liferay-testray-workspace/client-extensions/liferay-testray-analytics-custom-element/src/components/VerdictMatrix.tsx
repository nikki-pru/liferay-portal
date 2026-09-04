/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import {verdictClass} from '~/util/verdict';
import {Verdict} from './Cells';

/**
 * The standing rubric, as a grid. Ported from `report.py::_verdict_matrix`.
 *
 * Two questions settle every verdict — how well the cause is pinned (E), and
 * what the diff shows the change to be (D) — so the rubric is a grid rather
 * than prose. Confidence is deliberately NOT an axis: the rubric assigns it
 * FROM the two questions, so putting it on a third axis would let a reader
 * pick a confidence and read off a verdict, which is backwards.
 *
 * Transcribed from the rubric in `prepare.py`'s prompt text, via `report.py`.
 * That prompt is the authority: it is what the classifier actually reads, and
 * the same rule as `util/verdict.ts` applies — where the two renderers
 * disagree, the report is right and this is stale.
 */

const COLS: Array<[string, string, string]> = [
	['E1', 'Nothing named', 'no candidate'],
	['E2', 'Transitive only', 'no concrete file'],
	['E3', 'Two or more', 'several candidates'],
	['E4', 'Exactly one', 'one, unverified'],
	['E5', 'Verified', 'hunk proven'],
];

const ROWS: Array<[string, string, string]> = [
	['D1', "Can't tell which", 'defect or deliberate?'],
	['D2', 'Intentional and correct', 'the tests lag behind'],
	['D3', 'A genuine defect', 'production is wrong'],
];

/** (row, col) -> [verdict, confidence, note]. Notes only where the axes do
 *  not already say it — four cells out of fifteen. */
const CELLS: Record<string, [string, string, string]> = {
	'D1:E1': ['NEEDS_REVIEW', 'low', ''],
	'D1:E2': ['NEEDS_REVIEW', 'low', ''],
	'D1:E3': ['NEEDS_REVIEW', 'any', ''],
	'D1:E4': [
		'POSSIBLE_BUG',
		'medium',
		'Say “cannot tell intentional vs regression”.',
	],
	'D1:E5': ['POSSIBLE_BUG', 'medium', ''],
	'D2:E1': ['NEEDS_REVIEW', 'low', ''],
	'D2:E2': ['NEEDS_REVIEW', 'low', ''],
	'D2:E3': [
		'NEEDS_REVIEW',
		'any',
		'Rare: intent belongs to a specific change.',
	],
	'D2:E4': ['TEST_FIX', 'medium', ''],
	'D2:E5': ['TEST_FIX', 'high', ''],
	'D3:E1': ['NEEDS_REVIEW', 'low', ''],
	'D3:E2': ['NEEDS_REVIEW', 'low', ''],
	'D3:E3': [
		'POSSIBLE_BUG',
		'medium',
		'A 500 with three suspects is still probably a bug.',
	],
	'D3:E4': ['POSSIBLE_BUG', 'medium', ''],
	'D3:E5': ['BUG', 'high', ''],
};

/** Verdicts that never reach the grid, and why. */
const NOTES: Array<[string, string]> = [
	[
		'FALSE_POSITIVE',
		'Checked before the grid and it ends the decision — clearly environmental or unrelated. May be high confidence.',
	],
	[
		'NOT_ATTRIBUTABLE',
		'Display label only: cell D1×E1 at low confidence. Named candidates keep it NEEDS_REVIEW.',
	],
	[
		'DID_NOT_RUN',
		'Never reaches the grid. Nothing was analysed, so someone should check why it did not run — a real failure can hide behind one.',
	],
	[
		'ENV_FAILURE',
		'Never reaches the grid either: a known environment pattern. Infrastructure, not the product — but still glance at the tests. A product failure can match an env pattern by coincidence, and an env problem that keeps recurring is a problem of its own.',
	],
];

const VerdictMatrix: React.FC = () => (
	<details className="verdict-rubric" id="verdict-rubric">
		<summary>
			<strong>How a verdict is decided</strong>{' '}
			<span className="hint">
				Two questions settle it, and confidence follows from them.
			</span>
		</summary>

		<div className="mx-scroll">
			<table className="mx">
				<thead>
					<tr>
						<th className="mx-corner" rowSpan={2}>
							<span className="mx-axis-name">D · Diff</span>
							<span className="mx-axis-q">
								What does the diff show the change to be?
							</span>
						</th>
						<th className="mx-axis-band" colSpan={COLS.length}>
							<span className="mx-axis-name">E · Evidence</span>
							<span className="mx-axis-q">
								How well is the cause pinned down?
							</span>
						</th>
					</tr>
					<tr>
						{COLS.map(([code, title, desc]) => (
							<th key={code}>
								<span className="mx-axis">{code}</span>
								{title}
								<span className="mx-desc">{desc}</span>
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{ROWS.map(([rcode, rtitle, rdesc]) => (
						<tr key={rcode}>
							<th>
								<span className="mx-axis">{rcode}</span>
								{rtitle}
								<span className="mx-desc">{rdesc}</span>
							</th>

							{COLS.map(([ccode]) => {
								const [verdict, confidence, note] =
									CELLS[`${rcode}:${ccode}`];

								return (
									<td
										className={`mx-${verdictClass(verdict)}`}
										key={ccode}
									>
										<Verdict verdict={verdict} />
										<span className="mx-conf">{confidence}</span>
										{note ? (
											<span className="mx-note">{note}</span>
										) : null}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>

		<p className="mx-field-rule">
			<code>culprit_file</code> — BUG must name one. POSSIBLE_BUG names one
			when there is exactly one, otherwise stays null with the candidates
			listed in <code>specific_change</code>. TEST_FIX never names the
			production file: that would mislabel a correct change as a defect.
		</p>

		<div className="mx-cards">
			{NOTES.map(([verdict, text]) => (
				<div className="mx-card" key={verdict}>
					<Verdict verdict={verdict} />
					<span className="mx-card-text">{text}</span>
				</div>
			))}
		</div>
	</details>
);

export default VerdictMatrix;
