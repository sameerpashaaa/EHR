@echo off
echo Starting Metapharsic EHR...

echo Clearing Next.js cache to prevent readlink errors...
if exist .next rmdir /s /q .next

start /b cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:3000"
npm run dev
pause
