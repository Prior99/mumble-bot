SET foreign_key_checks = 0;
CREATE TABLE IF NOT EXISTS Users_Temp (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	username		VARCHAR(64) NOT NULL,
	password		VARCHAR(72) NOT NULL,
	steamid			VARCHAR(24),
	minecraft		VARCHAR(64),
	email			VARCHAR(64) NOT NULL
);
INSERT INTO Users_Temp(id, username, password, steamid, minecraft, email) SELECT id, username, password, steamid, minecraft, email FROM Users;
DROP TABLE Users;
RENAME TABLE Users_Temp TO Users;
SET foreign_key_checks = 1;
DROP TABLE Identifiers;
CREATE TABLE IF NOT EXISTS VersionInfo(
	version 	VARCHAR(16) NOT NULL PRIMARY KEY,
	migrated	DATETIME
);
INSERT INTO VersionInfo(version, migrated) VALUES("0.4.0", CURRENT_TIME());
ALTER TABLE Records ADD COLUMN reporter INT NOT NULL;
UPDATE Records SET reporter = user;
ALTER TABLE Records ADD CONSTRAINT records_reporter_fk FOREIGN KEY(reporter) REFERENCES Users(id);
ALTER TABLE Users ADD COLUMN money INT NOT NULL DEFAULT 100;
UPDATE Records SET changed = CURRENT_TIME();
