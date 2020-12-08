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

package com.liferay.portal.tools.service.builder.test.service.impl;

import com.liferay.petra.io.unsync.UnsyncByteArrayInputStream;
import com.liferay.portal.kernel.dao.jdbc.OutputBlob;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.tools.service.builder.test.model.LazyBlobEntry;
import com.liferay.portal.tools.service.builder.test.service.base.LazyBlobEntryLocalServiceBaseImpl;

/**
 * @author Brian Wing Shun Chan
 */
public class LazyBlobEntryLocalServiceImpl
	extends LazyBlobEntryLocalServiceBaseImpl {

	@Override
	public LazyBlobEntry addLazyBlobEntry(
		long groupId, byte[] bytes, ServiceContext serviceContext) {

		long lazyBlobEntryId = counterLocalService.increment();

		LazyBlobEntry lazyBlobEntry = lazyBlobEntryPersistence.create(
			lazyBlobEntryId);

		lazyBlobEntry.setUuid(serviceContext.getUuid());
		lazyBlobEntry.setGroupId(groupId);

		UnsyncByteArrayInputStream unsyncByteArrayInputStream =
			new UnsyncByteArrayInputStream(bytes);

		OutputBlob outputBlob = new OutputBlob(
			unsyncByteArrayInputStream, bytes.length);

		lazyBlobEntry.setBlob1(outputBlob);
		lazyBlobEntry.setBlob2(outputBlob);

		return lazyBlobEntryPersistence.update(lazyBlobEntry);
	}

}