import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { policies as samplePolicies } from '@/data/policies';
import { appendLog, PolicyCheckLog, readLogs } from '@/lib/logger';
import { prisma, isDbEnabled } from '@/lib/prisma';
import { syncCentralWelfare } from '@/lib/welfare-sync';

export const dynamic = 'force-dynamic';

const unstableDeadlineWords = ['상이', '확인', '공고', '소진', '변경'];

type SourceResult = {
  httpStatus: number | null;
  snapshot: string | null;
  sourceHash: string | null;
};

function normalizeSource(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}

function hashSource(snapshot: string) {
  return createHash('sha256').update(snapshot).digest('hex');
}

async function inspectSource(url: string): Promise<SourceResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'User-Agent': 'PolicyMoneyVerifier/1.0 (+policy information monitoring)' }
    });

    clearTimeout(timeout);
    if (!response.ok) return { httpStatus: response.status, snapshot: null, sourceHash: null };

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { httpStatus: response.status, snapshot: null, sourceHash: null };
    }

    const snapshot = normalizeSource(await response.text());
    return {
      httpStatus: response.status,
      snapshot,
      sourceHash: snapshot ? hashSource(snapshot) : null
    };
  } catch {
    return { httpStatus: null, snapshot: null, sourceHash: null };
  }
}

async function getPreviousCheck(policyId: string) {
  if (isDbEnabled()) {
    return prisma.policyCheck.findFirst({
      where: { policyId, sourceHash: { not: null } },
      orderBy: { checkedAt: 'desc' },
      select: { sourceHash: true, newSnapshot: true }
    });
  }

  return readLogs<PolicyCheckLog>('policy-checks').find(
    (item) => item.policyId === policyId && item.sourceHash
  ) || null;
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

  let welfareSync: Awaited<ReturnType<typeof syncCentralWelfare>> | { skipped: true; reason: string } = {
    skipped: true,
    reason: 'DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.'
  };
  if (isDbEnabled() && (process.env.DATA_GO_KR_SERVICE_KEY || process.env.WELFARE_API_SERVICE_KEY)) {
    try {
      welfareSync = await syncCentralWelfare();
    } catch (error) {
      welfareSync = { skipped: true, reason: error instanceof Error ? error.message : '복지 API 수집 실패' };
    }
  }

  const checkedAt = new Date().toISOString();
  const policies = await getPoliciesForCheck();

  const results = await Promise.all(
    policies.map(async (policy) => {
      const source = await inspectSource(policy.applyUrl);
      const previous = await getPreviousCheck(policy.id);
      const httpStatus = source.httpStatus;
      const reasons: string[] = [];

      if (httpStatus === null) reasons.push('공식 링크 접속 실패');
      if (httpStatus !== null && httpStatus >= 400) reasons.push(`공식 링크 HTTP ${httpStatus}`);
      const sourceUrl = new URL(policy.applyUrl);
      if (sourceUrl.pathname === '/' || sourceUrl.pathname === '') {
        reasons.push('정책별 상세 공고가 아닌 기관 대표 URL이므로 출처 보완 필요');
      }
      if (unstableDeadlineWords.some((word) => policy.deadline.includes(word))) {
        reasons.push('신청 기간이 고정값이 아니므로 수동 검수 필요');
      }
      if (policy.amount.includes('상이') || policy.amount.includes('공고')) {
        reasons.push('지원 금액이 공고별로 달라 수동 검수 필요');
      }

      const sourceChanged = Boolean(
        previous?.sourceHash && source.sourceHash && previous.sourceHash !== source.sourceHash
      );
      if (sourceChanged) reasons.push('공식 페이지 본문 변경 감지');

      const checkStatus: PolicyCheckLog['checkStatus'] =
        httpStatus === null || (httpStatus !== null && httpStatus >= 400)
          ? 'LINK_ERROR'
          : sourceChanged
            ? 'SOURCE_CHANGED'
            : reasons.length > 0
              ? 'NEED_REVIEW'
              : 'OK';

      const diffSummary = sourceChanged
        ? `본문 해시 변경: ${previous?.sourceHash?.slice(0, 10)} → ${source.sourceHash?.slice(0, 10)}`
        : reasons.join(', ') || '변경 의심 없음';

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
        sourceHash: source.sourceHash,
        oldSnapshot: previous?.newSnapshot || null,
        newSnapshot: source.snapshot,
        diffSummary,
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
            diffSummary: result.diffSummary,
            sourceHash: result.sourceHash,
            oldSnapshot: result.oldSnapshot,
            newSnapshot: result.newSnapshot
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
            reviewStatus: result.checkStatus === 'OK' ? 'APPROVED' : result.checkStatus
          }
        })
      )
    );
  }

  return NextResponse.json({
    success: true,
    welfareSync,
    dbEnabled: isDbEnabled(),
    checkedCount: results.length,
    needReviewCount: results.filter((item) => item.checkStatus === 'NEED_REVIEW').length,
    changedCount: results.filter((item) => item.checkStatus === 'SOURCE_CHANGED').length,
    errorCount: results.filter((item) => ['ERROR', 'LINK_ERROR'].includes(item.checkStatus)).length,
    results
  });
}
