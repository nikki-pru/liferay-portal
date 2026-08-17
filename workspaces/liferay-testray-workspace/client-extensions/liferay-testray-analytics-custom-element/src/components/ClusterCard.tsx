/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {Cluster} from '~/types';
import {verdictRank} from '~/util/verdict';
import VerdictPill from './VerdictPill';

type Props = {
	cluster: Cluster;
};

/**
 * One cluster, its members expandable underneath.
 *
 * Open by default only when the cluster is both multi-member and severe: a
 * cluster of one is just a row, and a long tail of expanded NEEDSREVIEW cards
 * buries the finding. Same rule as `report.py::_cluster_cards`.
 */
const ClusterCard: React.FC<Props> = ({cluster}) => {
	const {culpritFile, members, worstVerdict} = cluster;

	const open = members.length > 1 && verdictRank(worstVerdict) <= 1;

	return (
		<details className="triage-card" open={open}>
			<summary>
				<VerdictPill verdict={worstVerdict} />

				<span className="triage-sig" title={members[0]?.reason}>
					{members[0]?.reason || '(no reasoning recorded)'}
				</span>

				<span className="triage-count">
					{members.length} failure{members.length === 1 ? '' : 's'}
				</span>
			</summary>

			{culpritFile && (
				<div className="triage-culprit">
					<code>{culpritFile}</code>
				</div>
			)}

			<table>
				<thead>
					<tr>
						<th>Case Result</th>

						<th>Verdict</th>

						<th>Confidence</th>

						<th>Culprit File</th>

						<th>Reasoning</th>
					</tr>
				</thead>

				<tbody>
					{members.map((member) => (
						<tr key={member.id}>
							<td>
								{member.r_caseResultToTriageResults_c_caseResultId ??
									'—'}
							</td>

							<td>
								<VerdictPill
									verdict={member.classification?.key}
								/>
							</td>

							<td>{member.confidence?.name ?? '—'}</td>

							<td>
								<code>{member.culpritFile ?? '—'}</code>
							</td>

							<td>{member.reason ?? '—'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</details>
	);
};

export default ClusterCard;
