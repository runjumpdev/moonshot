#!/bin/bash
if [ "$(uname)" == "Darwin" ]; then
				zip -r moonshot.nw source/*
				cat node-webkit.app/Contents/MacOS/node-webkit moonshot.nw > moonshot
				chmod u+x moonshot        
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
				zip -r moonshot.nw source/*
				cat nw moonshot.nw > moonshot
				chmod u+x moonshot        
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    cd source
    pkzip -r ..\moonshot.nw *.*
    cd ..
				copy /b nw.exe+moonshot.nw moonshot.exe
fi

