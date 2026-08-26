/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Fragment, useState} from 'react';

import type {Cluster, Group, GroupMode, Row} from '~/types';
import ActionsMenu, {type Action} from '~/components/ActionsMenu';
import {type ReportMeta, jiraDraftURL} from '~/util/jira';
import {confidenceRank, verdictClass, verdictRank} from '~/util/verdict';
import {Confidence, Status, Tickets, Verdict} from './Cells';
import RowDetail from './RowDetail';

export type SortKey =
	| 'caseName'
	| 'team'
	| 'component'
	| 'linkedIssues'
	| 'displayVerdict'
	| 'confidence'
	| 'culpritFile'
	| 'reason'
	| '';

type Props = {
	clustersByKey: Map<string, Cluster>;
	/** Group labels currently unfolded. Empty is the default — see below. */
	expanded: Set<string>;
	/**
	 * True while any filter or search narrows the table. A hit must show even
	 * inside a folded cluster, otherwise searching a collapsed report returns
	 * nothing and reads as "no matches".
	 */
	filtering: boolean;
	groups: Group[];
	meta: ReportMeta;
	mode: GroupMode;
	onSort: (key: SortKey) => void;
	onToggleGroup: (label: string) => void;
	sort: {ascending: boolean; key: SortKey};
};

/**
 * The `col-*` class is what carries the column's width — `th.col-test` sets a
 * 220px minimum, `th.col-comp` 130px and so on. A header rendered without it
 * gets no width rule at all, which cramps Test and Team down to their content
 * while Reasoning takes the slack.
 */
const COLUMNS: Array<{
	cls: string;
	key: SortKey;
	label: string;
	title?: string;
}> = [
	{cls: 'col-test', key: 'caseName', label: 'Test'},
	{cls: 'col-team', key: 'team', label: 'Team'},
	{cls: 'col-comp', key: 'component', label: 'Component'},
	{
		cls: 'col-status',
		key: '',
		label: 'Status',
		title: 'Status on the baseline → status on the target',
	},
	{cls: 'col-verdict', key: 'displayVerdict', label: 'Verdict'},
	{cls: 'col-confidence', key: 'confidence', label: 'Confidence'},
	{cls: 'col-culprit', key: 'culpritFile', label: 'Culprit'},
	{cls: 'col-reasoning', key: 'reason', label: 'Reasoning'},
	{
		cls: 'col-ticket',
		key: 'linkedIssues',
		label: 'Ticket',
		title: 'Issues already linked to this case result in Testray',
	},
	{
		cls: 'col-jira',
		key: '',
		label: 'Actions',
		title: 'What you can do about this row — file it, correct it, or ask for a test fix',
	},
];

/**
 * The two actions that are not wired yet, declared once so a cluster and a
 * member row cannot drift into advertising different things.
 */
const PENDING_ACTIONS: Action[] = [
	{
		label: 'Change verdict',
		pending: 'not wired yet',
		title:
			'Correct the AI verdict, link an issue and leave a comment — the ' +
			'same shape as Edit on a Testray case result. Changing a cluster ' +
			'will apply to every test in it; changing one row stays on that row',
	},
	{
		label: 'Send Test Fix PR',
		pending: 'not wired yet',
		title:
			'Triggers the /test-fix skill and opens a pull request for the ' +
			'team to review — nothing is merged automatically',
	},
];

/** Alphabetical: Change verdict, Create Jira Ticket, Send Test Fix PR. */
const actionsFor = (jiraHref: string): Action[] => [
	PENDING_ACTIONS[0],
	{
		href: jiraHref,
		label: 'Create Jira Ticket',
		title:
			'Opens a prefilled Jira draft in a new tab for you to confirm — ' +
			'nothing is filed automatically',
	},
	PENDING_ACTIONS[1],
];

/**
 * Explicit ranks for the two ordinal columns.
 *
 * Sorting them as text puts DID_NOT_RUN before BUG — alphabetical, and the
 * exact opposite of useful.
 */
function compare(a: Row, b: Row, key: Exclude<SortKey, ''>): number {
	if (key === 'displayVerdict') {
		return verdictRank(a.displayVerdict) - verdictRank(b.displayVerdict);
	}

	if (key === 'confidence') {
		return confidenceRank(a.confidence) - confidenceRank(b.confidence);
	}

	return String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
}

/** A cluster's shared value, shown once on the header and pointed at below. */
const Pointer: React.FC<{anchor: string; title: string}> = ({anchor, title}) => (
	<span className="same-as-cluster" title={title}>
		<a href={`#${anchor}`}>&uarr;</a>
	</span>
);

