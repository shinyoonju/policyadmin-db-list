import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관리자 로그인',
  robots: { index: false, follow: false }
};

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  const nextPath = searchParams.next?.startsWith('/admin') ? searchParams.next : '/admin';

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-[2rem] border border-line bg-white p-7 shadow-xl shadow-sky-900/5 md:p-9">
        <p className="text-sm font-black text-brand">POLICY MONEY ADMIN</p>
        <h1 className="mt-2 text-3xl font-black text-ink">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">운영 환경에 설정한 관리자 비밀번호를 입력하세요.</p>

        {searchParams.error && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">비밀번호가 올바르지 않습니다.</p>
        )}

        <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="text-sm font-bold text-ink">관리자 비밀번호</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <button type="submit" className="w-full rounded-2xl bg-brand px-5 py-3.5 font-bold text-white transition hover:bg-[#0b2c4e]">
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
