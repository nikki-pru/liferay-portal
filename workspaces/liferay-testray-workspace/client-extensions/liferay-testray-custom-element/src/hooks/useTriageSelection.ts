/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useCallback, useEffect, useState} from 'react';

/**
 * The baseline/target pair a user has picked from the build list.
 *
 * Mirrors the existing "Select Build A / B" affordance rather than adding a new
 * one — same right-click menu, same toast — so triage needs no new interaction
 * vocabulary.
 *
 * Kept OUT of `TestrayContext` on purpose. That context is Testray's own shared
 * state, and adding triage fields plus reducer cases to it would put triage
 * concepts in Testray core, which is what the additive principle
 * (ARCHITECTURE §1) exists to avoid. Autofill and compare-runs live there
 * because they *are* Testray features; this one is ours, so it carries its own
 * store and the Testray-side diff stays link-shaped.
 *
 * Persisted to localStorage rather than held in memory because the two halves
 * of the selection are separate interactions — pick a baseline, scroll, page,
 * maybe reload, pick a target — and an in-memory pair silently empties under
 * any of that. `storage` events keep two tabs and the sibling components in
 * this one agreeing.
 */

const KEY = '@testray-analytics/triage-selection';

export type TriageSelection = {
	baselineBuildId?: number;
	targetBuildId?: number;
};

const read = (): TriageSelection => {
	try {
		const raw = window.localStorage.getItem(KEY);

		return raw ? (JSON.parse(raw) as TriageSelection) : {};
	}
	catch {
		// A corrupt or unavailable store is not worth failing a build list for.

		return {};
	}
};

const write = (selection: TriageSelection) => {
	try {
		window.localStorage.setItem(KEY, JSON.stringify(selection));
	}
	catch {
		// Private-mode or quota. The selection is then in-memory only, which
		// still works for a pick-pick-run done on one page.
	}

	// localStorage does not fire `storage` in the tab that wrote it, so the
	// column and the menu in THIS tab would not see each other's writes.

	window.dispatchEvent(new CustomEvent(KEY));
};

export default function useTriageSelection() {
	const [selection, setSelection] = useState<TriageSelection>(read);

	useEffect(() => {
		const sync = () => setSelection(read());

		window.addEventListener(KEY, sync);
		window.addEventListener('storage', sync);

		return () => {
			window.removeEventListener(KEY, sync);
			window.removeEventListener('storage', sync);
		};
	}, []);

	const setBaseline = useCallback((buildId: number) => {
		const next = {...read(), baselineBuildId: buildId};

		// Selecting the same build for both sides yields an empty diff, so the
		// other side yields rather than producing a run with nothing in it.

		if (next.targetBuildId === buildId) {
			delete next.targetBuildId;
		}

		write(next);
	}, []);

	const setTarget = useCallback((buildId: number) => {
		const next = {...read(), targetBuildId: buildId};

		if (next.baselineBuildId === buildId) {
			delete next.baselineBuildId;
		}

		write(next);
	}, []);

	const clear = useCallback(() => write({}), []);

	// Per-side, because the common correction is "wrong baseline", not "start
	// over" — and re-picking the other side to reset it would be a puzzle.

	const clearBaseline = useCallback(() => {
		const next = {...read()};

		delete next.baselineBuildId;

		write(next);
	}, []);

	const clearTarget = useCallback(() => {
		const next = {...read()};

		delete next.targetBuildId;

		write(next);
	}, []);

	return {
		clear,
		clearBaseline,
		clearTarget,
		selection,
		setBaseline,
		setTarget,
	};
}
