import type { Metadata } from 'next';
import { MenuClickLog, PolicyCheckLog, readLogs, SearchLog } from '@/lib/logger';
import { isDbEnabled, prisma } from '@/lib/prisma';
import { ReviewTable } from '@/components/ReviewTable';
import { WelfareSyncButton } from '@/components/WelfareSyncButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '관리자 검수·로그',
  description: '정책 검수 결과, 검색 로그, 메뉴 클릭 로그를 확인합니다.'
};

export default async function AdminReviewsPage() {
  let policyChecks: PolicyCheckLog[] = [];
  let searchLogs: SearchLog[] = [];
  let menuClicks: MenuClickLog[] = [];

  if (isDbEnabled()) {
    const [dbChecks, dbSearchLogs, dbMenuClicks] = await Promise.all([
      prisma.policyCheck.findMany({ orderBy: { checkedAt: 'desc' }, take: 50 }),
      prisma.searchLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.menuClickLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    ]);

    policyChecks = dbChecks.map((item) => ({
      id: item.id,
      type: 'POLICY_CHECK',
      policyId: item.policyId,
      title: item.title,
      category: '',
      region: '',
      officialUrl: item.officialUrl,
      httpStatus: item.httpStatus,
      checkStatus: item.checkStatus as PolicyCheckLog['checkStatus'],
      reasons: Array.isArray(item.reasons) ? item.reasons.map(String) : [],
      sourceHash: item.sourceHash,
      oldSnapshot: item.oldSnapshot,
      newSnapshot: item.newSnapshot,
      diffSummary: item.diffSummary,
      reviewerStatus: item.reviewerStatus,
      checkedAt: item.checkedAt.toISOString()
    }));
    searchLogs = dbSearchLogs.map((item) => ({
      type: 'SEARCH',
      query: item.query,
      category: item.category,
      region: item.region,
      resultCount: item.resultCount,
      path: item.path || undefined,
      userAgent: item.userAgent,
      ip: item.ip,
      createdAt: item.createdAt.toISOString()
    }));
    menuClicks = dbMenuClicks.map((item) => ({
      type: 'MENU_CLICK',
      label: item.label,
      href: item.href,
      path: item.path || undefined,
      userAgent: item.userAgent,
      ip: item.ip,
      createdAt: item.createdAt.toISOString()
    }));
  } else {
    policyChecks = readLogs<PolicyCheckLog>('policy-checks').slice(0, 50);
    searchLogs = readLogs<SearchLog>('search-logs').slice(0, 50);
    menuClicks = readLogs<MenuClickLog>('menu-clicks').slice(0, 50);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-black text-brand">ADMIN</p>
        <h1 className="mt-2 text-4xl font-black">검수 결과·사용자 로그</h1>
        <p className="mt-3 text-slate-600">
          {isDbEnabled()
            ? '현재 Supabase DB에 저장된 검수 결과와 사용자 로그를 표시합니다.'
            : <>현재 샘플 모드이며 <code className="rounded bg-soft px-1">.logs</code> 폴더의 개발용 기록을 표시합니다.</>}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <WelfareSyncButton />
          <a href="/api/cron/verify-policies" target="_blank" className="rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white">
            정책 검수 API 실행
          </a>
          <a href="/api/admin/reviews" target="_blank" className="rounded-2xl border border-line px-5 py-3 text-sm font-bold text-ink">
            JSON 로그 보기
          </a>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-2xl font-black">정책 자동 검수 최근 50건</h2>
        <ReviewTable checks={policyChecks} />
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">검색 로그</h2>
          <div className="mt-5 space-y-3">
            {searchLogs.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="rounded-2xl border border-line p-4 text-sm">
                <p className="font-bold">{item.query || '(빈 검색어)'}</p>
                <p className="mt-1 text-slate-500">{item.category} · {item.region} · 결과 {item.resultCount}개</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('ko-KR')}</p>
              </div>
            ))}
            {searchLogs.length === 0 && <p className="py-8 text-center text-slate-500">아직 검색 로그가 없습니다.</p>}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">메뉴 클릭 로그</h2>
          <div className="mt-5 space-y-3">
            {menuClicks.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="rounded-2xl border border-line p-4 text-sm">
                <p className="font-bold">{item.label}</p>
                <p className="mt-1 text-slate-500">{item.href}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('ko-KR')}</p>
              </div>
            ))}
            {menuClicks.length === 0 && <p className="py-8 text-center text-slate-500">아직 메뉴 클릭 로그가 없습니다.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
