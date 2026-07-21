import { NextResponse } from 'next/server';
import { policies as samplePolicies } from '@/data/policies';
import { appendLog, PolicyCheckLog } from '@/lib/logger';
import { prisma, isDbEnabled } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const unstableDeadlineWords = ['상이', '확인', '공고', '소진', '변경'];

async function checkUrl(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal
    }).catch(async () => {
      return fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: controller.signal
      });
    });

    clearTimeout(timeout);
    return response.status;
  } catch {
    return null;
  }
}

async function getPoliciesForCheck() {
  if (!isDbEnabled()) return samplePolicies;
  const rows = await prisma.policy.findMany({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    region: row.region,
    amount: row.amount,
    deadline: row.deadline,
    summary: row.summary,
    target: row.target,
    documents: row.documents,
    applyUrl: row.applyUrl,
    keywords: row.keywords
  }));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const checkedAt = new Date().toISOString();
  const policies = await getPoliciesForCheck();

  const results = await Promise.all(
    policies.map(async (policy) => {
      const httpStatus = await checkUrl(policy.applyUrl);
      const reasons: string[] = [];

      if (httpStatus === null) reasons.push('공식 링크 접속 실패');
      if (httpStatus !== null && httpStatus >= 400) reasons.push(`공식 링크 HTTP ${httpStatus}`);
      if (unstableDeadlineWords.some((word) => policy.deadline.includes(word))) {
        reasons.push('신청 기간이 고정값이 아니므로 수동 검수 필요');
      }
      if (policy.amount.includes('상이') || policy.amount.includes('공고')) {
        reasons.push('지원 금액이 공고별로 달라 수동 검수 필요');
      }

      const checkStatus: PolicyCheckLog['checkStatus'] =
        httpStatus === null || (httpStatus !== null && httpStatus >= 400)
          ? 'ERROR'
          : reasons.length > 0
            ? 'NEED_REVIEW'
            : 'OK';

      return {
        type: 'POLICY_CHECK',
        policyId: policy.id,
        title: policy.title,
        category: policy.category,
        region: policy.region,
        officialUrl: policy.applyUrl,
        httpStatus,
        checkStatus,
        reasons,
        checkedAt
      } satisfies PolicyCheckLog;
    })
  );

  for (const result of results) {
    appendLog('policy-checks', result);
  }

  if (isDbEnabled()) {
    await Promise.all(
      results.map((result) =>
        prisma.policyCheck.create({
          data: {
            policyId: result.policyId,
            title: result.title,
            officialUrl: result.officialUrl,
            httpStatus: result.httpStatus,
            checkStatus: result.checkStatus,
            reasons: result.reasons,
            diffSummary: result.reasons.join(', ') || '변경 의심 없음'
          }
        })
      )
    );

    await Promise.all(
      results.map((result) =>
        prisma.policy.update({
          where: { id: result.policyId },
          data: {
            lastCheckedAt: new Date(checkedAt),
            reviewStatus: result.checkStatus === 'OK' ? 'APPROVED' : 'NEED_REVIEW'
          }
        })
      )
    );
  }

  return NextResponse.json({
    success: true,
    dbEnabled: isDbEnabled(),
    checkedCount: results.length,
    needReviewCount: results.filter((item) => item.checkStatus === 'NEED_REVIEW').length,
    errorCount: results.filter((item) => item.checkStatus === 'ERROR').length,
    results
  });
}
