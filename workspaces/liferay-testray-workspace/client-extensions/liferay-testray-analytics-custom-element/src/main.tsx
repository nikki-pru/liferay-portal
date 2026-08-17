/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Root, createRoot} from 'react-dom/client';
import {SWRConfig} from 'swr';

import App from './App';
import {fetcher} from './services/fetcher';

import './styles/index.scss';

class TestrayAnalytics extends HTMLElement {
	private root: Root | undefined;

	connectedCallback() {
		if (!this.root) {
			this.root = createRoot(this);

			this.root.render(
				<SWRConfig value={{fetcher, revalidateOnFocus: false}}>
					<App />
				</SWRConfig>
			);
		}
	}
}

const ELEMENT_ID = 'liferay-testray-analytics-custom-element';

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(ELEMENT_ID, TestrayAnalytics);
}
