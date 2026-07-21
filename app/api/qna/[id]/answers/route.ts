import { NextRequest, NextResponse } from 'next/server';
import { isDbEnabled, prisma } from '@/lib/prisma';
const clean = (value: unknown, max: number) => String(value || '').trim().slice(0, max);
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isDbEnabled()) return NextResponse.json({ message: 'DB 연결이 필요합니다.' }, { status: 503 });
  const body = await request.json().catch(() => null); if (body?.website) return NextResponse.json({ success: true });
  const nickname = clean(body?.nickname, 20); const content = clean(body?.content, 1000);
  if (nickname.length < 2 || content.length < 2) return NextResponse.json({ message: '닉네임과 답변을 입력하세요.' }, { status: 400 });
  if ((content.match(/https?:\/\//gi) || []).length > 2) return NextResponse.json({ message: '링크는 최대 2개까지 입력할 수 있습니다.' }, { status: 400 });
  const question = await prisma.qnaQuestion.findFirst({ where: { id: params.id, isVisible: true }, select: { id: true } });
  if (!question) return NextResponse.json({ message: '질문을 찾을 수 없습니다.' }, { status: 404 });
  const answer = await prisma.qnaAnswer.create({ data: { questionId: question.id, nickname, content } });
  return NextResponse.json({ success: true, answer }, { status: 201 });
}
