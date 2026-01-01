# Windows 작업 스케줄러 설정 스크립트
# PowerShell을 관리자 권한으로 실행하세요

$action = New-ScheduledTaskAction -Execute "node" -Argument "C:\Users\user\Desktop\cost signal\node_modules\.bin\tsx C:\Users\user\Desktop\cost signal\scripts\run-cron.ts" -WorkingDirectory "C:\Users\user\Desktop\cost signal"

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9am

$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -LogonType Interactive

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "CostSignalWeeklyUpdate" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Weekly economic data update for Cost Signal"

Write-Host "✅ 작업 스케줄러가 설정되었습니다!"
Write-Host "매주 월요일 오전 9시에 자동으로 데이터를 수집합니다."








