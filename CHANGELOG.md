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
