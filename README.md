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
- Load game list dynamically
  - name
  - author(s)
  - website
  - twitter
  - launch script or command
  - screen shots
  - attract mode video
  - controls?
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
$ rsync -r -R * ../node-webkit.app/Contents/Resources/app.nw
$ cd ..
```

(For more info, see node-webkit's [How to package and distribute your apps](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps).)
