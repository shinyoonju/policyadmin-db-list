import type { Metadata } from 'next';
import { PolicyListItem } from '@/components/PolicyListItem';
import { PolicySearchForm } from '@/components/PolicySearchForm';
import { listPublicPolicies } from '@/lib/policy-store';
export const metadata: Metadata = { title: '정부지원금 정책 찾기', description: '정부지원금 정책을 검색하고 확인하세요.' };
type SearchParams = { q?: string; category?: string; region?: string };
export default async function PoliciesPage({ searchParams }: { searchParams: SearchParams }) {
  const policies = await listPublicPolicies(); const q = searchParams.q?.trim() || ''; const category = searchParams.category || '전체'; const region = searchParams.region || '전체';
  const categories = ['전체', ...Array.from(new Set(policies.map((policy) => policy.category)))] as string[];
  const regions = ['전체', ...Array.from(new Set(policies.map((policy) => policy.region)))] as string[];
  const filtered = policies.filter((policy) => (!q || [policy.title, policy.summary, ...policy.keywords].join(' ').includes(q)) && (category === '전체' || policy.category === category) && (region === '전체' || policy.region === region));
  return <main className="mx-auto max-w-6xl px-4 py-10">
    <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8"><p className="text-sm font-black text-brand">정책 검색</p><h1 className="mt-2 text-4xl font-black">정부지원금 찾기</h1><p className="mt-3 text-slate-600">키워드, 카테고리, 지역 기준으로 지원 정책을 확인하세요.</p><PolicySearchForm q={q} category={category} region={region} categories={categories} regions={regions} /></section>
    <div className="ad-box my-6">광고 영역</div>
    <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">검색 결과</h2><p className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-500 shadow-sm">총 <span className="text-brand">{filtered.length}</span>개</p></div><div className="space-y-4">{filtered.map((policy) => <PolicyListItem key={policy.id} policy={policy} />)}</div>{filtered.length === 0 && <div className="rounded-3xl bg-white p-10 text-center text-slate-500">검색 결과가 없습니다.</div>}</section>
  </main>;
}
