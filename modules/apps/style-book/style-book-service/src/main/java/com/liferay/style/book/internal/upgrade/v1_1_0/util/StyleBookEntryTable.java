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

package com.liferay.style.book.internal.upgrade.v1_1_0.util;

import java.sql.Types;

import java.util.HashMap;
import java.util.Map;

/**
 * @author	  Brian Wing Shun Chan
 * @generated
 */
public class StyleBookEntryTable {

	public static final String TABLE_NAME = "StyleBookEntry";

	public static final Object[][] TABLE_COLUMNS = {
		{"mvccVersion", Types.BIGINT}, {"uuid_", Types.VARCHAR},
		{"headId", Types.BIGINT}, {"head", Types.BOOLEAN},
		{"styleBookEntryId", Types.BIGINT}, {"groupId", Types.BIGINT},
		{"companyId", Types.BIGINT}, {"userId", Types.BIGINT},
		{"userName", Types.VARCHAR}, {"createDate", Types.TIMESTAMP},
		{"modifiedDate", Types.TIMESTAMP},
		{"defaultStyleBookEntry", Types.BOOLEAN},
		{"frontendTokensValues", Types.CLOB}, {"name", Types.VARCHAR},
		{"previewFileEntryId", Types.BIGINT},
		{"styleBookEntryKey", Types.VARCHAR}
	};

	public static final Map<String, Integer> TABLE_COLUMNS_MAP =
new HashMap<String, Integer>();

static {
TABLE_COLUMNS_MAP.put("mvccVersion", Types.BIGINT);

TABLE_COLUMNS_MAP.put("uuid_", Types.VARCHAR);

TABLE_COLUMNS_MAP.put("headId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("head", Types.BOOLEAN);

TABLE_COLUMNS_MAP.put("styleBookEntryId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("groupId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("companyId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("userId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("userName", Types.VARCHAR);

TABLE_COLUMNS_MAP.put("createDate", Types.TIMESTAMP);

TABLE_COLUMNS_MAP.put("modifiedDate", Types.TIMESTAMP);

TABLE_COLUMNS_MAP.put("defaultStyleBookEntry", Types.BOOLEAN);

TABLE_COLUMNS_MAP.put("frontendTokensValues", Types.CLOB);

TABLE_COLUMNS_MAP.put("name", Types.VARCHAR);

TABLE_COLUMNS_MAP.put("previewFileEntryId", Types.BIGINT);

TABLE_COLUMNS_MAP.put("styleBookEntryKey", Types.VARCHAR);

}
	public static final String TABLE_SQL_CREATE =
"create table StyleBookEntry (mvccVersion LONG default 0 not null,uuid_ VARCHAR(75) null,headId LONG,head BOOLEAN,styleBookEntryId LONG not null primary key,groupId LONG,companyId LONG,userId LONG,userName VARCHAR(75) null,createDate DATE null,modifiedDate DATE null,defaultStyleBookEntry BOOLEAN,frontendTokensValues TEXT null,name VARCHAR(75) null,previewFileEntryId LONG,styleBookEntryKey VARCHAR(75) null)";

	public static final String TABLE_SQL_DROP = "drop table StyleBookEntry";

	public static final String[] TABLE_SQL_ADD_INDEXES = {
		"create index IX_C95383D1 on StyleBookEntry (groupId, defaultStyleBookEntry, head)",
		"create index IX_E96FB900 on StyleBookEntry (groupId, head)",
		"create index IX_77DDEC7F on StyleBookEntry (groupId, name[$COLUMN_LENGTH:75$], head)",
		"create unique index IX_3EEC78BF on StyleBookEntry (groupId, styleBookEntryKey[$COLUMN_LENGTH:75$], head)",
		"create unique index IX_B5BABC0D on StyleBookEntry (headId)",
		"create index IX_CAEEB506 on StyleBookEntry (uuid_[$COLUMN_LENGTH:75$], companyId, head)",
		"create unique index IX_E2F3F688 on StyleBookEntry (uuid_[$COLUMN_LENGTH:75$], groupId, head)",
		"create index IX_6DBF970A on StyleBookEntry (uuid_[$COLUMN_LENGTH:75$], head)"
	};

}