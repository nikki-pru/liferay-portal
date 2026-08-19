/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * Minimal session-authenticated fetcher.
 *
 * Deliberately much smaller than Testray's own: this CX only ever talks to
 * `/o/c/*` (our three Objects) and reads a few Testray Objects the same way,
 * so there is no API-prefix routing table to maintain. Auth is the portal
 * session plus the CSRF token, exactly as Testray's custom element does it —
 * the OAuth client_credentials app is for the CLI, not the browser.
 */

declare const Liferay: {authToken: string};

const origin = window.location.origin;

export class FetchError extends Error {
	status?: number;
	info?: unknown;
}

export async function request<T>(
	path: string,
	options?: RequestInit
): Promise<T> {
	const url = path.startsWith('http') ? path : `${origin}${path}`;

	const response = await fetch(url, {
		...options,
		headers: {
			...options?.headers,
			'Content-Type': 'application/json',
			'x-csrf-token': Liferay.authToken,
		},
	});

	if (!response.ok) {
		const error = new FetchError(`Request failed: ${response.status}`);
		error.status = response.status;

		try {
			error.info = await response.json();
		}
		catch {
			error.info = undefined;
		}

		throw error;
	}

	return response.status === 204
		? (undefined as T)
		: ((await response.json()) as T);
}

export const fetcher = <T>(path: string) => request<T>(path);

/**
 * Object REST filters compare relationship FKs as STRINGS even though the
 * column is a bigint — `eq 36418` fails with `Incompatible types`, `eq '36418'`
 * works. Verified 2026-08-17; see ARCHITECTURE.md §8. Always build FK filters
 * through these helpers so the quoting cannot be forgotten at a call site.
 */
export const fkEquals = (field: string, id: number | string) =>
	`${field} eq '${id}'`;

export const fkIn = (field: string, ids: Array<number | string>) =>
	`${field} in (${ids.map((id) => `'${id}'`).join(',')})`;

/**
 * `id` follows the same rule as the relationship FKs above: `id eq 282268`
 * fails with `Incompatible types` and `id in ('282268')` works. There is no
 * `eq` form that accepts an unquoted primary key, so single-id lookups go
 * through `in` too.
 */
export const idIn = (ids: Array<number | string>) => fkIn('id', ids);

/**
 * Split ids into URL-safe batches.
 *
 * An `in (…)` filter is a query-string parameter, so a run with ~550 rows
 * would push a single filter past the container's header limit and fail as an
 * opaque 400. 100 ids is roughly 800 characters — comfortably inside it.
 */
export function chunk<T>(items: T[], size = 100): T[][] {
	const out: T[][] = [];

	for (let i = 0; i < items.length; i += size) {
		out.push(items.slice(i, i + size));
	}

	return out;
}

/**
 * Follow `lastPage` and return every item.
 *
 * Object REST caps a page well below the row count of a large run, and a
 * silently truncated first page is worse than a slower load: the table would
 * under-report failures without saying so.
 */
export async function paginate<T>(
	url: (page: number) => string
): Promise<T[]> {
	const first = await request<{items: T[]; lastPage: number}>(url(1));
	const items = [...(first.items ?? [])];

	for (let page = 2; page <= (first.lastPage ?? 1); page++) {
		const next = await request<{items: T[]}>(url(page));

		items.push(...(next.items ?? []));
	}

	return items;
}
