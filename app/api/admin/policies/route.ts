import { NextRequest, NextResponse } from 'next/server';
import { listPoliciesForAdmin, normalizePolicyInput } from '@/lib/admin';
import { prisma, isDbEnabled } from '@/lib/prisma';

export async function GET() {
  const policies = await listPoliciesForAdmin();
  return NextResponse.json({ success: true, dbEnabled: isDbEnabled(), policies });
}

export async function POST(request: NextRequest) {
  if (!isDbEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DATABASE_URL 연결 후 등록할 수 있습니다. 현재는 샘플 데이터 조회만 가능합니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = normalizePolicyInput(body);
    const policy = await prisma.policy.create({ data });
    return NextResponse.json({ success: true, policy });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '정책 등록 실패' },
      { status: 400 }
    );
  }
}
