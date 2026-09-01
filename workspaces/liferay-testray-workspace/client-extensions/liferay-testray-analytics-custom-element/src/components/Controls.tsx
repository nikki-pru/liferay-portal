/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {GroupMode, Row} from '~/types';
import {GROUP_MODES, distinct} from '~/util/rows';

export type Filters = {
	component: string;
	confidence: string;
	search: string;
	team: string;
	transition: string;
	verdict: string;
};

export const EMPTY_FILTERS: Filters = {
	component: '',
	confidence: '',
	search: '',
	team: '',
	transition: '',
	verdict: '',
};

type Props = {
	filters: Filters;
	mode: GroupMode;
	onExpandAll: (expand: boolean) => void;
	onFilters: (filters: Filters) => void;
	onMode: (mode: GroupMode) => void;
	rows: Row[];
};

/**
 * Label and select as SIBLINGS, not nested.
 *
 * `.filters select { flex: 1 1 140px }` only sizes the select while its parent
 * is the flex row; wrapping it in the label made it a child of a non-flex box,
 * so five selects held the controls column open and pushed the matrix onto its
 * own line.
 */
const Select: React.FC<{
	id: string;
	label: string;
	onChange: (value: string) => void;
	/** Width class, tuned to the vocabulary the control holds. */
	size?: 'lg' | 'md' | 'sm';
	title?: string;
	value: string;
	values: string[];
}> = ({id, label, onChange, size = 'md', title, value, values}) => (
	// The pair is ONE flex item. `.filters-row` wraps, and while the label and
	// the select are two separate children the break can land between them --
	// which stranded "Transition:" on one line with its dropdown on the next.
	// The earlier attempt wrapped them in the <label>, which is not a flex
	// container, so the selects stopped shrinking; a flex span fixes both.
	// The title sits on the wrapper so it fires over the label AND the select.
	<span className={`filter-field ff-${size}`} title={title}>
		<label htmlFor={id}>{label}:</label>

		<select
			id={id}
			onChange={(event) => onChange(event.target.value)}
			value={value}
		>
			<option value="">All</option>

			{values.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	</span>
);

/**
 * Group-by, filters and search.
 *
 * The filter options come from the loaded rows rather than a fixed list, so a
 * select never offers a value that would return an empty table.
 */
const Controls: React.FC<Props> = ({
	filters,
	mode,
	onExpandAll,
	onFilters,
	onMode,
	rows,
}) => {
	const set = (key: keyof Filters) => (value: string) =>
		onFilters({...filters, [key]: value});

	return (
		<>
			<div className="viewbar">
				<span className="viewbar-group">
					<span
						className="viewbar-label"
						title="Re-cuts the same rows into different groups. Nothing is re-classified."
					>
						Group by
					</span>

					<select
						onChange={(event) =>
							onMode(event.target.value as GroupMode)
						}
						value={mode}
					>
						{GROUP_MODES.map((option) => (
							<option key={option.mode} value={option.mode}>
								{option.label}
							</option>
						))}
					</select>
				</span>

				<span className="viewbar-group">
					<button
						className="cluster-btn"
						onClick={() => onExpandAll(true)}
						type="button"
					>
						Expand all
					</button>

					<button
						className="cluster-btn"
						onClick={() => onExpandAll(false)}
						type="button"
					>
						Collapse all
					</button>
				</span>

				<span className="viewbar-note">
					Clusters are ordered worst verdict first, then by size.
				</span>
			</div>

			<div className="filters">
				<div className="filters-row">
					<label htmlFor="triage-search">Search:</label>

					<input
						id="triage-search"
						onChange={(event) =>
							set('search')(event.target.value)
						}
						placeholder="test, reasoning, culprit…"
						type="search"
						value={filters.search}
					/>

					<Select
						id="triage-team"
						label="Team"
						onChange={set('team')}
						size="lg"
						value={filters.team}
						values={distinct(rows, 'team')}
					/>

					<Select
						id="triage-component"
						label="Component"
						onChange={set('component')}
						size="lg"
						value={filters.component}
						values={distinct(rows, 'component')}
					/>
				</div>

				<div className="filters-row">
					<Select
						id="triage-verdict"
						label="Verdict"
						onChange={set('verdict')}
						title="Show only rows the classifier gave this verdict."
						value={filters.verdict}
						values={distinct(rows, 'displayVerdict')}
					/>

					<Select
						id="triage-confidence"
						label="Confidence"
						onChange={set('confidence')}
						size="sm"
						title={
							"Show only rows at this confidence. 'auto' means " +
							'pre-classified, never sent to the model.'
						}
						value={filters.confidence}
						values={distinct(rows, 'confidence')}
					/>

					<Select
						id="triage-transition"
						label="Transition"
						onChange={set('transition')}
						value={filters.transition}
						values={distinct(rows, 'transition')}
					/>

					<button
						className="clear-filters"
						onClick={() => onFilters(EMPTY_FILTERS)}
						type="button"
					>
						Clear
					</button>
				</div>
			</div>
		</>
	);
};

/** Apply the filter bar to the rows. Search matches the text columns only. */
export function applyFilters(rows: Row[], filters: Filters): Row[] {
	const needle = filters.search.trim().toLowerCase();

	return rows.filter((row) => {
		if (filters.team && row.team !== filters.team) {
			return false;
		}

		if (filters.component && row.component !== filters.component) {
			return false;
		}

		if (filters.verdict && row.displayVerdict !== filters.verdict) {
			return false;
		}

		if (filters.confidence && row.confidence !== filters.confidence) {
			return false;
		}

		if (filters.transition && row.transition !== filters.transition) {
			return false;
		}

		if (
			needle &&
			![row.caseName, row.reason, row.culpritFile, row.errorMessage].some(
				(value) => value.toLowerCase().includes(needle)
			)
		) {
			return false;
		}

		return true;
	});
}

export default Controls;
