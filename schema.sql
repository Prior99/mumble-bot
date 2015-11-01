CREATE TABLE IF NOT EXISTS Quotes (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	author			VARCHAR(128) NOT NULL,
	quote			TEXT,
	submitted		DATETIME,
	used			INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS TTSCache (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	text			TEXT NOT NULL,
	api				VARCHAR(16) NOT NULL DEFAULT 'google'
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

CREATE TABLE IF NOT EXISTS UserSettings (
	user			INT NOT NULL,
	setting			VARCHAR(32) NOT NULL,
	value			TEXT,
	FOREIGN KEY (user) REFERENCES Users(id),
	PRIMARY KEY(user, setting)
);

CREATE TABLE IF NOT EXISTS MumbleUsers (
	mumbleId		INT NOT NULL PRIMARY KEY,
	user			INT NOT NULL,
	FOREIGN KEY (user) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS BassEffects (
	effect			VARCHAR(128) NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS AutoComplete (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	sentence		VARCHAR(100) NOT NULL,
	used			INT DEFAULT 1,
	UNIQUE(sentence)
);

CREATE TABLE IF NOT EXISTS Sounds (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name			VARCHAR(64) NOT NULL,
	used			INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Log (
	id 				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	level 			VARCHAR(45) NOT NULL,
	message 		TEXT NOT NULL,
	`timestamp` 	DATETIME NOT NULL,
	`meta` 			VARCHAR(255),
	hostname 		VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Records (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	quote			TEXT,
	submitted		DATETIME,
	user			INT NOT NULL,
	used			INT NOT NULL DEFAULT 0,
	FOREIGN KEY(user) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS RSS (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	url				TEXT NOT NULL,
	name			VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS KnownRSSEntries (
	hash			VARCHAR(32) NOT NULL PRIMARY KEY,
	url				TEXT NOT NULL,
	seen			DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS RecordLabels (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name			TEXT
);

CREATE TABLE IF NOT EXISTS RecordLabelRelation (
	record			INT NOT NULL,
	label			INT NOT NULL,
	PRIMARY KEY(record, label)
);

CREATE TABLE IF NOT EXISTS Dialogs (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	submitted 		DATETIME NOT NULL,
	used			INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS DialogParts (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	dialogId		INT NOT NULL,
	position		INT NOT NULL,
	recordId		INT NOT NULL,
	FOREIGN KEY(dialogId) REFERENCES Dialogs(id),
	FOREIGN KEY(recordId) REFERENCES Records(id)
);

CREATE TABLE IF NOT EXISTS UserStatsOnline (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user			INT NOT NULL,
	started			DATETIME NOT NULL,
	ended			DATETIME NOT NULL,
	FOREIGN KEY(user) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS UserStatsSpeaking (
	id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user			INT NOT NULL,
	started			DATETIME NOT NULL,
	ended			DATETIME NOT NULL,
	FOREIGN KEY(user) REFERENCES Users(id)
);

INSERT IGNORE INTO Permissions (id, name, description, icon) VALUES
("login", "Anmelden", "Erlaubt einem Benutzer, sich im System anzumelden.", "sign-in"),
("add-quote", "Zitat Eintragen", "Erlaubt das Eintragen neuer Zitate.", "quote-left"),
("shutdown", "Herunterfahren", "Mit dieser Berechtigung kann der gesamte Bot heruntergefahren werden.", "power-off"),
("grant", "Berechtigungen Vergeben", "Hat ein Benutzer diese Berechtigung, so kann er anderen Benutzern dieselben Berechtigungen zuweisen, die er selber besitzt.", "legal"),
("upload-music", "Musik hochladen", "Diese Berechtigung wird benötigt, um Musik hochzuladen, oder aus Youtube zu extrahieren.", "upload"),
("kick", "Kicken", "Mit dieser Berechtigung ist es möglich, Benutzer in Mumble aus ihrem Channel zu kicken.", "legal"),
("be-quiet", "Stumm Stellen", "Mit dieser Berechtigung kann ein Nutzer die gesamte Ausgabequeue des Bots leeren und so die aktuelle Wiedergabe unterbrechen.", "bell-slash"),
("log", "Log anzeigen", "Erlaubt es einem Benutzer, die Logausgabe des Bots zu betrachten.", "file-text"),
("rss", "RSS Feed abonnieren", "Mit dieser Berechtigung darf ein Nutzer RSS-Feeds abonnieren.", "rss");

INSERT IGNORE INTO BassEffects (effect) VALUES
("Drop den Bass"),
("härter"),
("Schlampe"),
("Put your hands up in the air"),
("wubsch"),
("wobbel"),
("lublub");

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
("elephant"),
("cucumber");
