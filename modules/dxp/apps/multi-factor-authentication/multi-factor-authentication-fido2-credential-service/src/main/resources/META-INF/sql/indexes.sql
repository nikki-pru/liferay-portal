create index IX_2B0CF873 on MFAFIDO2CredentialEntry (credentialKey[$COLUMN_LENGTH:128$]);
create unique index IX_4C5F79F9 on MFAFIDO2CredentialEntry (userId, credentialKey[$COLUMN_LENGTH:128$]);