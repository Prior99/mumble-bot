# mumble-bot

An alround bot for mumble. Using eSpeak for speech dispatching and pocketsphinx for speech-recognition. This way it is possible to control the bot by talking to him.

It has a webinterface via which it can be controlled.

## Current list of features

 - Speechrecognition via pocketsphinx, automatical generation of grammar
 - Speechdispatching using espeak
 - Webinterface to control everything from within a browser
 - Playback music using mpd, control mpd using the bot
 - Fetch music from youtube
 - Upload music to mpd library
 
## Install

This is currently under heavy development and in no means ready for using in production.
If you still want to install this, you will need some of my (forks of) some node modules:

 - [node-mpd](https://github.com/Prior99/node-mpd)
 - [node-pocketsphinx](https://github.com/Prior99/node-pocketsphinx)
 - [node-espeak](https://github.com/Prior99/node-espeak)
 - [node-samplerate](https://github.com/Prior99/node-samplerate)
 
Some of which are not available on npm. If ```npm install``` fails, just clone the respective repositories into th ```node_modules/``` subdirectory.

### Installing on Arch Linux

You will need to isntall some packets in order to get everything working.

1. Install the following packages from the AUR: [sphinxbase](https://aur.archlinux.org/packages/sphinxbase/), [pocketsphinx](https://aur.archlinux.org/packages/pocketsphinx/) 
   as well as the following packages from the official repositories: [libsamplerate](https://www.archlinux.org/packages/extra/x86_64/libsamplerate/) and [espeak](https://www.archlinux.org/packages/community/x86_64/espeak/).
   It could be done like this:
   ```
         user@machine:~$ yaourt -S sphinxbase
         user@machine:~$ yaourt -S pocketsphinx
         user@machine:~$ sudo pacman -S libsamplerate espeak
    ```
    Additionally you will need a MySQL-Server.
2. Clone this repository somewhere and install all dependencies:
    ```
         user@machine:~$ git clone git@git.cronosx.de:prior/mumble-bot.git
         user@machine:~$ cd mumble-bot/
         user@machine:~/mumble-bot$ npm install --python=python2
    ```
3. Generate a TLS-certificate for the bot:
    ```
         openssl genrsa -out bot.key 2048
         openssl req -new -sha256 -key bot.key -out bot.csr
         openssl x509 -req -in bot.csr -signkey bot.key -out bot.cert
    ```
    You will need openssl for this. Do not give the key a password.
4. Copy the ```config.example.json``` to ```config.json``` and edit it to your needs. 
   If you do not want to have MPD-Support (For which you will need an MPD-Server), just delete the whole "mpd"-section.
   The configfile should be self-explanatory.
5. Start the bot:
   ```
        user@machine:~/mumble-bot$ node index.js
   ```



## Contributing

I would happyly accept all pull-requests as well as issues and suggestions :-)

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
