import Link from 'next/link';

export type PolicyListItemData = {
  id: string;
  title: string;
  category: string;
  region: string;
  amount: string;
  deadline: string;
  summary: string;
  keywords: string[];
};

export function PolicyListItem({ policy }: { policy: PolicyListItemData }) {
  return (
    <Link
      href={`/policies/${policy.id}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5"
    >
      <article className="grid md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-brand">{policy.category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{policy.region}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              {policy.deadline}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-black tracking-tight text-ink transition group-hover:text-brand md:text-2xl">{policy.title}</h3>
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">{policy.summary}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {policy.keywords.slice(0, 3).map((keyword) => (
              <span key={keyword} className="text-xs font-semibold text-slate-400 before:mr-1.5 before:text-blue-300 before:content-['#']">
                {keyword.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 md:border-l md:border-t-0 md:p-6">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold text-brand">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm" aria-hidden="true">₩</span>
              지원 혜택
            </p>
            <p className="mt-3 break-keep text-base font-black leading-6 text-ink">{policy.amount}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-xl text-white shadow-md shadow-blue-200 transition duration-300 group-hover:translate-x-1 group-hover:scale-105" aria-label="자세히 보기">→</span>
        </div>
      </article>
    </Link>
  );
}
