#!/bin/bash
cd source

if [ "$(uname)" == "Darwin" ]; then
	rm -rf ../node-webkit.app/Contents/Resources/app.nw
	cp -R ./ ../node-webkit.app/Contents/Resources/app.nw
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	zip -r ../moonshot.nw *
	cd ..
	cat nw moonshot.nw > moonshot
	chmod u+x moonshot
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
	pkzip -r ..\moonshot.nw *.*
	cd ..
	copy /b nw.exe+moonshot.nw moonshot.exe
elif [ "$(expr substr $(uname -s) 1 9)" == "CYGWIN_NT" ]; then
	zip -r ../moonshot.nw *
	cd ..
	cat nw.exe moonshot.nw > moonshot.exe
fi

