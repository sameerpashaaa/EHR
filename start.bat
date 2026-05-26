@echo off
echo Starting Metapharsic EHR...
start /b cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:3000"
npm run dev
pause
