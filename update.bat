@echo off
REM Fetch and merge the latest changes from the remote repository
git fetch --all
git pull --ff-only
pause
