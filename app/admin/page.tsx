import Link from 'next/link';
import { listPoliciesForAdmin } from '@/lib/admin';
import { isDbEnabled, prisma } from '@/lib/prisma';

export const metadata = {
  title: '관리자 대시보드 | 정책머니'
};

export default async function AdminPage() {
  const policies = await listPoliciesForAdmin();
  let searchLogCount = 0;
  let menuLogCount = 0;
  let checkCount = 0;

  if (isDbEnabled()) {
    [searchLogCount, menuLogCount, checkCount] = await Promise.all([
      prisma.searchLog.count(),
      prisma.menuClickLog.count(),
      prisma.policyCheck.count()
    ]);
  }

  const cards = [
    { label: '정책 수', value: policies.length },
    { label: '검색 로그', value: searchLogCount },
    { label: '메뉴 로그', value: menuLogCount },
    { label: '검수 로그', value: checkCount }
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 rounded-3xl bg-slate-950 p-8 text-white">
        <p className="text-sm text-slate-300">Admin</p>
        <h1 className="mt-2 text-3xl font-bold">관리자 대시보드</h1>
        <p className="mt-3 text-slate-300">
          정책 등록, 수정, 검수 결과, 검색/메뉴 로그를 관리합니다.
        </p>
        <p className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
          DB 상태: {isDbEnabled() ? 'Supabase 연결됨' : '미연결 · 샘플 데이터 모드'}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/admin/policies" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">정책 관리</h2>
          <p className="mt-2 text-sm text-slate-600">정책 등록, 수정, 삭제</p>
        </Link>
        <Link href="/admin/reviews" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">검수 결과</h2>
          <p className="mt-2 text-sm text-slate-600">스케줄러 검수 로그 확인</p>
        </Link>
        <Link href="/admin/logs" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-xl font-bold">사용자 로그</h2>
          <p className="mt-2 text-sm text-slate-600">검색어와 메뉴 클릭 확인</p>
        </Link>
      </section>
    </main>
  );
}
