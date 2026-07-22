'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function WelfareSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  async function sync() {
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/admin/sources/welfare/sync', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '수집 실패');
      setMessage(`수집 ${data.fetched}건 · 신규 ${data.created}건 · 변경 ${data.changed}건 · 삭제 의심 ${data.missing}건 · 동일 ${data.unchanged}건`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : '수집 실패'); }
    finally { setLoading(false); }
  }
  async function syncDetails() {
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/admin/sources/welfare/details', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '상세 수집 실패');
      setMessage(`상세 요청 ${data.requested}건 · 완료 ${data.completed}건 · 동일 ${data.unchanged}건 · 변경 ${data.changed}건 · 실패 ${data.failed}건`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : '상세 수집 실패'); }
    finally { setLoading(false); }
  }
  return <div><div className="flex flex-wrap gap-2"><button type="button" onClick={sync} disabled={loading} className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? 'API 처리 중...' : '복지로 목록 수집'}</button><button type="button" onClick={syncDetails} disabled={loading} className="rounded-2xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">상세정보 90건 수집</button></div>{message && <p className="mt-2 text-xs font-bold text-slate-600">{message}</p>}</div>;
}
