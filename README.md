# mumble-bot

[![pipeline status](https://gitlab.com/prior99/mumble-bot/badges/master/pipeline.svg)](https://gitlab.com/prior99/mumble-bot/commits/master)
[![coverage report](https://gitlab.com/prior99/mumble-bot/badges/master/coverage.svg)](https://gitlab.com/prior99/mumble-bot/commits/master)

An allround bot for mumble which can be used to record users, play back recordings as well as uploading sounds and extracting them from YouTube.

It has a webinterface via which it can be controlled.

## Current list of features

 - Webinterface to control everything from within a browser.
 - Record users in the server and store and playback the records.
 - Upload and playback sounds.
 - Import sounds from YouTube.
 - Playlists.

## Installation

### 1. Clone this repository

Clone this repository into a directory where you want to run the bot:

```
git clone https://gitlab.com/prior99/mumble-bot.git
```

### 2. Install requirements

Some requirements need to be installed:

 - FFmpeg
 - Sox
 - Cairo, libjpeg, libjpeg-dev
 - Node JS, NPM and Yarn
 - Make
 - PostgreSQL

On Ubuntu this can for example be achieved by running this command:

```
apt-get -qq update
apt-get -qq install -y gconf-service libasound2 libgconf-2-4 libgtk-3-0 libnspr4 libx11-xcb1 \
  libxss1 libxtst6 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils libpango1.0-dev libgif-dev \
  build-essential ffmpeg sox nodejs npm postgresql libjpeg-dev
```

In order to install yarn [please follow the official installation way](https://yarnpkg.com/lang/en/docs/install/#debian-stable).

### 3. Build the sources

There is a `Makefile` in place for building the sources.

Simply run `make` to build everything:

```
make
```

### 4. Generate a key and cert pair

The bot needs a certificate and key pair to connect to the mumble server. Generate these like this:

```
openssl genrsa -out bot.key 2048 2> /dev/null
openssl req -new -sha256 -key bot.key -out bot.csr -subj "/"
openssl x509 -req -in bot.csr -signkey bot.key -out bot.cert 2> /dev/null
```

### 4. Write a config file

Create a config file for the bot somewhere.

```
url: server url
name: Name of the bot's user
keyFile: "./bot.key"
certFile: "./bot.cert"
channel: "Channel the bot is supposed to enter"
audioCacheAmount: 150 # Amount of audios to cache
port: 8080 # Port to run the webinterface on
dbName: database_name # Name of the database
dbPassword: database_password # Password to connect tot eh database
tmpDir: data/tmp # Directory to store cached audios and temporary files in
soundsDir: data/sounds # Directory to store sounds in
language: german # One of Postgres' text search languages
```

### 5. Prepare the database

The bot uses PostgreSQL to store its data. Setup a Postgres database that the bot can use.

The bot uses UUIDs and hence needs the uuid-ossp extension to be installed in the database:

```
psql -d database -c 'create extension if not exists "uuid-ossp";'
```

Then afterwards initialize the database:

```
node server migrate -c config.yml
```

### 6. Start the backend

```
node server serve -c config.yml
```

You can make the bot run as systemd service:

```
[Unit]
Description=Mumble Bot
After=network.target

[Service]
TimeoutStartSec=5
WorkingDirectory=/path/to/mumble-bot/
ExecStart=/usr/bin/node server serve --config-file config.yml
TimeoutStopSec=10
Restart=always
RestartSec=10

[Install]
WantedBy=multi.target
```

### 7. Make the frontend available

The frontend is static and was built into the directory `dist/`.

Simply make the contents of that directory public on your webserver.

Edit the `config.js` and insert the URL on which the backend can be publicly reached.
