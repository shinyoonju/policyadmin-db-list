import { NextResponse } from 'next/server';
import { readLogs, SearchLog, MenuClickLog } from '@/lib/logger';
import { prisma, isDbEnabled } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isDbEnabled()) {
    const [searchLogs, menuClicks] = await Promise.all([
      prisma.searchLog.findMany({ orderBy: { createdAt: 'desc' }, take: 300 }),
      prisma.menuClickLog.findMany({ orderBy: { createdAt: 'desc' }, take: 300 })
    ]);

    return NextResponse.json({ success: true, dbEnabled: true, searchLogs, menuClicks });
  }

  return NextResponse.json({
    success: true,
    dbEnabled: false,
    searchLogs: readLogs<SearchLog>('search-logs').slice(0, 300),
    menuClicks: readLogs<MenuClickLog>('menu-clicks').slice(0, 300)
  });
}
