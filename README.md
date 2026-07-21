# 정책머니 SEO 운영형 프로젝트

정부지원금/정책 정보 검색 사이트 MVP입니다. Next.js, SEO 페이지, 스케줄러 검수, 검색 로그, 메뉴 클릭 로그, 관리자 페이지, Supabase PostgreSQL + Prisma 연결 구조가 포함되어 있습니다.

## 실행

```bash
npm install
npm run dev
```

접속:

```txt
http://localhost:3000
```

## 관리자 화면

```txt
/admin              관리자 대시보드
/admin/policies     정책 등록/수정/삭제
/admin/reviews      정책 검수 결과
/admin/logs         검색/메뉴 로그
```

DB 연결 전에는 샘플 데이터 조회만 되고, 등록/수정/삭제는 DB 연결 후 동작합니다.

## Supabase DB 연결 순서

1. Supabase에서 새 프로젝트 생성
2. Project Settings > Database > Connection string 확인
3. `.env.example`을 복사해서 `.env.local` 생성
4. `DATABASE_URL`에는 Transaction pooler 주소 입력
5. `DIRECT_URL`에는 Direct connection 주소 입력
6. 아래 명령어 실행

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

DB 확인:

```bash
npm run db:studio
```

## Prisma 명령어

```bash
npm run db:generate   # Prisma Client 생성
npm run db:migrate    # Supabase에 테이블 생성
npm run db:seed       # 샘플 정책/글 DB 입력
npm run db:studio     # DB GUI 확인
```

## 스케줄러 검수

로컬에서 직접 실행:

```txt
http://localhost:3000/api/cron/verify-policies
```

Vercel 배포 시 `vercel.json` 기준으로 매일 1회 실행됩니다.

## 로그 저장

DB 연결 전:

```txt
.logs/search-logs.jsonl
.logs/menu-clicks.jsonl
.logs/policy-checks.jsonl
```

DB 연결 후:

```txt
SearchLog
MenuClickLog
PolicyCheck
```

## 운영 배포 전 체크

- `.env.local`에 실제 Supabase URL 입력
- Vercel Environment Variables에도 동일하게 등록
- `NEXT_PUBLIC_SITE_URL`을 실제 도메인으로 변경
- Google Search Console 등록
- `/sitemap.xml` 제출
- 개인정보처리방침/이용약관 추가
- 애드센스 신청 전 샘플 데이터 검수

## UI 변경 사항

- `/policies` 검색 결과를 카드형 그리드에서 리스트형으로 변경했습니다.
- `/contents` 정보글 목록도 카드형 그리드에서 리스트형으로 변경했습니다.
- 모바일에서는 한 줄 카드처럼 보이고, PC에서는 제목/요약/태그/지원금 정보가 가로로 정리됩니다.
