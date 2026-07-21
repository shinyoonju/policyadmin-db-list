'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReviewActions({ checkId, policyId, currentStatus }: { checkId: string; policyId: string; currentStatus?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const updateStatus = async (reviewerStatus: 'APPROVED' | 'NEEDS_CHANGES') => {
    setLoading(reviewerStatus);
    setError('');
    try {
      const response = await fetch(`/api/admin/reviews/${checkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerStatus })
      });
      if (!response.ok) throw new Error('검토 상태 저장에 실패했습니다.');
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  };

  if (currentStatus === 'APPROVED') {
    return <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">승인 완료</span>;
  }

  return (
    <div className="flex min-w-[210px] flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => updateStatus('APPROVED')}
        disabled={Boolean(loading)}
        className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {loading === 'APPROVED' ? '저장 중' : '승인'}
      </button>
      <button
        type="button"
        onClick={() => updateStatus('NEEDS_CHANGES')}
        disabled={Boolean(loading)}
        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50"
      >
        수정 필요
      </button>
      <a href={`/admin/policies?edit=${encodeURIComponent(policyId)}`} className="text-xs font-bold text-slate-500 underline">정책 편집</a>
      {error && <p className="w-full text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
