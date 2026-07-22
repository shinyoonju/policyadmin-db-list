import { NextResponse } from 'next/server'; import { syncCentralWelfareDetails } from '@/lib/welfare-sync';
export const maxDuration = 60;
export async function POST() { try { return NextResponse.json({ success: true, ...(await syncCentralWelfareDetails(90)) }); } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : '상세 수집 실패' }, { status: 500 }); } }
