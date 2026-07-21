import { policies as samplePolicies } from '@/data/policies';
import { prisma, isDbEnabled } from '@/lib/prisma';

export type AdminPolicyInput = {
  id: string;
  title: string;
  category: string;
  region: string;
  amount: string;
  deadline: string;
  summary: string;
  target: string[];
  documents: string[];
  applyUrl: string;
  keywords: string[];
  sourceName?: string;
  isActive?: boolean;
  reviewStatus?: string;
};

export function splitLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  return String(value || '')
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function splitComma(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function listPoliciesForAdmin() {
  if (!isDbEnabled()) {
    return samplePolicies.map((p) => ({ ...p, sourceName: '', isActive: true, reviewStatus: 'SAMPLE' }));
  }

  return prisma.policy.findMany({ orderBy: [{ updatedAt: 'desc' }] });
}

export async function getPolicyForAdmin(id: string) {
  if (!isDbEnabled()) {
    return samplePolicies.find((p) => p.id === id) || null;
  }
  return prisma.policy.findUnique({ where: { id } });
}

export function normalizePolicyInput(body: any): AdminPolicyInput {
  const id = String(body?.id || '').trim();
  const title = String(body?.title || '').trim();
  const category = String(body?.category || '').trim();
  const region = String(body?.region || '').trim();
  const amount = String(body?.amount || '').trim();
  const deadline = String(body?.deadline || '').trim();
  const summary = String(body?.summary || '').trim();
  const applyUrl = String(body?.applyUrl || '').trim();

  if (!id || !title || !category || !region || !summary || !applyUrl) {
    throw new Error('id, title, category, region, summary, applyUrl은 필수입니다.');
  }

  return {
    id,
    title,
    category,
    region,
    amount,
    deadline,
    summary,
    target: splitLines(body?.target),
    documents: splitLines(body?.documents),
    applyUrl,
    keywords: splitComma(body?.keywords),
    sourceName: body?.sourceName ? String(body.sourceName).trim() : undefined,
    isActive: body?.isActive === undefined ? true : Boolean(body.isActive),
    reviewStatus: body?.reviewStatus ? String(body.reviewStatus).trim() : 'PENDING'
  };
}
