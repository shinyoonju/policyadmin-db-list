import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { policies } from '@/data/policies';
import { getPublicPolicyById } from '@/lib/policy-store';
import { siteConfig } from '@/lib/site';

export function generateStaticParams() {
  return policies.map((policy) => ({ id: policy.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const policy = await getPublicPolicyById(params.id);
  if (!policy) return {};

  return {
    title: `${policy.title} 신청 대상과 방법`,
    description: `${policy.title}의 지원 대상, 지원 금액, 신청 기간, 필요 서류, 신청 방법을 정리했습니다.`,
    keywords: policy.keywords,
    alternates: {
      canonical: `/policies/${policy.id}`
    },
    openGraph: {
      title: `${policy.title} 신청 대상과 방법`,
      description: policy.summary,
      url: `${siteConfig.url}/policies/${policy.id}`,
      type: 'article'
    }
  };
}

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  const policy = await getPublicPolicyById(params.id);
  if (!policy) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${policy.title} 신청 대상과 방법`,
    description: policy.summary,
    mainEntityOfPage: `${siteConfig.url}/policies/${policy.id}`,
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: { '@type': 'Organization', name: siteConfig.name },
    dateModified: new Date().toISOString()
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd data={jsonLd} />
      <Link href="/policies" className="text-sm font-bold text-brand">← 정책 목록</Link>
      <article className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm md:p-10">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-brand">{policy.category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{policy.region}</span>
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight">{policy.title} 신청 대상과 방법</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{policy.summary}</p>

        <div className="ad-box my-8">광고 영역</div>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-soft p-5">
            <p className="text-sm text-slate-500">지원 금액</p>
            <p className="mt-1 text-xl font-black">{policy.amount}</p>
          </div>
          <div className="rounded-3xl bg-soft p-5">
            <p className="text-sm text-slate-500">신청 기간</p>
            <p className="mt-1 text-xl font-black">{policy.deadline}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">지원 대상</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            {policy.target.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">필요 서류</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            {policy.documents.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">신청 방법</h2>
          <p className="mt-4 leading-8 text-slate-700">공식 신청 페이지에서 신청 가능 여부와 최신 공고를 확인한 뒤 접수하세요.</p>
          <a href={policy.applyUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-brand px-6 py-4 font-bold text-white">
            공식 사이트 확인
          </a>
        </section>

        <section className="mt-8 rounded-3xl border border-line p-5">
          <h2 className="text-xl font-black">자주 묻는 질문</h2>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-bold">신청 기간이 지나면 신청할 수 있나요?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">대부분 신청 기간 이후에는 접수가 어렵습니다. 추가 모집이나 다음 공고를 확인해야 합니다.</p>
            </div>
            <div>
              <h3 className="font-bold">정보가 변경될 수 있나요?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">지원 금액, 대상, 기간은 공고에 따라 변경될 수 있습니다. 신청 전 공식 사이트 확인이 필요합니다.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
