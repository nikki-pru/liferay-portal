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

package com.liferay.journal.util;

import com.liferay.dynamic.data.mapping.model.DDMStructure;
import com.liferay.dynamic.data.mapping.storage.DDMFormValues;
import com.liferay.dynamic.data.mapping.storage.Fields;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.xml.Document;

<<<<<<< HEAD
=======
import java.util.Locale;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import org.osgi.annotation.versioning.ProviderType;

/**
 * @author Marcellus Tavares
 * @author Bruno Basto
 */
@ProviderType
public interface JournalConverter {

<<<<<<< HEAD
=======
	/**
	 * @deprecated As of Athanasius (7.3.x), replaced by {@link
	 *             #getContent(DDMStructure, Fields, long)}
	 */
	@Deprecated
	public String getContent(DDMStructure ddmStructure, Fields ddmFields)
		throws Exception;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	public String getContent(
			DDMStructure ddmStructure, Fields ddmFields, long groupId)
		throws Exception;

	public Fields getDDMFields(DDMStructure ddmStructure, Document document)
		throws PortalException;

	public Fields getDDMFields(DDMStructure ddmStructure, String content)
		throws PortalException;

	public DDMFormValues getDDMFormValues(
			DDMStructure ddmStructure, Fields fields)
		throws PortalException;

<<<<<<< HEAD
=======
	/**
	 * @deprecated As of Judson (7.1.x), with no direct replacement
	 */
	@Deprecated
	public String getDDMXSD(String journalXSD) throws Exception;

	/**
	 * @deprecated As of Judson (7.1.x), with no direct replacement
	 */
	@Deprecated
	public String getDDMXSD(String journalXSD, Locale defaultLocale)
		throws Exception;

	/**
	 * @deprecated As of Judson (7.1.x), with no direct replacement
	 */
	@Deprecated
	public String getJournalXSD(String ddmXSD) throws Exception;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
}