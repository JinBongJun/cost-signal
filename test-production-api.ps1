# 프로덕션 API 테스트 스크립트

Write-Host "프로덕션에서 데이터 생성 중..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://cost-signal.vercel.app/api/cron" -Method POST -ContentType "application/json"
    
    Write-Host "성공!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "에러 발생:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "응답 내용:" -ForegroundColor Yellow
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host "사이트를 새로고침하여 데이터를 확인하세요: https://cost-signal.vercel.app" -ForegroundColor Cyan


