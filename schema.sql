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
	username		VARCHAR(64) NOT NULL,
	password		VARCHAR(72) NOT NULL,
	steamid			VARCHAR(24),
	identifier		INT NOT NULL,
	minecraft		VARCHAR(64),
	email			VARCHAR(64) NOT NULL,
	UNIQUE(identifier),
	FOREIGN KEY (identifier) REFERENCES Identifiers(id)
);

CREATE TABLE IF NOT EXISTS Permissions (
	id				VARCHAR(16) NOT NULL PRIMARY KEY,
	name			VARCHAR(64) NOT NULL,
	description		TEXT NOT NULL,
	icon			VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS UserPermissions (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user			INT NOT NULL,
	permission		VARCHAR(16) NOT NULL,
	FOREIGN KEY (user) REFERENCES Users(id),
	FOREIGN KEY (permission) REFERENCES Permissions(id)
);

INSERT IGNORE INTO Permissions (id, name, description, icon) VALUES
("login", "Anmelden", "Erlaubt einem Benutzer, sich im System anzumelden.", "sign-in"),
("add-quote", "Zitat Eintragen", "Erlaubt das Eintragen neuer Zitate.", "quote-left"),
("shutdown", "Herunterfahren", "Mit dieser Berechtigung kann der gesamte Bot heruntergefahren werden.", "power-off"),
("grant", "Berechtigungen Vergeben", "Hat ein Benutzer diese Berechtigung, so kann er anderen Benutzern dieselben Berechtigungen zuweisen, die er selber besitzt.", "legal");

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
