@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

call ionic build
call npx cap sync android
cd android
call .\gradlew.bat assembleDebug
call adb install -r app\build\outputs\apk\debug\app-debug.apk
cd ..
echo ✅ App installée sur le téléphone !
pause