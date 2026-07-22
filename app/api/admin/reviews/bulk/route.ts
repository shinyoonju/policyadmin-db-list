import { NextResponse } from 'next/server';
import { isDbEnabled, prisma } from '@/lib/prisma';
import { pendingPolicyFromSnapshot } from '@/lib/welfare-sync';

export async function PATCH(request: Request) {
  if (!isDbEnabled()) return NextResponse.json({ message: 'DB 연결이 필요합니다.' }, { status: 503 });

  const body = await request.json();
  const ids: string[] = Array.isArray(body.ids)
    ? Array.from(new Set<string>(body.ids.map((id: unknown) => String(id)))).slice(0, 100)
    : [];
  if (!ids.length || body.reviewerStatus !== 'APPROVED') {
    return NextResponse.json({ message: '승인할 검수 항목을 선택하세요.' }, { status: 400 });
  }

  const checks = await prisma.policyCheck.findMany({
    where: { id: { in: ids } },
    select: { id: true, policyId: true, newSnapshot: true }
  });
  if (!checks.length) return NextResponse.json({ message: '검수 기록을 찾을 수 없습니다.' }, { status: 404 });

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.policyCheck.updateMany({
      where: { id: { in: checks.map((item) => item.id) } },
      data: { reviewerStatus: 'APPROVED', reviewedAt: now }
    });
    for (const check of checks) {
      const importedPolicy = pendingPolicyFromSnapshot(check.newSnapshot);
      await tx.policy.update({ where: { id: check.policyId }, data: importedPolicy ? { ...importedPolicy, isActive: true, reviewStatus: 'APPROVED', lastCheckedAt: now } : { reviewStatus: 'APPROVED' } });
    }
  });

  return NextResponse.json({ success: true, updatedCount: checks.length });
}
