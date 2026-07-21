'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FormEvent } from 'react';

type PolicySearchFormProps = {
  q: string;
  category: string;
  region: string;
  categories: string[];
  regions: string[];
};

export function PolicySearchForm({ q, category, region, categories, regions }: PolicySearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextQ = String(formData.get('q') || '').trim();
    const nextCategory = String(formData.get('category') || '전체');
    const nextRegion = String(formData.get('region') || '전체');
    const params = new URLSearchParams();

    if (nextQ) params.set('q', nextQ);
    if (nextCategory !== '전체') params.set('category', nextCategory);
    if (nextRegion !== '전체') params.set('region', nextRegion);

    fetch('/api/log/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: nextQ, category: nextCategory, region: nextRegion, path: pathname }),
      keepalive: true
    }).catch(() => undefined);

    router.push(params.toString() ? `/policies?${params.toString()}` : '/policies');
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_180px_120px]">
      <input
        name="q"
        defaultValue={q}
        placeholder="예: 청년 월세 지원"
        className="rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand"
      />
      <select name="category" defaultValue={category} className="rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand">
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>
      <select name="region" defaultValue={region} className="rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand">
        {regions.map((item) => <option key={item}>{item}</option>)}
      </select>
      <button className="rounded-2xl bg-ink px-5 py-3 font-bold text-white">검색</button>
    </form>
  );
}
