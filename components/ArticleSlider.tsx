'use client';

import { useEffect, useRef } from 'react';
import type { Article } from '@/data/articles';
import { TrackedLink } from '@/components/TrackedLink';

export function ArticleSlider({ articles }: { articles: Article[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const featuredArticles = articles.slice(0, 8);

  const move = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const distance = Math.min(slider.clientWidth * 0.85, 720);
    const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 12;

    slider.scrollTo({
      left: direction === 1 && isAtEnd ? 0 : slider.scrollLeft + direction * distance,
      behavior: 'smooth'
    });
  };

  const stopAutoPlay = () => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    startTimerRef.current = null;
    autoPlayRef.current = null;
  };

  const startAutoPlay = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    stopAutoPlay();
    startTimerRef.current = setTimeout(() => {
      move(1);
      autoPlayRef.current = setInterval(() => move(1), 3000);
    }, 3000);
  };

  useEffect(() => stopAutoPlay, []);

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black text-brand">GUIDE</p>
          <h2 className="mt-2 text-3xl font-black">검색 유입용 정보글</h2>
        </div>
        <TrackedLink
          href="/contents/all"
          label="홈_정보글_전체보기"
          className="shrink-0 text-sm font-bold text-brand transition hover:opacity-70"
        >
          전체보기 <span aria-hidden="true">→</span>
        </TrackedLink>
      </div>

      <div
        className="relative mt-6"
        onMouseEnter={startAutoPlay}
        onMouseLeave={stopAutoPlay}
      >
        <div
          ref={sliderRef}
          className="article-slider flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
          aria-label="검색 유입용 정보글"
        >
          {featuredArticles.map((article) => (
            <TrackedLink
              key={article.slug}
              href={`/contents/${article.slug}`}
              label={`정보글_${article.title}`}
              className="group min-w-[82%] snap-start rounded-3xl border border-line p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-soft sm:min-w-[calc((100%_-_1rem)/2)] lg:min-w-[calc((100%_-_2rem)/3)]"
            >
              <p className="text-xs font-bold text-brand">{article.category}</p>
              <h3 className="mt-2 text-lg font-black text-ink group-hover:text-brand">{article.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{article.description}</p>
              <p className="mt-5 text-sm font-bold text-brand">자세히 보기 <span aria-hidden="true">→</span></p>
            </TrackedLink>
          ))}
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-lg text-ink transition hover:border-brand hover:text-brand"
            aria-label="이전 정보글 보기"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg text-white transition hover:opacity-85"
            aria-label="다음 정보글 보기"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
