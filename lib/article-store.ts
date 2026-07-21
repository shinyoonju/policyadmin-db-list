import { articles as sampleArticles, type Article } from '@/data/articles';
import { isDbEnabled, prisma } from '@/lib/prisma';

function toArticle(row: {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  sections: unknown;
}): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    keywords: row.keywords,
    sections: Array.isArray(row.sections)
      ? row.sections.filter(
          (section): section is { heading: string; body: string } =>
            typeof section === 'object' &&
            section !== null &&
            'heading' in section &&
            'body' in section &&
            typeof section.heading === 'string' &&
            typeof section.body === 'string'
        )
      : []
  };
}

export async function listPublishedArticles(): Promise<Article[]> {
  if (!isDbEnabled()) return sampleArticles;
  const rows = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' }
  });
  return rows.map(toArticle);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  if (!isDbEnabled()) return sampleArticles.find((article) => article.slug === slug) || null;
  const row = await prisma.article.findFirst({ where: { slug, isPublished: true } });
  return row ? toArticle(row) : null;
}
