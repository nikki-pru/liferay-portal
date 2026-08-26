/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * Where Testray itself renders.
 *
 * The same assumption as `TRIAGE_PATH` in the Testray-side hook: the site
 * lives at this friendly URL. Correct locally, wrong anywhere else, and it has
 * to come from configuration before this ships — see ARCHITECTURE §9.
 *
 * It is here rather than inline at each call site precisely BECAUSE it is
 * wrong: when the config lands there is one line to change, not a grep. The
 * report's routine crumb and the home link already disagreed about whether to
 * include the `#`, which is the kind of drift this prevents.
 */
export const TESTRAY_PATH = '/web/liferay-testray';

/**
 * A URL into Testray's hash router. `testrayURL()` is its home — the route the
 * sidebar's brand and its Results item both point at.
 */
export const testrayURL = (route = '/') =>
	`${window.location.origin}${TESTRAY_PATH}#${route}`;
