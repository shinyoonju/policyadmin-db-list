import type { Metadata } from 'next';
import { QnaBoard } from '@/components/QnaBoard';
export const metadata: Metadata = { title: '정책 Q&A', description: '정부지원금과 정책 신청에 관한 질문과 경험을 나누는 Q&A 게시판입니다.' };
export default function QnaPage() { return <main className="mx-auto max-w-6xl px-4 py-10"><section className="mb-8 rounded-[2rem] bg-gradient-to-br from-sky-50 to-white p-7 md:p-10"><p className="text-sm font-black text-brand">정책 커뮤니티</p><h1 className="mt-2 text-4xl font-black">정책 Q&A</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">지원 자격, 신청 방법, 준비 서류에 대해 질문하고 이용자들의 경험을 나눠보세요.</p></section><QnaBoard /></main>; }
