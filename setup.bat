@echo off
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
echo [A] Continue
echo [B] Quit
set /p ch=A or B: 
if %ch%==a goto continue
if %ch%==A goto continue
if %ch%==b goto quit
if %ch%==B goto quit
:quit
exit
:continue
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
set /p installmodule=Install npm Modules? Modules are required to run the app. Installation is required only for first setup, and possibly some updates. (0/1) 
if %installmodule%==0 goto skipmodules
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
echo Installing npm Modules...
echo.
call npm install
:skipmodules
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
if %installmodule%==1 echo.
set /p port=Please type a port (0 for default) 
if %port%==0 SET /A port = 3001
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo.
pause
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Creating / Updating files...
echo.
set /p autocomptoken=Preset bot token? (0/1)
if %autocomptoken%==0 goto skippresetbott
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Creating / Updating files...
echo.
set /p tokenval=Discord Bot Token: 
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Creating / Updating files...
if %autocomptoken%==1 echo -Bot Token Set
echo.
pause
:skippresetbott
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Creating / Updating files...
if %autocomptoken%==1 echo -Bot Token Set
echo.
set /p autolaunchpanel=Auto launch panel on start? (0/1) 
echo {"port": %port% > config.json
if %autocomptoken%==1 echo ,"token": "%tokenval%" >> config.json
echo } >> config.json
echo @echo off > start.bat
if %autolaunchpanel%==0 goto noautostart
if %autolaunchpanel%==1 goto autostartc
:autostartc
echo start http://127.0.0.1:%port% >> start.bat
:noautostart
echo node app.js >> start.bat
echo pause >> start.bat
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Files created
if %autocomptoken%==1 echo -Bot Token Set
if %autolaunchpanel%==1 echo -Webpanel will be opened when server is started
echo.
set /p runwhendone=Start server when setup is finished? (0/1)
cls
echo =========================
echo  Discord Bot Panel Setup
echo =========================
echo.
if %installmodule%==1 echo -npm Modules Installed / Updated
echo -Port saved
echo -Files created
if %autocomptoken%==1 echo -Bot Token Set
if %autolaunchpanel%==1 echo -Webpanel will be opened when server is started
if %runwhendone%==1 echo -Server will start when setup is finished
echo.
if %runwhendone%==0 goto skiprunning
if %runwhendone%==1 goto runwhendones
:skiprunning
echo Completed! Run start.bat to start the server.
echo.
pause
exit
:runwhendones
echo Completed! Server will start when setup closes.
echo.
pause
start start.bat
exit