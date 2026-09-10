/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {rollup, verdictRank} from './verdict';

import type {Cluster, Group, GroupMode, Row} from '~/types';

/** The columns a cluster collapses when every member agrees. Mirrors `report.py`. */
export const SHARED_COLUMNS = [
	'reason',
	'culpritFile',
	'displayVerdict',
	'confidence',

	// Ranked candidate commits. Worth collapsing more than the others: a
	// 47-row cluster repeated the same chips 47 times, and each chip is a
	// ticket, a commit and an author rather than a single word.

	'culpritCommits',
] as const;

export const GROUP_MODES: Array<{label: string; mode: GroupMode}> = [
	{label: 'error signature (cluster)', mode: 'cluster'},
	{label: 'component', mode: 'component'},
	{label: 'team', mode: 'team'},
	{label: 'verdict only', mode: 'verdict'},
];

/**
 * Severity first, then size, then label.
 *
 * A 30-member NEEDS_REVIEW cluster still sorts below a single BUG, because the
 * BUG is the thing to act on. Every group mode uses this rule so the eye learns
 * one ordering.
 */
const bySeverityThenSize = (
	a: {label: string; rows: Row[]; worstVerdict: string},
	b: {label: string; rows: Row[]; worstVerdict: string}
) =>
	verdictRank(a.worstVerdict) - verdictRank(b.worstVerdict) ||
	b.rows.length - a.rows.length ||
	a.label.localeCompare(b.label);

/**
 * Group rows by clusterKey, in display order, with shared columns precomputed.
 *
 * Single pass on purpose. The CLI's first cut recomputed the cluster key inside
 * a per-row predicate, so the signature normaliser ran roughly
 * clusters x columns x rows times — ~150,000 regex passes on a 449-row run,
 * which pinned a core for minutes. It looked fine at 170 rows, which is why it
 * shipped. Do not reintroduce a per-row lookup inside a loop here.
 */
export function toClusters(rows: Row[]): Cluster[] {
	const buckets = new Map<string, Row[]>();

	for (const row of rows) {
		const bucket = buckets.get(row.clusterKey);

		if (bucket) {
			bucket.push(row);
		}
		else {
			buckets.set(row.clusterKey, [row]);
		}
	}

	const clusters = [...buckets].map(([clusterKey, members]) => {
		const shared = new Set<string>();

		for (const column of SHARED_COLUMNS) {
			const distinct = new Set(members.map((row) => row[column]));

			if (distinct.size === 1) {
				shared.add(column);
			}
		}

		return {
			clusterKey,
			number: 0,
			rows: members,
			shared,
			worstVerdict: rollup(members.map((row) => row.displayVerdict)),
		};
	});

	clusters.sort((a, b) =>
		bySeverityThenSize({...a, label: a.clusterKey}, {...b, label: b.clusterKey})
	);

	// Numbered after ordering so the number a member row points at is the one
	// on screen, and stable while regrouping — the deep-link anchors depend on
	// it not moving.

	clusters.forEach((cluster, index) => {
		cluster.number = index + 1;
	});

	return clusters;
}

const groupKey = (row: Row, mode: GroupMode): string => {
	if (mode === 'component') {
		return row.component || '(no component)';
	}

	if (mode === 'team') {
		return row.team || '(no team)';
	}

	if (mode === 'verdict') {
		return row.displayVerdict || '(unclassified)';
	}

	return row.clusterKey;
};

/** Ordered groups for a mode. Cluster mode is the default view. */
export function toGroups(rows: Row[], mode: GroupMode): Group[] {
	const buckets = new Map<string, Row[]>();

	for (const row of rows) {
		const key = groupKey(row, mode);
		const bucket = buckets.get(key);

		if (bucket) {
			bucket.push(row);
		}
		else {
			buckets.set(key, [row]);
		}
	}

	return [...buckets]
		.map(([label, members]) => ({
			label,
			rows: members,
			worstVerdict: rollup(members.map((row) => row.displayVerdict)),
		}))
		.sort(bySeverityThenSize);
}

/** Distinct non-blank values of a column, for the filter selects. */
export const distinct = (rows: Row[], column: keyof Row): string[] =>
	[
		...new Set(
			rows.map((row) => String(row[column] ?? '')).filter(Boolean)
		),
	].sort();
