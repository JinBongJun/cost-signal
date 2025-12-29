// 환경 변수 확인 스크립트
console.log('=== 환경 변수 확인 ===\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'EIA_API_KEY',
  'FRED_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('필수 환경 변수:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // 민감한 정보는 일부만 표시
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`  ✅ ${varName}: ${masked}`);
    } else {
      console.log(`  ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`  ❌ ${varName}: 설정되지 않음`);
  }
});

console.log('\n=== 확인 완료 ===');
console.log('\nVercel에 이 변수들이 모두 설정되어 있는지 확인하세요:');
console.log('1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables');
console.log('2. 각 변수가 Production 환경에 설정되어 있는지 확인');
console.log('3. 변수 추가/수정 후 반드시 재배포 필요');


