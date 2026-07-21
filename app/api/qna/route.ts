import { NextRequest, NextResponse } from 'next/server';
import { isDbEnabled, prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
const clean = (value: unknown, max: number) => String(value || '').trim().slice(0, max);
const tooManyLinks = (value: string) => (value.match(/https?:\/\//gi) || []).length > 2;
export async function GET() {
  if (!isDbEnabled()) return NextResponse.json({ questions: [], dbEnabled: false });
  const questions = await prisma.qnaQuestion.findMany({ where: { isVisible: true }, orderBy: { createdAt: 'desc' }, take: 100, include: { answers: { where: { isVisible: true }, orderBy: { createdAt: 'asc' } } } });
  return NextResponse.json({ questions, dbEnabled: true });
}
export async function POST(request: NextRequest) {
  if (!isDbEnabled()) return NextResponse.json({ message: 'DB 연결이 필요합니다.' }, { status: 503 });
  const body = await request.json().catch(() => null); if (body?.website) return NextResponse.json({ success: true });
  const nickname = clean(body?.nickname, 20); const title = clean(body?.title, 80); const content = clean(body?.content, 1500); const category = clean(body?.category, 20) || '정책문의';
  if (nickname.length < 2 || title.length < 2 || content.length < 5) return NextResponse.json({ message: '닉네임, 제목, 질문 내용을 입력하세요.' }, { status: 400 });
  if (tooManyLinks(`${title} ${content}`)) return NextResponse.json({ message: '링크는 최대 2개까지 입력할 수 있습니다.' }, { status: 400 });
  const question = await prisma.qnaQuestion.create({ data: { nickname, title, content, category } });
  return NextResponse.json({ success: true, question }, { status: 201 });
}
