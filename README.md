Moonshot
========

Moonshot is the game launcher front end used in the Lexitron arcade machine by
Run Jump Dev. Pick and launch games using the joystick.

Build Instructions
==================

1. Download [node-webkit](https://github.com/rogerwang/node-webkit) for your
   platform.
2. Unzip node-webkit into the repo root (one level above the `project` directory).
3. To test the launcher, switch to the project directory and run node-webkit.

```
$ cd project
$ ../nw .

-or-

> cd project
> ..\nw .
```

4. To build the launcher app, zip the project directory and concatenate it with
   the node-webkit executable.

```
$ cd project
$ zip -r ../moonshot.nw *
$ cd ..
$ cat nw moonshot.nw > moonshot
$ chmod u+x moonshot

-or-

> cd project
> pkzip -r ..\moonshot.nw *.*
> cd ..
> copy /b nw.exe+moonshot.nw moonshot.exe
```

(For more info, see node-webkit's [How to package and distribute your apps](https://github.com/rogerwang/node-webkit/wiki/How-to-package-and-distribute-your-apps).)
