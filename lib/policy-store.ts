import { policies as samplePolicies } from '@/data/policies';
import { prisma, isDbEnabled } from '@/lib/prisma';

export async function listPublicPolicies() {
  if (!isDbEnabled()) return samplePolicies;
  const rows = await prisma.policy.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { title: 'asc' }] });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    region: row.region,
    amount: row.amount,
    deadline: row.deadline,
    summary: row.summary,
    target: row.target,
    documents: row.documents,
    applyUrl: row.applyUrl,
    keywords: row.keywords
  }));
}

export async function getPublicPolicyById(id: string) {
  if (!isDbEnabled()) return samplePolicies.find((policy) => policy.id === id) || null;
  const row = await prisma.policy.findFirst({ where: { id, isActive: true } });
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    region: row.region,
    amount: row.amount,
    deadline: row.deadline,
    summary: row.summary,
    target: row.target,
    documents: row.documents,
    applyUrl: row.applyUrl,
    keywords: row.keywords
  };
}
