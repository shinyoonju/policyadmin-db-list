import { NextRequest, NextResponse } from 'next/server';
import { appendLog, clientIp, MenuClickLog } from '@/lib/logger';
import { prisma, isDbEnabled } from '@/lib/prisma';
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.label || !body?.href) return NextResponse.json({ success: false, message: 'label과 href가 필요합니다.' }, { status: 400 });
  const log: MenuClickLog = { type: 'MENU_CLICK', label: String(body.label), href: String(body.href), path: body.path ? String(body.path) : undefined, userAgent: request.headers.get('user-agent'), ip: clientIp(request.headers), createdAt: new Date().toISOString() };
  appendLog('menu-clicks', log);
  if (isDbEnabled()) await prisma.menuClickLog.create({ data: { label: log.label, href: log.href, path: log.path, userAgent: log.userAgent || undefined, ip: log.ip || undefined } });
  return NextResponse.json({ success: true });
}
