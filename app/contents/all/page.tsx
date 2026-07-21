import type { Metadata } from 'next';
import Link from 'next/link';
import { articles } from '@/data/articles';

export const metadata: Metadata = {
  title: '정부지원금 정보글 전체 목록',
  description: '청년 지원금, 근로장려금, 소상공인 정책자금 정보글 전체 목록입니다.'
};

export default function AllContentsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <Link href="/contents" className="text-sm font-bold text-brand">← 추천 정보글</Link>
        <h1 className="mt-3 text-4xl font-black">정보글 전체 목록</h1>
        <p className="mt-3 text-slate-600">지원 정책과 신청 방법에 관한 모든 정보글을 확인해 보세요.</p>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">전체 콘텐츠</h2>
          <p className="text-sm text-slate-500">총 {articles.length}개</p>
        </div>
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/contents/${article.slug}`}
              className="block rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-brand hover:bg-blue-50/30"
            >
              <article className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand">{article.category}</p>
                  <h3 className="mt-3 text-lg font-black text-ink md:text-xl">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{article.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {article.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">{keyword}</span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">보기</span>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
