/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import useSWR from 'swr';

import {fetcher} from './fetcher';

/**
 * Who may START a triage.
 *
 * Testray's own custom element answers this from `TestrayContext`, which holds
 * the account it fetched for the avatar. Nothing is shared between two custom
 * elements — separate bundles, separate React trees — so this CX asks the same
 * question of the same endpoint rather than trying to reach into that context.
 *
 * The authority is not this hook. It is ADD_OBJECT_ENTRY on TriageRun, granted
 * to Testray Administrator alone by the analytics site initializer, which the
 * browser cannot talk its way past: every write here goes out as the session
 * user. This only decides what is worth offering.
 *
 * Reading a report is deliberately NOT gated — the whole point of writing
 * verdicts back into Testray is that the team can read them.
 */

/** Matches TestrayRole.TESTRAY_ADMINISTRATOR in the Testray custom element. */
const TRIAGE_ROLE = 'Testray Administrator';

type MyUserAccount = {
	roleBriefs?: Array<{name?: string}>;
};

export function useCanTriage(): boolean {
	// A plain SWR key, so the answer is fetched once per page and shared by
	// every caller. `keepPreviousData` is pointless here and revalidation is
	// noise: a role does not change while someone reads a report.
	const {data} = useSWR<MyUserAccount>(
		'/o/headless-admin-user/v1.0/my-user-account',
		fetcher,
		{revalidateOnFocus: false}
	);

	// Undefined until the request lands, and undefined again if it fails — so
	// this fails CLOSED. The alternative offers a Run Triage button on every
	// first render, to everyone, and takes it away a moment later.
	return !!data?.roleBriefs?.some((role) => role.name === TRIAGE_ROLE);
}
