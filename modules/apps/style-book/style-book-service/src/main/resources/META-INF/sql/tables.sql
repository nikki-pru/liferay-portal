create table StyleBookEntry (
	mvccVersion LONG default 0 not null,
	uuid_ VARCHAR(75) null,
	headId LONG,
	head BOOLEAN,
	styleBookEntryId LONG not null primary key,
	groupId LONG,
	companyId LONG,
	userId LONG,
	userName VARCHAR(75) null,
	createDate DATE null,
	modifiedDate DATE null,
	defaultStyleBookEntry BOOLEAN,
	frontendTokensValues TEXT null,
	name VARCHAR(75) null,
	previewFileEntryId LONG,
	styleBookEntryKey VARCHAR(75) null
);

create table StyleBookEntryVersion (
	styleBookEntryVersionId LONG not null primary key,
	version INTEGER,
	uuid_ VARCHAR(75) null,
	styleBookEntryId LONG,
	groupId LONG,
	companyId LONG,
	userId LONG,
	userName VARCHAR(75) null,
	createDate DATE null,
	modifiedDate DATE null,
	defaultStyleBookEntry BOOLEAN,
	frontendTokensValues TEXT null,
	name VARCHAR(75) null,
	previewFileEntryId LONG,
	styleBookEntryKey VARCHAR(75) null
);