const TriageTable: React.FC<Props> = ({
	clustersByKey,
	expanded,
	filtering,
	groups,
	meta,
	mode,
	onSort,
	onToggleGroup,
	sort,
}) => {
	const [open, setOpen] = useState<Set<number>>(new Set());

	const toggle = (id: number) =>
		setOpen((current) => {
			const next = new Set(current);

			if (!next.delete(id)) {
				next.add(id);
			}

			return next;
		});

	const sortRows = (rows: Row[]): Row[] => {
		// Captured so the empty-key guard narrows inside the comparator.
		const key = sort.key;

		if (!key) {
			return rows;
		}

		return [...rows].sort(
			(a, b) => compare(a, b, key) * (sort.ascending ? 1 : -1)
		);
	};

	// View contract rule 6: a sort must reorder the GROUPS, not only the members
	// inside them. Sorting within groups alone leaves the group order fixed, so
	// clicking a header looks like it did nothing. Each group is ranked by the
	// member that sorts first within it.
	const prepared = groups.map((group) => ({
		group,
		rows: sortRows(group.rows),
	}));

	if (sort.key) {
		const key = sort.key;

		prepared.sort(
			(a, b) =>
				compare(a.rows[0], b.rows[0], key) * (sort.ascending ? 1 : -1)
		);
	}

	let rowNumber = 0;

	return (
		<table className="per-test-table" data-mode={mode}>
			<thead>
				<tr>
					<th className="col-idx">#</th>

					{COLUMNS.map((column, index) => (
						<th
							className={
								column.key
									? `${column.cls} sortable`
									: column.cls
							}
							key={`${column.label}-${index}`}
							onClick={
								column.key ? () => onSort(column.key) : undefined
							}
							title={column.title}
						>
							{column.label}

							{sort.key && sort.key === column.key ? (
								<span className="sort-arrow">
									{sort.ascending ? ' ▲' : ' ▼'}
								</span>
							) : null}
						</th>
					))}
				</tr>
			</thead>

			{prepared.map(({group, rows}, groupIndex) => {
				const anchor = `grp-${mode}-${groupIndex}`;
				const isOpen = expanded.has(group.label);
				const cluster =
					mode === 'cluster'
						? clustersByKey.get(group.label)
						: undefined;

				const verdict = group.worstVerdict;

				const culprits = [
					...new Set(group.rows.map((row) => row.culpritFile).filter(Boolean)),
				];
				const reasons = [
					...new Set(group.rows.map((row) => row.reason).filter(Boolean)),
				];
				const confidences = group.rows
					.map((row) => row.confidence)
					.filter(Boolean);
				const topConfidence = confidences.length
					? [...confidences].sort(
							(a, b) => confidenceRank(a) - confidenceRank(b)
						)[0]
					: '';

				const breakdown = [
					...confidences.reduce(
						(tally, value) =>
							tally.set(value, (tally.get(value) ?? 0) + 1),
						new Map<string, number>()
					),
				]
					.map(([value, n]) => `${value} ${n}`)
					.join(' · ');

				const commits = [
					...new Set(
						group.rows.map((row) => row.culpritCommits).filter(Boolean)
					),
				];

				const n = group.rows.length;

				return (
					<tbody key={anchor}>
						<tr
							className={`cluster-row ${verdictClass(verdict)}${
								isOpen || filtering ? ' expanded' : ''
							}`}
							id={anchor}
							onClick={() => onToggleGroup(group.label)}
						>
							<td className="col-idx col-cluster-caret">
								{cluster?.number ?? groupIndex + 1}
							</td>

							<td className="col-test cluster-cell">
								<span className="cluster-n">
									{n} test{n === 1 ? '' : 's'}
								</span>
								<br />

								{mode === 'cluster' ? (
									<span className="cluster-key">
										{group.label}
									</span>
								) : (
									<strong>{group.label}</strong>
								)}
							</td>

							<Rollup
								className="col-team"
								values={group.rows.map((row) => row.team)}
							/>

							<Rollup
								className="col-comp"
								values={group.rows.map((row) => row.component)}
							/>

							<td className="col-status cluster-cell" />

							<td className="col-verdict cluster-cell">
								<Verdict verdict={verdict} />
							</td>

							<td
								className="col-confidence cluster-cell"
								title={
									breakdown
										? `Highest confidence in this group. Breakdown: ${breakdown}`
										: undefined
								}
							>
								<Confidence confidence={topConfidence} />
							</td>

							<td className="col-culprit cluster-cell cluster-culprit">
								{culprits.length === 1 ? (
									<>
										<code>{culprits[0]}</code>

										{commits.length === 1 && (
											<div className="culprit-commits">
												{commits[0]}
											</div>
										)}
									</>
								) : culprits.length ? (
									<span
										className="cluster-culprit-none"
										title={culprits.slice().sort().join(' · ')}
									>
										{culprits.length} files
									</span>
								) : (
									<span className="cluster-culprit-none">
										no culprit named
									</span>
								)}
							</td>

							<td className="col-reasoning cluster-cell cluster-reason">
								{reasons.length === 1 ? (
									<strong className="cluster-title">
										{reasons[0]}
									</strong>
								) : reasons.length ? (
									<span className="cluster-reason-mixed">
										{reasons.length} distinct reasons — see
										the member rows
									</span>
								) : (
									<span className="cluster-reason-mixed">
										no reasoning recorded
									</span>
								)}
							</td>

							<Tickets
								cluster
								values={group.rows.map(
									(row) => row.linkedIssues
								)}
							/>

							<td className="col-jira cluster-cell">
								<ActionsMenu
									actions={actionsFor(
										jiraDraftURL(meta, {
											count: n,
											rows: group.rows,
											summaryText:
												reasons.length === 1
													? reasons[0]
													: '',
											verdict,
										})
									)}
									label="Actions for this cluster"
								/>
							</td>
						</tr>

						{(isOpen || filtering ? rows : []).map((row) => {
							rowNumber += 1;

							const css = verdictClass(row.displayVerdict);

							// Collapse a shared cell to a pointer only while
							// the visible group IS the cluster. Under group-by
							// team or component the arrow would point at a
							// cluster that is not on screen, and the header
							// says "N distinct reasons" instead. The CLI has to
							// render both forms and pick with CSS because its
							// group-by changes after render; here the mode is
							// state, so the choice is made directly.
							const collapsed = (column: string) =>
								mode === 'cluster' &&
								cluster !== undefined &&
								cluster.shared.has(column);

							return (
								<Fragment key={row.id}>
									<tr
										className={`case-row in-cluster ${css}`}
										onClick={() => toggle(row.id)}
									>
										<td className="col-idx col-num">
											{rowNumber}
										</td>

										<td className="col-test">
											{meta.caseURL(row.caseResultId) ? (
												<a
													className="test-link"
													href={meta.caseURL(
														row.caseResultId
													)}
													onClick={(event) =>
														event.stopPropagation()
													}
													rel="noopener"
													target="_blank"
													title="Open in Testray"
												>
													{row.caseName}
												</a>
											) : (
												row.caseName
											)}
										</td>

										<td className="col-team">
											{row.team || '—'}
										</td>

										<td className="col-comp">
											{row.component || '—'}
										</td>

										<td className="col-status">
											<Status
												a={row.statusA}
												b={row.statusB}
											/>
										</td>

										<td className="col-verdict">
											{collapsed('displayVerdict') ? (
												<Pointer
													anchor={anchor}
													title={row.displayVerdict}
												/>
											) : (
												<Verdict
													verdict={row.displayVerdict}
												/>
											)}
										</td>

										<td className="col-confidence">
											{collapsed('confidence') ? (
												<Pointer
													anchor={anchor}
													title={row.confidence}
												/>
											) : (
												<Confidence
													confidence={row.confidence}
												/>
											)}
										</td>

										<td className="col-culprit">
											{collapsed('culpritFile') ? (
												<Pointer
													anchor={anchor}
													title={row.culpritFile}
												/>
											) : row.culpritFile ? (
												<>
													<code>
														{row.culpritFile}
													</code>

													{row.culpritCommits && (
														<div className="culprit-commits">
															{row.culpritCommits}
														</div>
													)}
												</>
											) : (
												'—'
											)}
										</td>

										<td className="col-reasoning">
											{collapsed('reason') ? (
												<Pointer
													anchor={anchor}
													title={row.reason}
												/>
											) : (
												row.reason || '—'
											)}
										</td>

										{/* Its own column rather than stacked
										    in the Actions cell: an issue key
										    is text a reader scans down, and
										    at the Actions column's width it
										    broke across two lines. */}
										<Tickets values={[row.linkedIssues]} />

										<td className="col-jira">
											<ActionsMenu
												actions={actionsFor(
													jiraDraftURL(meta, {
														rows: [row],
														summaryText: row.reason,
														verdict:
															row.displayVerdict,
													})
												)}
											/>
										</td>
									</tr>

									{open.has(row.id) && (
										<RowDetail
											css={css}
											meta={meta}
											row={row}
										/>
									)}
								</Fragment>
							);
						})}
					</tbody>
				);
			})}
		</table>
	);
};

/** The group's value for a column when every member agrees, else "N values". */
const Rollup: React.FC<{className: string; values: string[]}> = ({
	className,
	values,
}) => {
	const distinct = [...new Set(values.filter(Boolean))];

	return (
		<td className={`${className} cluster-cell`}>
			{distinct.length === 1 ? (
				distinct[0]
			) : distinct.length ? (
				<span
					className="cluster-culprit-none"
					title={distinct.slice().sort().join(' · ')}
				>
					{distinct.length} values
				</span>
			) : null}
		</td>
	);
};

export default TriageTable;
