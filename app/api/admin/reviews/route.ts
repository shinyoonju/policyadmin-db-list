import { NextResponse } from 'next/server';
import { PolicyCheckLog, readLogs, SearchLog, MenuClickLog } from '@/lib/logger';
import { prisma, isDbEnabled } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isDbEnabled()) {
    const [policyChecks, searchLogs, menuClicks] = await Promise.all([
      prisma.policyCheck.findMany({ orderBy: { checkedAt: 'desc' }, take: 200 }),
      prisma.searchLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.menuClickLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    ]);

    return NextResponse.json({ dbEnabled: true, policyChecks, searchLogs, menuClicks });
  }

  return NextResponse.json({
    dbEnabled: false,
    policyChecks: readLogs<PolicyCheckLog>('policy-checks').slice(0, 200),
    searchLogs: readLogs<SearchLog>('search-logs').slice(0, 200),
    menuClicks: readLogs<MenuClickLog>('menu-clicks').slice(0, 200)
  });
}
