import type { Metadata } from 'next';
import { ArticleSlider } from '@/components/ArticleSlider';
import { listPublishedArticles } from '@/lib/article-store';

export const metadata: Metadata = {
  title: '정부지원금 정보글',
  description: '구글 검색 유입을 위한 청년 지원금, 근로장려금, 소상공인 정책자금 정보글 모음입니다.'
};

export default async function ContentsPage() {
  const articles = await listPublishedArticles();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ArticleSlider articles={articles} />
      <div className="ad-box mt-6">광고 영역</div>
    </main>
  );
}
