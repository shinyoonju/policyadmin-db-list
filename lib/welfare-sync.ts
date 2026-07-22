import { createHash } from 'crypto';
import { prisma, isDbEnabled } from '@/lib/prisma';

const BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const decodeXml = (value: string) => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml: string, names: string[]) => { for (const name of names) { const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i')); if (match) return decodeXml(match[1]); } return ''; };
const blocks = (xml: string) => { for (const name of ['servList', 'item']) { const values = Array.from(xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi')), (match) => match[1]); if (values.length) return values; } return []; };
const cleanKey = (key: string) => { try { return decodeURIComponent(key.trim()); } catch { return key.trim(); } };
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const comparable = (policy: { id: string; title: string; category: string; region: string; amount: string; deadline: string; summary: string; target: string[]; documents: string[]; applyUrl: string; keywords: string[]; sourceName?: string | null }) => ({ id: policy.id, title: policy.title, category: policy.category, region: policy.region, amount: policy.amount, deadline: policy.deadline, summary: policy.summary, target: policy.target, documents: policy.documents, applyUrl: policy.applyUrl, keywords: policy.keywords, sourceName: policy.sourceName || '' });
const categoryFrom = (value: string) => { if (/주거|040/.test(value)) return '주거'; if (/일자리|050/.test(value)) return '취업'; if (/임신|출산|보육|080|090/.test(value)) return '출산·육아'; if (/교육|100/.test(value)) return '교육'; if (/금융|130/.test(value)) return '생활'; if (/노년/.test(value)) return '노인'; if (/청년/.test(value)) return '청년'; return '복지'; };

export type ImportedPolicy = { id: string; title: string; category: string; region: string; amount: string; deadline: string; summary: string; target: string[]; documents: string[]; applyUrl: string; keywords: string[]; sourceName: string; isActive: boolean; reviewStatus: string };

function parsePolicy(xml: string): ImportedPolicy | null {
  const sourceId = tag(xml, ['servId', 'wlfareInfoId', 'serviceId']);
  const title = tag(xml, ['servNm', 'wlfareInfoNm', 'serviceName']);
  if (!sourceId || !title) return null;
  const summary = tag(xml, ['servDgst', 'servSumry', 'serviceSummary', 'servCn']) || `${title} 복지서비스입니다.`;
  const targetText = tag(xml, ['trgterIndvdlArray', 'lifeArray', 'sprtTrgtCn']);
  const theme = tag(xml, ['intrsThemaArray', 'intrsThemaNm']);
  const organization = tag(xml, ['jurMnofNm', 'bizChrDeptNm', 'organizationName']);
  const detailUrl = tag(xml, ['servDtlLink', 'servUrl', 'website']);
  return { id: `bokjiro-${sourceId}`.slice(0, 190), title, category: categoryFrom(`${theme} ${targetText}`), region: '전국', amount: tag(xml, ['alwServCn', 'sprtCn', 'servDtlCn']) || '공식 상세정보 확인', deadline: '상시 또는 공고 확인', summary: summary.slice(0, 1000), target: targetText ? [targetText] : [], documents: [], applyUrl: detailUrl || 'https://www.bokjiro.go.kr', keywords: Array.from(new Set([title, organization, '복지서비스'].filter(Boolean))), sourceName: organization ? `복지로 · ${organization}` : '복지로 중앙부처복지서비스 API', isActive: false, reviewStatus: 'PENDING' };
}

export async function syncCentralWelfare() {
  if (!isDbEnabled()) throw new Error('DB 연결이 필요합니다.');
  const rawKey = process.env.DATA_GO_KR_SERVICE_KEY || process.env.WELFARE_API_SERVICE_KEY;
  if (!rawKey) throw new Error('DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.');
  const params = new URLSearchParams({ serviceKey: cleanKey(rawKey), callTp: 'L', pageNo: '1', numOfRows: '500', srchKeyCode: '003', orderBy: 'date' });
  const response = await fetch(`${BASE_URL}/NationalWelfarelistV001?${params}`, { cache: 'no-store', headers: { 'User-Agent': 'PolicyMoney/1.0' } });
  const xml = await response.text();
  if (!response.ok || /SERVICE ERROR|APPLICATION_ERROR|인증키|resultCode>[^0<]/i.test(xml)) throw new Error(`복지서비스 API 호출 실패 (${response.status})`);
  const policies = blocks(xml).map(parsePolicy).filter((item): item is ImportedPolicy => Boolean(item));
  if (!policies.length) throw new Error('API 응답에서 복지서비스 목록을 찾지 못했습니다. 인증키 유형과 API 승인을 확인하세요.');
  const ids = policies.map((item) => item.id);
  const [existingRows, pendingRows] = await Promise.all([
    prisma.policy.findMany({ where: { id: { in: ids } } }),
    prisma.policyCheck.findMany({ where: { policyId: { in: ids }, reviewerStatus: null, sourceHash: { not: null } }, select: { policyId: true, sourceHash: true } })
  ]);
  const existingMap = new Map(existingRows.map((item) => [item.id, item]));
  const pendingKeys = new Set(pendingRows.map((item) => `${item.policyId}:${item.sourceHash}`));
  const newPolicies: ImportedPolicy[] = [];
  const checks: Array<{ policyId: string; title: string; officialUrl: string; httpStatus: number; checkStatus: string; reasons: string[]; diffSummary: string; sourceHash: string; oldSnapshot: string | null; newSnapshot: string }> = [];
  let created = 0, changed = 0, unchanged = 0;
  for (const incoming of policies) {
    const existing = existingMap.get(incoming.id);
    const incomingHash = hash(comparable(incoming));
    if (existing && hash(comparable(existing)) === incomingHash) { unchanged++; continue; }
    if (pendingKeys.has(`${incoming.id}:${incomingHash}`)) { unchanged++; continue; }
    if (!existing) { newPolicies.push(incoming); created++; } else changed++;
    checks.push({ policyId: incoming.id, title: incoming.title, officialUrl: incoming.applyUrl, httpStatus: response.status, checkStatus: 'NEED_REVIEW', reasons: [existing ? '공공 API에서 정책 변경 감지' : '공공 API에서 신규 정책 수집'], diffSummary: existing ? '복지로 API 정보가 기존 정책과 다릅니다.' : '복지로 API 신규 정책입니다.', sourceHash: incomingHash, oldSnapshot: existing ? JSON.stringify(comparable(existing)) : null, newSnapshot: JSON.stringify({ kind: 'WELFARE_API_IMPORT', policy: incoming }) });
  }
  const now = new Date();
  await prisma.$transaction([
    prisma.policy.updateMany({ where: { id: { in: ids } }, data: { lastCheckedAt: now } }),
    prisma.policy.createMany({ data: newPolicies, skipDuplicates: true }),
    prisma.policyCheck.createMany({ data: checks })
  ]);
  return { fetched: policies.length, created, changed, unchanged, source: '한국사회보장정보원 중앙부처복지서비스' };
}

export function pendingPolicyFromSnapshot(snapshot: string | null) {
  if (!snapshot) return null;
  try { const parsed = JSON.parse(snapshot); return parsed?.kind === 'WELFARE_API_IMPORT' && parsed.policy ? parsed.policy as ImportedPolicy : null; } catch { return null; }
}
