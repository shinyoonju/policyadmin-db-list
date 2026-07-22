import { NextResponse } from 'next/server'; import { syncCentralWelfareDetails } from '@/lib/welfare-sync';
export const dynamic = 'force-dynamic'; export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try { return NextResponse.json({ success: true, ...(await syncCentralWelfareDetails(90)) }); }
  catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : '상세 수집 실패' }, { status: 500 }); }
}
