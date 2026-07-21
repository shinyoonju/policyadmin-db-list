import { NextResponse } from 'next/server';
import { isDbEnabled, prisma } from '@/lib/prisma';

const allowedStatuses = new Set(['APPROVED', 'NEEDS_CHANGES']);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isDbEnabled()) {
    return NextResponse.json({ message: 'DB 연결이 필요합니다.' }, { status: 503 });
  }

  const body = await request.json();
  const reviewerStatus = String(body.reviewerStatus || '');
  if (!allowedStatuses.has(reviewerStatus)) {
    return NextResponse.json({ message: '지원하지 않는 검토 상태입니다.' }, { status: 400 });
  }

  const check = await prisma.policyCheck.findUnique({ where: { id: params.id } });
  if (!check) return NextResponse.json({ message: '검수 기록을 찾을 수 없습니다.' }, { status: 404 });

  await prisma.$transaction([
    prisma.policyCheck.update({
      where: { id: params.id },
      data: { reviewerStatus, reviewedAt: new Date() }
    }),
    prisma.policy.update({
      where: { id: check.policyId },
      data: { reviewStatus: reviewerStatus }
    })
  ]);

  return NextResponse.json({ success: true, reviewerStatus });
}
