# 프로덕션 API 테스트 스크립트

Write-Host "프로덕션 API 테스트 중..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://cost-signal.vercel.app/api/signal" -Method GET -ContentType "application/json"
    
    Write-Host "✅ 성공!" -ForegroundColor Green
    Write-Host ""
    Write-Host "응답 내용:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ 에러 발생:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        Write-Host "에러 상세:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}



