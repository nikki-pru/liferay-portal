/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {noveltyBucket, verdictClass} from '~/util/verdict';

/** The stored verdict, or an em dash when nothing classified the row. */
export const Verdict: React.FC<{verdict?: string}> = ({verdict}) =>
	verdict ? (
		<span className={`verdict ${verdictClass(verdict)}`}>{verdict}</span>
	) : (
		<span className="conf">&mdash;</span>
	);

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

/**
 * How often this error signature appeared in the baseline.
 *
 * `data-sort` carries the numeric value zero-padded so the generic sorter,
 * which compares strings, still orders 2 before 10.
 */
export const Novelty: React.FC<{count?: number}> = ({count}) => {
	const {key, label} = noveltyBucket(count);

	if (!key) {
		return <td className="col-baseline" />;
	}

	return (
		<td
			className={`col-baseline ${key}`}
			data-sort={String(count).padStart(7, '0')}
			title={label}
		>
			{count}
		</td>
	);
};
