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
 
Some of which are not available on npm. Just clone the respective repositories into th ```node_modules/``` subdirectory.

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
