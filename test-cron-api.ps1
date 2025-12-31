# Cron API 테스트 스크립트

Write-Host "주간 데이터 업데이트 테스트 중..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://cost-signal.vercel.app/api/cron" -Method POST -ContentType "application/json"
    
    Write-Host "✅ 성공!" -ForegroundColor Green
    Write-Host ""
    Write-Host "응답 내용:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    Write-Host "Supabase에서 새로운 데이터를 확인하세요!" -ForegroundColor Green
} catch {
    Write-Host "❌ 에러 발생:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        Write-Host "에러 상세:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
    Write-Host ""
    Write-Host "Vercel 로그를 확인하세요:" -ForegroundColor Yellow
    Write-Host "Vercel → Logs → Functions → /api/cron" -ForegroundColor Cyan
}



