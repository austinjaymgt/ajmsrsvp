import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ajmevents2026';
const SESSION_COOKIE = 'ajm_admin_session';
const SESSION_TOKEN = process.env.SESSION_TOKEN || 'ajm-session-secret-2026';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_TOKEN;
}

export function checkPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export { SESSION_COOKIE, SESSION_TOKEN };
