import { NextRequest, NextResponse } from 'next/server';
import { getPolicyForAdmin, normalizePolicyInput } from '@/lib/admin';
import { prisma, isDbEnabled } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const policy = await getPolicyForAdmin(params.id);
  if (!policy) return NextResponse.json({ success: false, message: '정책을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json({ success: true, dbEnabled: isDbEnabled(), policy });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isDbEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DATABASE_URL 연결 후 수정할 수 있습니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const data = normalizePolicyInput({ ...body, id: params.id });
    const policy = await prisma.policy.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, policy });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '정책 수정 실패' },
      { status: 400 }
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!isDbEnabled()) {
    return NextResponse.json(
      { success: false, message: 'DATABASE_URL 연결 후 삭제할 수 있습니다.' },
      { status: 400 }
    );
  }

  try {
    await prisma.policy.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : '정책 삭제 실패' },
      { status: 400 }
    );
  }
}
