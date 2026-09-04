/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import {
	NEVER_RAN_FILTER,
	buildResultsURL,
	shardFailureFilter,
} from '~/util/testray';

type Props = {
	batchComponentId?: number;
	buildId?: number | string;
	neverRanCount?: number;
	projectId?: number;
	routineId?: number;
	shardFailureCount?: number;
};

/**
 * What this build contains that the table does not.
 *
 * Sits under the table, where `report.py` puts its batch and pre-existing
 * sections — these rows are context for the verdicts, not peers of them, and
 * in the totals bar they competed with counts a reader acts on.
 *
 * Counts only, no rows: none of this is stored as `TriageResult`, because a
 * never-ran case is a coverage fact rather than a verdict and writing it would
 * put conclusions in Testray that no classifier reached. Testray already holds
 * the detail, so the count is the awareness and the link is the way in.
 *
 * This replaces a "Not written" pill that reported the same rows as a single
 * opaque number — on one build it read "200", which is true, unhelpful, and
 * indistinguishable from something being broken.
 */
const NotAnalysed: React.FC<Props> = ({
	batchComponentId,
	buildId,
	neverRanCount,
	projectId,
	routineId,
	shardFailureCount,
}) => {
	// Three async lookups feed the route; until all resolve the link would
	// point at /project/undefined/… , which reads as broken rather than
	// pending.
	const ready =
		projectId !== undefined &&
		routineId !== undefined &&
		buildId !== undefined;

	if (!ready || (!neverRanCount && !shardFailureCount)) {
		return null;
	}

	return (
		<section className="not-analysed">
			<h2>Not analysed</h2>

			<p>
				In this build but not in the table above. Neither is stored as a
				triage result — they are facts about the build, which Testray
				already holds.
			</p>

			<div className="not-analysed-items">
				{neverRanCount ? (
					<a
						href={buildResultsURL(
							projectId!,
							routineId!,
							buildId!,
							NEVER_RAN_FILTER
						)}
						rel="noreferrer"
						target="_blank"
					>
						<strong>{neverRanCount.toLocaleString()}</strong> never ran
						<span>
							produced no result on either side — a coverage gap,
							not a failure
						</span>
					</a>
				) : null}

				{batchComponentId && shardFailureCount ? (
					<a
						href={buildResultsURL(
							projectId!,
							routineId!,
							buildId!,
							shardFailureFilter(batchComponentId)
						)}
						rel="noreferrer"
						target="_blank"
					>
						<strong>{shardFailureCount.toLocaleString()}</strong> shard
						failures
						<span>
							keyed by axis and shard, so no single test can be
							blamed — but the error inside can still be a real
							defect
						</span>
					</a>
				) : null}
			</div>
		</section>
	);
};

export default NotAnalysed;
