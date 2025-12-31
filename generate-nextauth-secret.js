// NEXTAUTH_SECRET 생성 스크립트
const crypto = require('crypto');

// 32바이트 랜덤 문자열 생성 (Base64 인코딩)
const secret = crypto.randomBytes(32).toString('base64');

console.log('\n=== NEXTAUTH_SECRET 생성 완료 ===\n');
console.log('다음 값을 Vercel 환경 변수에 추가하세요:');
console.log('\n' + secret + '\n');
console.log('=====================================\n');
console.log('Vercel에서 추가할 환경 변수:');
console.log('1. NEXTAUTH_SECRET = ' + secret);
console.log('2. NEXTAUTH_URL = https://cost-signal.vercel.app\n');



