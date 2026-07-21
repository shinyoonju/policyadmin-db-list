import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, getArticleBySlug } from '@/data/articles';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/lib/site';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `/contents/${article.slug}`
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${siteConfig.url}/contents/${article.slug}`,
      type: 'article'
    }
  };
}

export default function ContentDetailPage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    mainEntityOfPage: `${siteConfig.url}/contents/${article.slug}`,
    author: { '@type': 'Organization', name: siteConfig.name },
    publisher: { '@type': 'Organization', name: siteConfig.name },
    dateModified: new Date().toISOString()
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <JsonLd data={jsonLd} />
      <Link href="/contents" className="text-sm font-bold text-brand">← 정보글 목록</Link>
      <article className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black text-brand">{article.category}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{article.title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{article.description}</p>

        <div className="ad-box my-8">광고 영역</div>

        <div className="space-y-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-black">{section.heading}</h2>
              <p className="mt-3 leading-8 text-slate-700">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-3xl bg-soft p-5">
          <h2 className="text-xl font-black">관련 키워드</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <Link key={keyword} href={`/policies?q=${encodeURIComponent(keyword)}`} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700">
                {keyword}
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
