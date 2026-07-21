import Image from 'next/image';
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
      <section className="hero-motion overflow-hidden bg-[radial-gradient(circle_at_85%_18%,#e8f6ff_0,transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fcff_100%)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
          <div className="hero-copy self-center">
            <p className="hero-reveal inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-brand">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> 정부지원금 검색 사이트
            </p>
            <h1 className="hero-reveal hero-delay-1 mt-4 text-4xl font-black tracking-tight text-ink md:text-6xl">
              받을 수 있는 정책 지원금을 빠르게 확인하세요
            </h1>
            <p className="hero-reveal hero-delay-2 mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              청년, 근로자, 소상공인, 주거, 출산·육아 정책을 카테고리와 지역별로 정리한 정보 사이트입니다.
            </p>
            <div className="hero-reveal hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink href="/policies" label="홈_CTA_정책찾기" className="rounded-2xl bg-brand px-6 py-4 text-center font-bold text-white shadow-lg shadow-brand/15 transition hover:-translate-y-1 hover:bg-[#0b2c4e]">내 지원금 찾아보기</TrackedLink>
              <TrackedLink href="/contents" label="홈_CTA_정보글" className="rounded-2xl border border-line bg-white px-6 py-4 text-center font-bold text-ink transition hover:-translate-y-1 hover:shadow-md">SEO 정보글 보기</TrackedLink>
            </div>
          </div>
          <div className="hero-keyword-card relative min-h-[430px] overflow-hidden rounded-[2.5rem] border border-sky-100 bg-white p-6 shadow-xl shadow-sky-900/5">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-100/70" />
            <div className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-blue-50" />
            <div className="relative z-10 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
              <p className="text-xs font-black text-brand">정책 안내원 머니</p>
              <p className="mt-1 break-keep text-lg font-black leading-6 text-ink">놓치고 있는 지원금,<br />제가 함께 찾아드릴게요!</p>
            </div>
            <div className="relative z-10 mt-4 grid grid-cols-[0.8fr_1.2fr] items-center gap-2">
              <div className="flex flex-col items-start gap-2">
                <p className="mb-1 text-xs font-black text-slate-400">인기 검색어</p>
                {['청년 월세 지원', '근로장려금', '국민내일배움카드', '소상공인 정책자금', '출산 지원금'].map((item, index) => (
                  <TrackedLink key={item} href={`/policies?q=${encodeURIComponent(item)}`} label={`인기키워드_${item}`} className={`keyword-float keyword-delay-${index + 1} rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:text-brand`}>
                    {item}
                  </TrackedLink>
                ))}
              </div>
              <div className="flex h-[245px] items-center justify-center">
                <Image
                  src="/images/policy-owl-mascot.png"
                  alt="정책머니 마스코트 부엉이 머니"
                  width={360}
                  height={360}
                  priority
                  className="owl-mascot h-full w-full object-contain drop-shadow-xl"
                />
              </div>
            </div>
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
