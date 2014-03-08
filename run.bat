@echo off

if exist{moonshot.exe} (
  moonshot
) else (
  nw .\source
)
