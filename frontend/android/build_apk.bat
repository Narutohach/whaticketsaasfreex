@echo off
set "JAVA_HOME=C:\Users\Daniel\.jdks\corretto-21.0.6"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0"
call gradlew.bat -Dorg.gradle.java.home="C:\Users\Daniel\.jdks\corretto-21.0.6" assembleDebug
