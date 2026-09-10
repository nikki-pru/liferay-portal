/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * The Liferay site this page is served from, e.g. `/web/testray`.
 *
 * Derived rather than configured, because the friendly URL differs per
 * environment — `/web/testray` on dev and prod, `/web/liferay-testray` on the
 * local docker instance — and a literal is wrong in at least one of them. Both
 * client extensions render inside the site, so the first two path segments
 * ARE the site: `/web/<site>` or `/group/<site>`, whatever comes after.
 *
 * The fallback matters on a page served from outside a site (a preview, a
 * direct widget render): prefer the deployed name, since that is the common
 * case, and a wrong link beats a crash.
 */
export const sitePath = (): string => {
	const [, prefix, site] = window.location.pathname.split('/');

	return prefix && site ? `/${prefix}/${site}` : '/web/testray';
};

/**
 * Where Testray itself renders. This CX is served at `<site>/triage`, so the
 * site path is what its own URL already tells us.
 */
export const TESTRAY_PATH = sitePath();

/**
 * A URL into Testray's hash router. `testrayURL()` is its home — the route the
 * sidebar's brand and its Results item both point at.
 */
export const testrayURL = (route = '/') =>
	`${window.location.origin}${TESTRAY_PATH}#${route}`;

/**
 * A link into Testray's own build-results view, pre-filtered.
 *
 * The counts beside the totals describe rows this tool deliberately does NOT
 * store — tests that never ran, and shard rows with nothing written down. They
 * are excluded from `TriageResult` because writing them would put verdicts in
 * Testray that no classifier ever made, and because Testray already holds the
 * facts: a never-ran row asserts only that a case was UNTESTED, which is in
 * the case results themselves.
 *
 * So the count is awareness and the link is the detail, served by Testray from
 * its own data. Nothing is duplicated and nothing new is stored.
 *
 * The shape is Testray's hash router: the filter is JSON in a query param,
 * with `filterSchema=buildResults` naming which view is being filtered.
 */
export const buildResultsURL = (
	projectId: number | string,
	routineId: number | string,
	buildId: number | string,
	filter: Record<string, unknown>
): string =>
	`${testrayURL(`/project/${projectId}/routines/${routineId}/build/${buildId}`)}` +
	`?filter=${encodeURIComponent(JSON.stringify(filter))}` +
	`&filterSchema=buildResults&page=1`;

/** Cases that produced no result — a coverage gap, not a failure. */
export const NEVER_RAN_FILTER = {status: ['UNTESTED']};

/**
 * Failures on the batch/shard component. Keyed by id rather than name because
 * that is what the view filters on; the id differs per instance, so it is
 * resolved by name at call time rather than hardcoded.
 */
export const shardFailureFilter = (componentId: number) => ({
	status: ['FAILED'],
	testrayComponentIds: [componentId],
});
