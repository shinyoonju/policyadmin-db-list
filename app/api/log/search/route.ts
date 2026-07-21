import { NextRequest, NextResponse } from 'next/server';
import { appendLog, clientIp, SearchLog } from '@/lib/logger';
import { policies } from '@/data/policies';
import { prisma, isDbEnabled } from '@/lib/prisma';

async function countResults(query: string, category: string, region: string) {
  if (isDbEnabled()) {
    return prisma.policy.count({
      where: {
        isActive: true,
        AND: [
          category === '전체' ? {} : { category },
          region === '전체' ? {} : { region },
          query
            ? {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { summary: { contains: query, mode: 'insensitive' } },
                  { keywords: { has: query } }
                ]
              }
            : {}
        ]
      }
    });
  }

  return policies.filter((policy) => {
    const matchesKeyword = !query || [policy.title, policy.summary, ...policy.keywords].join(' ').includes(query);
    const matchesCategory = category === '전체' || policy.category === category;
    const matchesRegion = region === '전체' || policy.region === region;
    return matchesKeyword && matchesCategory && matchesRegion;
  }).length;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const query = String(body?.query || '').trim();
  const category = String(body?.category || '전체');
  const region = String(body?.region || '전체');
  const resultCount = Number.isFinite(body?.resultCount)
    ? Number(body.resultCount)
    : await countResults(query, category, region);

  const log: SearchLog = {
    type: 'SEARCH',
    query,
    category,
    region,
    resultCount,
    path: body?.path ? String(body.path) : undefined,
    userAgent: request.headers.get('user-agent'),
    ip: clientIp(request.headers),
    createdAt: new Date().toISOString()
  };

  appendLog('search-logs', log);

  if (isDbEnabled()) {
    await prisma.searchLog.create({
      data: {
        query,
        category,
        region,
        resultCount,
        path: log.path,
        userAgent: log.userAgent || undefined,
        ip: log.ip || undefined
      }
    });
  }

  return NextResponse.json({ success: true, resultCount });
}
