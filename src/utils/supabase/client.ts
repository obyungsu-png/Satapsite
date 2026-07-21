import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

/**
 * Singleton Supabase client — import this everywhere instead of calling createClient() directly.
 * Prevents "Multiple GoTrueClient instances" warning.
 *
 * storageKey를 명시하고 detectSessionInUrl을 유지하되, React Strict Mode 등에서
 * 여러 mount로 인해 발생하는 gotrue-js Web Locks 경합을 줄이도록 auth 옵션 명시.
 * lock 함수를 no-op으로 지정해 콘솔의 'Lock ... not released within 5000ms' 경고를
 * 없앰 — SPA에서 여러 탭 동시 갱신 시나리오는 드물기 때문에 안전.
 */
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: `sb-${projectId}-auth-token`,
    flowType: 'pkce',
    lock: async (_name, _acquireTimeout, fn) => await fn(),
  },
});

// KV store helpers for sat_voca data
const TABLE = 'kv_store_46fa08c1';

/**
 * KV 전용 anon 클라이언트.
 * 메인 `supabase` 클라이언트는 로그인 후 사용자 JWT를 Authorization에 자동 첨부하는데,
 * KV 테이블의 RLS 정책은 anon 역할 기준이라 인증된 요청이 거부된다.
 * (로그인 상태에서 수강권 등록/구독 확인/학생 등록이 실패하던 원인)
 * 세션을 저장·첨부하지 않는 별도 클라이언트로 항상 anon 키만 사용한다.
 */
const kvClient = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: `sb-${projectId}-kv-anon`,
    flowType: 'implicit',
  },
});

export async function kvGet(key: string): Promise<any | null> {
  const { data, error } = await kvClient
    .from(TABLE)
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) {
    console.log(`kvGet(${key}) error:`, error.message);
    return null;
  }
  return data?.value ?? null;
}

export async function kvSet(key: string, value: any): Promise<boolean> {
  const { error } = await kvClient
    .from(TABLE)
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) {
    console.log(`kvSet(${key}) error:`, error.message);
    return false;
  }
  return true;
}

// key prefix로 여러 행 조회 (예: 'advertisement:' 접두사의 모든 광고)
export async function kvGetByPrefix(prefix: string): Promise<Array<{ key: string; value: any }>> {
  const { data, error } = await kvClient
    .from(TABLE)
    .select('key, value')
    .like('key', `${prefix}%`);
  if (error) {
    console.log(`kvGetByPrefix(${prefix}) error:`, error.message);
    return [];
  }
  return data ?? [];
}

export async function kvDel(key: string): Promise<boolean> {
  const { error } = await kvClient
    .from(TABLE)
    .delete()
    .eq('key', key);
  if (error) {
    console.log(`kvDel(${key}) error:`, error.message);
    return false;
  }
  return true;
}

// 로그인/가입된 사용자를 CRM 학생 목록(KV 'students')에 등록 (이미 있으면 스킵)
// edge function 없이 모든 인증 경로(아이디/이메일OTP/OAuth)에서 공통으로 사용
export async function registerStudent(user: { id?: string; email?: string; name?: string }): Promise<void> {
  const email = (user.email || '').trim().toLowerCase();
  if (!email) return;
  try {
    const existing = await kvGet('students');
    const students = Array.isArray(existing) ? existing : [];
    if (students.some((s: any) => (s.email || '').trim().toLowerCase() === email)) return;
    students.push({
      id: user.id || `user_${Date.now()}`,
      name: user.name || email.split('@')[0],
      email,
      createdAt: new Date().toISOString(),
    });
    await kvSet('students', students);
  } catch (e) {
    console.log('registerStudent error:', e);
  }
}
