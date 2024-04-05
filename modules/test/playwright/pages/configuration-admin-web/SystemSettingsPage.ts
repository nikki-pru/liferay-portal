/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// @ts-ignore

import {Locator, Page} from '@playwright/test';

import {ApplicationsMenuPage} from '../product-navigation-applications-menu/ApplicationsMenuPage';
import {UIElementsPage} from '../uielements/UIElementsPage';

export class SystemSettingsPage {
	private applicationsMenuPage;
	readonly page: Page;
	readonly disabledFeaturesSection: Locator;
	readonly disablePrivatePagesOption: Locator;
	readonly updateButton: Locator;
	readonly releaseFeatureFlagsLink: Locator;
	private uiElementsPage;

	constructor(page: Page) {
		this.page = page;
		this.applicationsMenuPage = new ApplicationsMenuPage(page);
		this.uiElementsPage = new UIElementsPage(page);

		this.disabledFeaturesSection = page
			.locator('.col-ddm')
			.locator('div')
			.nth(2);
		this.disablePrivatePagesOption = page.getByTestId('dropdownItem-1');
		this.releaseFeatureFlagsLink = page.getByRole('link', {
			name: 'Release Feature Flags',
		});
		this.updateButton = page.getByRole('button', {name: 'Update'});
	}

	async disablePrivatePages() {
		await this.applicationsMenuPage.goToSystemSettings();
		await this.releaseFeatureFlagsLink.click();
		await this.disabledFeaturesSection.click();
		await this.disablePrivatePagesOption.click();
		await this.updateButton.click();
		await this.uiElementsPage.anySuccessAlert.waitFor({state: 'visible'});
	}
}
