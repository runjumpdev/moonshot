#!/bin/bash
if [ "$(uname)" == "Darwin" ]; then
				cd source
				zip -r ../moonshot.nw *
				cd ..
				cat node-webkit.app/Contents/MacOS/node-webkit moonshot.nw > moonshot
				chmod u+x moonshot        
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
				cd source
				zip -r ../moonshot.nw *
				cd .. 
				cat nw moonshot.nw > moonshot
				chmod u+x moonshot        
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
				cd source
				pkzip -r ..\moonshot.nw *.*
				cd ..
				copy /b nw.exe+moonshot.nw moonshot.exe
fi

