import type { MetadataRoute } from 'next';
import { listPublishedArticles } from '@/lib/article-store';
import { siteConfig } from '@/lib/site';
import { listPublicPolicies } from '@/lib/policy-store';
import { guides } from '@/data/guides';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const policies = await listPublicPolicies();
  const articles = await listPublishedArticles();

  const staticPages = ['', '/policies', '/contents', '/contents/all', '/guides', '/qna'].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8
  }));

  const policyPages = policies.map((policy) => ({
    url: `${siteConfig.url}/policies/${policy.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9
  }));

  const articlePages = articles.map((article) => ({
    url: `${siteConfig.url}/contents/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85
  }));

  const guidePages = guides.map((guide) => ({
    url: `${siteConfig.url}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9
  }));

  return [...staticPages, ...policyPages, ...articlePages, ...guidePages];
}
