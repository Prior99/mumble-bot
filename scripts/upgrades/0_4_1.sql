ALTER TABLE Records ADD COLUMN parent INT;
ALTER TABLE Records ADD COLUMN overwrite BOOLEAN NOT NULL DEFAULT FALSE;
INSERT INTO VersionInfo(version, migrated) VALUES("0.4.1", CURRENT_TIME());