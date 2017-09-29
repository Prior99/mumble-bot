# mumble-bot

An allround bot for mumble. Using eSpeak and other libraries for speech dispatching.

It has a webinterface via which it can be controlled.

## Current list of features

 - Webinterface to control everything from within a browser
 - Record users in the server and store and playback the records
 - Upload and playback sounds
 - Fuzzy Search
 - Fancy Images for all of the Records generated using amplitude and frequency
 - Tagging

## Install

This is currently under heavy development and in no means ready for using in production.
If you still want to install this, you will need some of my (forks of) some node modules:

 - [node-mpd](https://github.com/Prior99/node-mpd)
 - [node-espeak](https://github.com/Prior99/node-espeak)
 - [node-samplerate](https://github.com/Prior99/node-samplerate)

Some of which are not available on npm. If ```npm install``` fails, just clone the respective repositories into th ```node_modules/``` subdirectory.

### About the structure

### Installing on Arch Linux

You will need to install some packets in order to get everything working.

1. Install the following packages from the official repositories:

    [libsamplerate](https://www.archlinux.org/packages/extra/x86_64/libsamplerate/)
    [espeak](https://www.archlinux.org/packages/community/x86_64/espeak/).
    It could be done like this:
    ```
    user@machine:~$ sudo pacman -S libsamplerate espeak cairo
    ```
    Additionally you will need a MySQL-Server.

2. Clone this repository somewhere and install all dependencies:

    ```
    user@machine:~$ git clone git@git.cronosx.de:prior/mumble-bot.git
    user@machine:~$ cd mumble-bot/
    user@machine:~/mumble-bot$ npm install --python=python2
    ```

3. Setup and configure the bot using the setup script

    ```
    user@machine:~$ ./bot setup
    ```
    You will need openssl for this. Do not give the key a password.

4. Compile the sources:

    ```
    user@machine:~/mumble-bot$ npm run build
    ```

5. Start the bot and the worker:

    This software needs two distinct components running. The first component is the bot itself which can be started using `npm run start:bot` and the
    second component being a worker which uses an FFT to generate a colored image for each record. The worker can be started using `npm run start:worker`
    ```
    user@machine:~/mumble-bot$ ./bot start
    ```
    In a second terminal:
    ```
    user@machine:~/mumble-bot$ ./bot worker
    ```

6. As a systemd unit

    If everything is up and running you might consider using the systemd unit files in [systemd/](./systemd/), modifying the paths and starting the
    bot using those services.

## Contributing

I would happily accept all pull-requests as well as issues and suggestions :-)

## License

The MIT License (MIT)

Copyright (c) 2015 Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
