/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	CELL_NOTE,
	cellClass,
	STATUS_ORDER,
	statusLabel,
} from '~/util/verdict';

type Props = {
	matrix: Record<string, Record<string, number>>;
};

/**
 * The A x B status cross-tab for the whole comparison.
 *
 * Deliberately covers every joined case, not just the triaged ones: the
 * headline counts describe the slice we acted on, and this describes the build.
 * Reading "1038 now passing" next to "793 failed in both" is what makes a
 * triage set of 557 legible.
 */
const StatusMatrix: React.FC<Props> = ({matrix}) => {
	const keys = Object.keys(matrix);

	if (!keys.length) {
		return null;
	}

	const ordered = (values: string[]) => [
		...STATUS_ORDER.filter((status) => values.includes(status)),
		...values.filter((status) => !STATUS_ORDER.includes(status)).sort(),
	];

	const rows = ordered(keys);
	const columns = ordered([
		...new Set(keys.flatMap((key) => Object.keys(matrix[key] ?? {}))),
	]);

	if (!rows.length || !columns.length) {
		return null;
	}

	return (
		<div className="matrix">
			<div className="matrix-title">
				Where A is the previous build, and B is the new build
			</div>

			<table>
				<thead>
					<tr>
						<th />

						{columns.map((column) => (
							<th key={column}>
								B
								<br />
								<span>{statusLabel(column)}</span>
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{rows.map((row) => (
						<tr key={row}>
							<th>
								A
								<br />
								<span>{statusLabel(row)}</span>
							</th>

							{columns.map((column) => {
								const n = matrix[row]?.[column] ?? 0;

								const cls = cellClass(row, column);

								const note = CELL_NOTE[`${row}|${column}`];

								return n ? (
									<td className={cls} key={column}>
										<span className="cell-n">
											{n.toLocaleString()}
										</span>

										{note ? (
											<span className="cell-note">
												{note}
											</span>
										) : null}
									</td>
								) : (
									<td className="zero" key={column} />
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default StatusMatrix;
