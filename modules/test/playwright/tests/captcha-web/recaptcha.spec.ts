/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {loginTest} from '../../fixtures/loginTest';
import {liferayConfig} from '../../liferay.config';
import {CaptchaConfigPage} from '../../pages/captcha-web/CaptchaConfigPage';
import {reCaptchaConfig} from './config';

export const test = mergeTests(loginTest);

test('LPD-32888 Check reCaptcha has a label for textarea', async ({page}) => {
	const captchaConfigPage = new CaptchaConfigPage(page);
	await captchaConfigPage.goTo();
	await captchaConfigPage.enableReCaptcha(
		reCaptchaConfig.publicKey,
		reCaptchaConfig.privateKey
	);

	await page.getByTitle('User Profile Menu').click();
	await page.getByRole('menuitem', {name: 'Sign Out'}).click();

	await page.goto(liferayConfig.environment.baseUrl);
	await page.getByRole('button', {name: 'Sign In'}).click();
	await page.getByText('Forgot Password').click();
	await page.getByLabel('Email Address').waitFor();
	await expect(page.locator('label.sr-only')).toBeHidden();
});
