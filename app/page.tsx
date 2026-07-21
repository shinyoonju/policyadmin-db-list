import { TrackedLink } from '@/components/TrackedLink';
import { PolicyCard } from '@/components/PolicyCard';
import { JsonLd } from '@/components/JsonLd';
import { ArticleSlider } from '@/components/ArticleSlider';
import { policies } from '@/data/policies';
import { siteConfig } from '@/lib/site';

export default function HomePage() {
  const popularPolicies = policies.slice(0, 3);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/policies?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <section className="hero-motion overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div className="hero-copy">
            <p className="hero-reveal text-sm font-black text-brand">정부지원금 검색 사이트</p>
            <h1 className="hero-reveal hero-delay-1 mt-4 text-4xl font-black tracking-tight text-ink md:text-6xl">
              받을 수 있는 정책 지원금을 빠르게 확인하세요
            </h1>
            <p className="hero-reveal hero-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              청년, 근로자, 소상공인, 주거, 출산·육아 정책을 카테고리와 지역별로 정리한 정보 사이트입니다.
            </p>
            <div className="hero-reveal hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="/policies" label="홈_CTA_정책찾기" className="rounded-2xl bg-brand px-6 py-4 text-center font-bold text-white transition hover:-translate-y-1 hover:shadow-lg">정책 찾기</TrackedLink>
              <TrackedLink href="/contents" label="홈_CTA_정보글" className="rounded-2xl border border-line bg-white px-6 py-4 text-center font-bold text-ink transition hover:-translate-y-1 hover:shadow-md">SEO 정보글 보기</TrackedLink>
            </div>
          </div>
          <div className="hero-keyword-card rounded-[2rem] border border-line bg-soft p-6">
            <h2 className="text-xl font-black">인기 검색 키워드</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {['청년 월세 지원', '근로장려금', '국민내일배움카드', '소상공인 정책자금', '출산 지원금'].map((item, index) => (
                <TrackedLink key={item} href={`/policies?q=${encodeURIComponent(item)}`} label={`인기키워드_${item}`} className={`keyword-float keyword-delay-${index + 1} rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:text-brand`}>
                  {item}
                </TrackedLink>
              ))}
            </div>
            <div className="ad-box mt-6">광고 영역</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black text-brand">TOP 3</p>
            <h2 className="mt-2 text-3xl font-black">많이 찾는 정책</h2>
          </div>
          <TrackedLink href="/policies" label="홈_전체보기" className="text-sm font-bold text-brand">전체보기</TrackedLink>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {popularPolicies.map((policy) => <PolicyCard key={policy.id} policy={policy} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <ArticleSlider />
      </section>
    </main>
  );
}
