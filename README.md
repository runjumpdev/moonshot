Moonshot
========

Moonshot is a game launcher front end designed for the Lexitron arcade machine
built by Run Jump Dev. Pick and launch games using a joystick.

Currently in prototype state.

Minimum Viable Product
======================
- Diagnostic screen with button check for all inputs
- Joystick-navigable list of games with names and images
- Game launch capability

Why Node-Webkit?
================
- Easiest path for UI work, familiar for graphic designers
- Supports everything we need: video, audio, game controllers, process management

Future Work
===========
- Houston, the slim watchdog process that can relaunch Moonshot if it fails
- Graphic design!
- Attract mode (30s inactivity => slides/videos)
- Audio feedback during startup/navigation/launch
- Live tweets #lexitron #gamename

See [issues](http://github.com/mildmojo/moonshot/issues).

Build Instructions
==================

1. Download [node-webkit](https://github.com/rogerwang/node-webkit) for your
   platform.
2. Unzip node-webkit into the project root (where the `source` directory lives).
3. To test the launcher, switch to the `source` directory and run node-webkit.

```
Linux: 
$ cd source
$ ../nw .

Windows:
> cd source
> ..\nw .

OS X:
$ cd source
$ ../node-webkit.app/Contents/MacOS/node-webkit .
```

4. To build the launcher app on Windows/Linux, zip the source directory and concatenate it with the node-webkit executable.

```
$ cd source
$ zip -r ../moonshot.nw *
$ cd ..
$ cat nw moonshot.nw > moonshot
$ chmod u+x moonshot

> cd source
> pkzip -r ..\moonshot.nw *.*
> cd ..
> copy /b nw.exe+moonshot.nw moonshot.exe
```

Or, for OS X, copy the files to node-webkit.app/Contents/Resources/app.nw

```
$ cd source
$ cp -R ./ ../node-webkit.app/Contents/Resources/app.nw
```

Adding games
============
Games can be added by including the following files:
```
- game_name // Game launch script
- main_image_file // Main image to display in Moonshot
- game_name.lex // JSON formatted game data
```
Each `.lex` file should contain at least the following structure:
```
{
  "name" : "Game Name",
  "images" : {
    "main" : "main_image_file",
    "screenshots" : {}
  }
  "author" : "Arthur Author",
  "website" : "example.com/gamename",
  "twitter" : "gamename",
  "video" : "video_file"
}
```

Some properties are not used in the present build, but will be in the near future.

(For more info, see node-webkit's [How to package and distribute your apps](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps).)
