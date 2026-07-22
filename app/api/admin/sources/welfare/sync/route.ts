import { NextResponse } from 'next/server'; import { syncCentralWelfare } from '@/lib/welfare-sync';
export const maxDuration = 60;
export async function POST() { try { return NextResponse.json({ success: true, ...(await syncCentralWelfare()) }); } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : '동기화 실패' }, { status: 500 }); } }
