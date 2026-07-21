import type { Metadata } from 'next';
import { TrackedLink } from '@/components/TrackedLink';
import './globals.css';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | 정부지원금 검색`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: ['정부지원금', '청년 지원금', '근로장려금', '소상공인 정책자금', '복지 정책'],
  openGraph: {
    title: `${siteConfig.name} | 정부지원금 검색`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'ko_KR',
    type: 'website'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <TrackedLink href="/" label="로고" className="text-xl font-black text-ink">정책머니</TrackedLink>
            <nav className="flex gap-4 text-sm font-semibold text-slate-600">
              <TrackedLink href="/policies" label="상단메뉴_정책찾기">정책찾기</TrackedLink>
              <TrackedLink href="/contents" label="상단메뉴_정보글">정보글</TrackedLink>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">정책머니</p>
            <p className="mt-2">정책 정보는 변경될 수 있으므로 신청 전 공식 사이트에서 반드시 확인하세요.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
