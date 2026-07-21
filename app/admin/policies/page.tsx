'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type PolicyRow = {
  id: string;
  title: string;
  category: string;
  region: string;
  amount: string;
  deadline: string;
  summary: string;
  target: string[];
  documents: string[];
  applyUrl: string;
  keywords: string[];
  sourceName?: string;
  isActive?: boolean;
  reviewStatus?: string;
};

const emptyForm: PolicyRow = {
  id: '',
  title: '',
  category: '청년',
  region: '전국',
  amount: '',
  deadline: '',
  summary: '',
  target: [],
  documents: [],
  applyUrl: '',
  keywords: [],
  sourceName: '',
  isActive: true,
  reviewStatus: 'PENDING'
};

function toTextLines(value: string[]) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function toComma(value: string[]) {
  return Array.isArray(value) ? value.join(', ') : '';
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [form, setForm] = useState<PolicyRow>(emptyForm);
  const [targetText, setTargetText] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [keywordText, setKeywordText] = useState('');
  const [message, setMessage] = useState('');
  const [dbEnabled, setDbEnabled] = useState(false);
  const [filter, setFilter] = useState('');

  async function load() {
    const response = await fetch('/api/admin/policies', { cache: 'no-store' });
    const data = await response.json();
    setPolicies(data.policies || []);
    setDbEnabled(Boolean(data.dbEnabled));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim();
    if (!q) return policies;
    return policies.filter((p) => [p.title, p.category, p.region, p.id].join(' ').includes(q));
  }, [policies, filter]);

  function editPolicy(policy: PolicyRow) {
    setForm(policy);
    setTargetText(toTextLines(policy.target));
    setDocumentText(toTextLines(policy.documents));
    setKeywordText(toComma(policy.keywords));
    setMessage('');
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage('저장 중...');

    const payload = {
      ...form,
      target: targetText,
      documents: documentText,
      keywords: keywordText
    };

    const isEdit = policies.some((p) => p.id === form.id);
    const response = await fetch(isEdit ? `/api/admin/policies/${form.id}` : '/api/admin/policies', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || '저장 실패');
      return;
    }

    setMessage('저장 완료');
    setForm(emptyForm);
    setTargetText('');
    setDocumentText('');
    setKeywordText('');
    await load();
  }

  async function remove(id: string) {
    if (!confirm('삭제할까요?')) return;
    const response = await fetch(`/api/admin/policies/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || '삭제 실패');
      return;
    }
    setMessage('삭제 완료');
    await load();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-7 text-white md:flex-row md:items-end">
        <div>
          <p className="text-sm text-slate-300">Admin</p>
          <h1 className="mt-1 text-3xl font-bold">정책 관리</h1>
          <p className="mt-2 text-slate-300">정책 등록/수정/삭제와 검수 상태를 관리합니다.</p>
        </div>
        <div className="rounded-full bg-white/10 px-4 py-2 text-sm">
          {dbEnabled ? 'DB 연결됨' : 'DB 미연결 · 읽기 전용'}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">정책 목록</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="정책명, 카테고리, 지역 검색"
              className="rounded-xl border px-4 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3">정책명</th>
                  <th className="px-3 py-3">분류</th>
                  <th className="px-3 py-3">지역</th>
                  <th className="px-3 py-3">상태</th>
                  <th className="px-3 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy) => (
                  <tr key={policy.id} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      <p className="font-semibold">{policy.title}</p>
                      <p className="text-xs text-slate-500">{policy.id}</p>
                    </td>
                    <td className="px-3 py-3">{policy.category}</td>
                    <td className="px-3 py-3">{policy.region}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{policy.reviewStatus || 'PENDING'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => editPolicy(policy)} className="mr-2 rounded-lg border px-3 py-1">수정</button>
                      <button onClick={() => remove(policy.id)} className="rounded-lg border px-3 py-1 text-red-600">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">등록/수정</h2>
            <button
              onClick={() => {
                setForm(emptyForm);
                setTargetText('');
                setDocumentText('');
                setKeywordText('');
              }}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              초기화
            </button>
          </div>

          <form onSubmit={save} className="space-y-3 text-sm">
            <input className="w-full rounded-xl border px-3 py-2" placeholder="id 예: youth-rent-2026" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} disabled={policies.some((p) => p.id === form.id)} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="정책명" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-xl border px-3 py-2" placeholder="카테고리" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="rounded-xl border px-3 py-2" placeholder="지역" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <input className="w-full rounded-xl border px-3 py-2" placeholder="지원금액" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="신청기간" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="공식 신청 링크" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
            <textarea className="h-20 w-full rounded-xl border px-3 py-2" placeholder="요약" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            <textarea className="h-20 w-full rounded-xl border px-3 py-2" placeholder="대상 조건: 줄바꿈으로 입력" value={targetText} onChange={(e) => setTargetText(e.target.value)} />
            <textarea className="h-20 w-full rounded-xl border px-3 py-2" placeholder="필요 서류: 줄바꿈으로 입력" value={documentText} onChange={(e) => setDocumentText(e.target.value)} />
            <input className="w-full rounded-xl border px-3 py-2" placeholder="키워드: 쉼표로 입력" value={keywordText} onChange={(e) => setKeywordText(e.target.value)} />
            <select className="w-full rounded-xl border px-3 py-2" value={form.reviewStatus} onChange={(e) => setForm({ ...form, reviewStatus: e.target.value })}>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="NEED_REVIEW">NEED_REVIEW</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">저장</button>
            {message && <p className="rounded-xl bg-slate-100 p-3 text-slate-700">{message}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
