/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import moment from 'moment/min/moment-with-locales';

const getLanguage = () => {
	const language = Liferay.ThemeDisplay.getBCP47LanguageId();

	const languages = {
		'zh-Hans-CN': 'zh-CN',
	};

	return languages[language] || language;
};

<<<<<<< HEAD
export const formatDate = (date, format) =>
	moment(date).locale(getLanguage()).format(format);

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
export const fromNow = (date) => moment(date).locale(getLanguage()).fromNow();
