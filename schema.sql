CREATE TABLE IF NOT EXISTS Quotes (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	author			VARCHAR(128) NOT NULL,
	quote			TEXT,
	submitted		DATETIME,
	used			INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS TTSCache (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	text			VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS Identifiers (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	identifier		VARCHAR(64),
	UNIQUE(identifier)
);

CREATE TABLE IF NOT EXISTS Users (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	username		VARCHAR(64),
	password		VARCHAR(72),
	steamid			VARCHAR(24),
	identifier		INT NOT NULL,
	rank			INT NOT NULL DEFAULT 0,
	UNIQUE(identifier),
	FOREIGN KEY (identifier) REFERENCES Identifiers(id)
);

CREATE TABLE IF NOT EXISTS Ranks (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	rank			INT NOT NULL,
	name			VARCHAR(32) NOT NULL,
	UNIQUE(rank),
	UNIQUE(name)
);



INSERT IGNORE INTO Identifiers (identifier) VALUES
("orange"),
("apple"),
("tomato"),
("pine"),
("chocolate"),
("strawberry"),
("chicken"),
("sandwich"),
("cat"),
("dog"),
("turtle"),
("bear"),
("bee"),
("bread"),
("pizza"),
("cheese"),
("cake"),
("cookie"),
("rabbit"),
("elefant"),
("cucumber");

INSERT IGNORE INTO Ranks(rank, name) VALUES
(0, "Deaktiviert"),
(1, "Mitglied"),
(10, "Moderator"),
(100, "Admin");
