'use client';

import { useEffect, useState } from 'react';

type SearchLog = {
  id?: string;
  query: string;
  category: string;
  region: string;
  resultCount: number;
  path?: string;
  createdAt: string;
};

type MenuClickLog = {
  id?: string;
  label: string;
  href: string;
  path?: string;
  createdAt: string;
};

export default function AdminLogsPage() {
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [menuClicks, setMenuClicks] = useState<MenuClickLog[]>([]);
  const [dbEnabled, setDbEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/admin/logs', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setSearchLogs(data.searchLogs || []);
        setMenuClicks(data.menuClicks || []);
        setDbEnabled(Boolean(data.dbEnabled));
      });
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 rounded-3xl bg-slate-950 p-7 text-white">
        <p className="text-sm text-slate-300">Admin</p>
        <h1 className="mt-1 text-3xl font-bold">검색/메뉴 로그</h1>
        <p className="mt-2 text-slate-300">사용자가 어떤 메뉴와 검색어를 쓰는지 확인합니다.</p>
        <p className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
          저장소: {dbEnabled ? 'Supabase DB' : '로컬 JSONL'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">검색 로그</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3">검색어</th>
                  <th className="px-3 py-3">분류</th>
                  <th className="px-3 py-3">지역</th>
                  <th className="px-3 py-3">결과</th>
                  <th className="px-3 py-3">시간</th>
                </tr>
              </thead>
              <tbody>
                {searchLogs.map((log, index) => (
                  <tr key={log.id || index} className="border-b last:border-0">
                    <td className="px-3 py-3 font-semibold">{log.query || '-'}</td>
                    <td className="px-3 py-3">{log.category}</td>
                    <td className="px-3 py-3">{log.region}</td>
                    <td className="px-3 py-3">{log.resultCount}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">메뉴 클릭 로그</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3">메뉴</th>
                  <th className="px-3 py-3">링크</th>
                  <th className="px-3 py-3">시간</th>
                </tr>
              </thead>
              <tbody>
                {menuClicks.map((log, index) => (
                  <tr key={log.id || index} className="border-b last:border-0">
                    <td className="px-3 py-3 font-semibold">{log.label}</td>
                    <td className="px-3 py-3 text-slate-600">{log.href}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
