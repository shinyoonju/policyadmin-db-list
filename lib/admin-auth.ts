export const ADMIN_SESSION_COOKIE = 'policy_money_admin';

export async function createAdminSessionToken(secret: string) {
  const data = new TextEncoder().encode(`policy-money-admin:${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
