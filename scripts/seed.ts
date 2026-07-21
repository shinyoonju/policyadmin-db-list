import { PrismaClient } from '@prisma/client';
import { policies } from '../data/policies';
import { articles } from '../data/articles';

const prisma = new PrismaClient();

async function main() {
  for (const policy of policies) {
    await prisma.policy.upsert({
      where: { id: policy.id },
      update: {
        title: policy.title,
        category: policy.category,
        region: policy.region,
        amount: policy.amount,
        deadline: policy.deadline,
        summary: policy.summary,
        target: policy.target,
        documents: policy.documents,
        applyUrl: policy.applyUrl,
        keywords: policy.keywords,
        sourceName: '샘플 데이터',
        isActive: true,
        reviewStatus: 'PENDING'
      },
      create: {
        id: policy.id,
        title: policy.title,
        category: policy.category,
        region: policy.region,
        amount: policy.amount,
        deadline: policy.deadline,
        summary: policy.summary,
        target: policy.target,
        documents: policy.documents,
        applyUrl: policy.applyUrl,
        keywords: policy.keywords,
        sourceName: '샘플 데이터',
        isActive: true,
        reviewStatus: 'PENDING'
      }
    });
  }

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        description: article.description,
        category: article.category,
        sections: article.sections,
        keywords: article.keywords,
        isPublished: true
      },
      create: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        category: article.category,
        sections: article.sections,
        keywords: article.keywords,
        isPublished: true
      }
    });
  }

  console.log(`Seed 완료: 정책 ${policies.length}개, 글 ${articles.length}개`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
