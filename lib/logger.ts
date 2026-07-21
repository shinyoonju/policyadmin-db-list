import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), '.logs');

export type LogType = 'menu-clicks' | 'search-logs' | 'policy-checks';

export type MenuClickLog = {
  type: 'MENU_CLICK';
  label: string;
  href: string;
  path?: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
};

export type SearchLog = {
  type: 'SEARCH';
  query: string;
  category: string;
  region: string;
  resultCount: number;
  path?: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
};

export type PolicyCheckLog = {
  type: 'POLICY_CHECK';
  policyId: string;
  title: string;
  category: string;
  region: string;
  officialUrl: string;
  httpStatus: number | null;
  checkStatus: 'OK' | 'NEED_REVIEW' | 'SOURCE_CHANGED' | 'LINK_ERROR' | 'EXPIRED' | 'ERROR';
  reasons: string[];
  sourceHash?: string | null;
  oldSnapshot?: string | null;
  newSnapshot?: string | null;
  diffSummary?: string | null;
  checkedAt: string;
};

type AnyLog = MenuClickLog | SearchLog | PolicyCheckLog;

function ensureLogDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export function appendLog(type: LogType, data: AnyLog) {
  ensureLogDir();
  const filePath = path.join(logDir, `${type}.jsonl`);
  fs.appendFileSync(filePath, `${JSON.stringify(data)}\n`, 'utf8');
}

export function readLogs<T>(type: LogType): T[] {
  ensureLogDir();
  const filePath = path.join(logDir, `${type}.jsonl`);
  if (!fs.existsSync(filePath)) return [];

  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
    .reverse();
}

export function clientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip');
}
