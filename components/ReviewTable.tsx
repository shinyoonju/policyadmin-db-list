'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PolicyCheckLog } from '@/lib/logger';
import { ReviewActions } from '@/components/ReviewActions';

export function ReviewTable({ checks }: { checks: PolicyCheckLog[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [checkStatus, setCheckStatus] = useState('ALL');
  const [reviewerStatus, setReviewerStatus] = useState('ALL');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return checks.filter((item) => {
      const searchableText = [item.title, item.policyId, item.officialUrl, item.reasons.join(' ')]
        .join(' ')
        .toLowerCase();
      const currentReviewStatus = item.reviewerStatus || 'PENDING';
      return (!keyword || searchableText.includes(keyword))
        && (checkStatus === 'ALL' || item.checkStatus === checkStatus)
        && (reviewerStatus === 'ALL' || currentReviewStatus === reviewerStatus);
    });
  }, [checks, query, checkStatus, reviewerStatus]);

  const selectableIds = filtered
    .filter((item) => item.id && item.reviewerStatus !== 'APPROVED')
    .map((item) => item.id as string);
  const allVisibleSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const bulkApprove = async () => {
    const ids = Array.from(selected);
    if (!ids.length || !window.confirm(`선택한 ${ids.length}건을 승인할까요?`)) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/reviews/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, reviewerStatus: 'APPROVED' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '일괄 승인에 실패했습니다.');
      setMessage(`${data.updatedCount}건을 승인했습니다.`);
      setSelected(new Set());
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-soft p-4 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="정책명 또는 검수 사유 검색"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <select value={checkStatus} onChange={(event) => setCheckStatus(event.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold">
          <option value="ALL">자동 검수 상태 전체</option>
          <option value="OK">OK</option>
          <option value="NEED_REVIEW">NEED_REVIEW</option>
          <option value="SOURCE_CHANGED">SOURCE_CHANGED</option>
          <option value="LINK_ERROR">LINK_ERROR</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="ERROR">ERROR</option>
        </select>
        <select value={reviewerStatus} onChange={(event) => setReviewerStatus(event.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold">
          <option value="ALL">검토 상태 전체</option>
          <option value="PENDING">검토 대기</option>
          <option value="APPROVED">승인 완료</option>
          <option value="NEEDS_CHANGES">수정 필요</option>
        </select>
        <button type="button" onClick={bulkApprove} disabled={!selected.size || loading} className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? '승인 중' : `선택 ${selected.size}건 일괄 승인`}
        </button>
      </div>
      {message && <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-brand">{message}</p>}
      <p className="mt-3 text-right text-xs font-bold text-slate-400">검색 결과 {filtered.length}건</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[1240px] text-left text-sm">
          <thead className="border-b border-line text-slate-500">
            <tr>
              <th className="w-10 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="현재 검색 결과 전체 선택" className="h-4 w-4 accent-[#123A63]" /></th>
              <th>상태</th><th>정책명</th><th>HTTP</th><th>검수 사유</th><th>검토 상태</th><th>작업</th><th>검수 시간</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => {
              const canSelect = Boolean(item.id && item.reviewerStatus !== 'APPROVED');
              return (
                <tr key={`${item.policyId}-${item.checkedAt}-${index}`} className="border-b border-line align-top">
                  <td className="py-4"><input type="checkbox" disabled={!canSelect} checked={Boolean(item.id && selected.has(item.id))} onChange={() => item.id && setSelected((current) => { const next = new Set(current); if (next.has(item.id!)) next.delete(item.id!); else next.add(item.id!); return next; })} aria-label={`${item.title} 선택`} className="h-4 w-4 accent-[#123A63] disabled:opacity-30" /></td>
                  <td className="py-4 font-bold">{item.checkStatus}</td>
                  <td className="py-4 font-bold">{item.title}</td>
                  <td className="py-4">{item.httpStatus ?? '-'}</td>
                  <td className="max-w-[440px] py-4 leading-6">{item.diffSummary || (item.reasons.length ? item.reasons.join(', ') : '정상')}</td>
                  <td className="py-4 font-bold">{item.reviewerStatus || '검토 대기'}</td>
                  <td className="py-3">{item.id ? <ReviewActions checkId={item.id} policyId={item.policyId} currentStatus={item.reviewerStatus} /> : <span className="text-xs text-slate-400">DB 연결 필요</span>}</td>
                  <td className="whitespace-nowrap py-4">{new Date(item.checkedAt).toLocaleString('ko-KR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <p className="py-10 text-center text-slate-500">조건에 맞는 검수 결과가 없습니다.</p>}
      </div>
    </>
  );
}
