import Link from 'next/link';

export type PolicyCardItem = {
  id: string;
  title: string;
  category: string;
  region: string;
  amount: string;
  deadline: string;
  summary: string;
};

export function PolicyCard({ policy }: { policy: PolicyCardItem }) {
  return (
    <article className="rounded-3xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-brand">{policy.category}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{policy.region}</span>
      </div>
      <h3 className="mt-4 text-xl font-black text-ink">{policy.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{policy.summary}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">지원금</dt>
          <dd className="font-bold text-ink">{policy.amount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">마감</dt>
          <dd className="font-bold text-ink">{policy.deadline}</dd>
        </div>
      </dl>
      <Link href={`/policies/${policy.id}`} className="mt-5 inline-flex w-full justify-center rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white">
        자세히 보기
      </Link>
    </article>
  );
}
