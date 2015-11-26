v0.3.0
======
Bugfixes:
---------
* AFK Observer is fixed
* Fixed crash on uploading sounds
* Fixed several typos in both documentation and website
* Fixed broken URLs
* Fixed critical security vulnerability where the password hashes of the users could be obtained via the api

Relevant Changes:
-----------------
* Added ability for downloading records.
* Can now protect and delete cached records.
* Display time of cached records.
* Added SOX for cool sound effects.
* Added possibility to subscribe to an RSS feed.
* Added support for mumble server using password protection.
* Added labels to records.
* Steam login no longer required for registering.
* Can now edit records.
* Can now activate and deactivate announcing of user activities in the server.
* Add ability to play back random record.
* Added statistics. Statistics will be recorded after migrating to this version.
* Increased performance rapidly by using browserify.
* Added ability to create dialogs.
* Cached records now updating via websocket.
* Stored records now use AJAX for loading.
* Added new front-end for browsing stored records.
* Added responsive voice TTS.
* Internal: Migrated database to promises.

Contributors:
------------
* Prior
* Sascha

v0.2.1
======
Bugfixes:
---------
* Upgraded Mumble to v0.3.2 which fixes multiple serious issues.
* Fixed increasing of usage of records.
* Fixed useless verbosity.

Contributors:
-------------
* Prior

v0.2.0
======
Migration:
----------
There are new values which have to be added to the configuration file. Take a look at the example file or generate a new one interactively using ```./bot editconfig```.
You will need to install all new dependencies and upgrade outdated ones by rebuilding them using ```npm install```.
Additionally there are two new permissions "log" and "be-quiet". You will need to add them to at least one user in order to grant them to anyone. To do this find out your database user id (Take a look at the ```Users``` table) and then execute the following SQL queries (substitute [userid] with your user id):
```
INSERT INTO UserPermissions(user, permission) VALUES([userid], 'be-quiet');
INSERT INTO UserPermissions(user, permission) VALUES([userid], 'log');
```

Relevant Changes:
-----------------
* Addons moved to own repository *mumble-bot-addons* to have this repository save for work.
* Icons on top-level pages.
* Moved sounds to own page with subpages for uploading and playing.
* Tables can now be sorted. Add class ```tablesorter``` to any html table to have it sortable. Add class ```no-sort``` to the head of columns which should not be sortable.
* Added fun feature: Google Instant which will retrieve a set of suggestions from googles instant engine and read them.
* Bot will record everything a registered user is saying and cache it accessible on a page. It is then possible to persist these records and play them back later for amusement.
* Speechrecognition via pocketsphinx removed.
* Users which are inactive for some time will be warned and then moved into the AFK channel.
* Users which are unknown to the bot will be greeted and then moved to the kicked channel. Also an administrator will be notified if an administrator is currently online.
* Linking mumble users now happens in the settings instead of the profile page.
* Can now see queued sounds and speech.
* More verbose logging.
* Log will be displayed on the website.
* Added the ability be empty the whole queue and make the bot shut up at once.
* Made amount of temporary records to keep configurable.
* Users can configure whether they want to be recorded or not. Default is no.
* Display duration of temporary records.
* Removed useless logo in navbar.
* Added user settings.

Bugfixes:
---------
* Attempted to fix some problems with session-store.
* Fixed several problems with error-handling in cachedwebtts.
* Fixed style for empty buttons in bass feature.
* Fixed updating amount of uses of sounds.

Contributors:
-------------
* Prior

v0.1.1
======
Migration:
----------
Execute the following on the SQL database: ```ALTER TABLE TTSCache ADD COLUMN api VARCHAR(16) DEFAULT 'google';``` to get the database schema up-to-date. Run ```npm install``` to install and upgrade all dependencies.

Relevant Changes:
-----------------
* Can now playback sound files which can be uploaded.
* Added "Bass" for playing back nice mixed tracks of beatbox music.
* Added microsoft translator TTS.
* Added possibility to only control mpd but not playback the music.
* New notification system in webfrontend.
* Added possibility to login by passing logindata to the query.
* Sessions expire after 10 years.
* Added page "speak" with autocompletition.
* Removed piping of user input.
* Made compatible to error handling and permissions of latest mumble version.
* Added favicon.
* Added neat startup wrapper script which checks the environment, generates and fixes the config and creates an tls certificate usign OpenSSL.
* Added scripts for generating and checking config.
* Added compliments.
* Can now insult people on the server directly

Bugfixes:
---------
* Fixes to design. Changed Page with quotes to display only first 50 characters to prevent bugs in chrome.
* Fixed falling back to espeak when google TTS failed.
* Fixed reporting login and logout of users in steam multiple times.
* Bot will crash on shutdown if mpd control is used but music playback is not.

Contributors:
-------------
* Prior

v0.1.0
======

Relevant changes:
-----------------
* Pressing CTRL^C will now shutdown the bot gently. A second CTRL^C forces the
  shutdown.
* Users can have permission which are defined in the database schema. Certain
  commands and other operations may require permissions. See file
  *src/permissions.js* for further information on how to use them. It is also
  possible to register a command which needs a permission. Have a look at the
  docs.
* Added permissions for the following things:
	* Login,
	* Kick users,
	* Upload music,
	* Shutdown the bot,
	* Add a quote,
	* Grant permissions
* Commands can now receive the user which issued the command as well as the
  source the command came from. Currently sources can be the following:
	* steam
	* minecraft
	* mumble (chat and voice)
	* website
	* terminal

  Please note that commands issued from the terminal can not have a user but
  always ignore permissions.
* Commands can now have arguments which need to be from a predefined list when
  registering the commands so the grammar can be created accordingly.
* Commands with arguments can be issued from the website with a dropdown-button.
* Massive addition of documentation but still not yet done.
* Added command "kick" which will kick a user by his identifier.
* Added command "who is" which will tell the user assigned to this identifier.
* Users can now link mumble users to their account.

Bugfixes:
---------
* Fixed a bug with the database crashing the bot.
* Fixed commanding via steam.
* Fixed commands issued via website executed twice.
* Fixed website not to display music section.
* Fixed bot not shutting down due to opened fifo from mpd.

Contributors:
-------------
* Prior

v0.0.0
======

Relevant changes:
-----------------
* First mostly stable version.
* Commands view on website now featuring a grid instead of a list.
* Added usermanagement, sign up as well as sign in and logout.
* Added a few basics for future permission system.
* Added user list as well as profile.
* Do not display section for music in webpage if bot has no music module.
* Website now in german.
* Encrypt passwords of users in browser using crypto-js.
* Added new command "insult" for insulting.
* Added support for steam.
* Added support for minecraft.
* Do no longer say author of a quote.
* Improved README.module
* Use Google Translate TTS API instead of ESpeak.
* Added new command "question" for reading a random question from the website
  "gutefrage.net".

Bugfixes:
---------
* Fixed bot crashing on entering quotes.
* Fixed bot not shutting down properly because requests to website do not
  timeout.
* Fixed bad dependencies in package.json.

Contributors:
-------------
* Prior
* Alexd2580
* Mörrrlin
