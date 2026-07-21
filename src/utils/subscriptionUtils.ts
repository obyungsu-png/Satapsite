import { kvGet } from './supabase/client';

// Check if user has an active subscription (Supabase KV store 기반)
// 서버에 /subscriptions 엔드포인트가 없으므로(404) KV store를 직접 읽는다.
export async function hasActiveSubscription(): Promise<boolean> {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!currentUser.email) {
    return false;
  }

  try {
    const subscriptions = await kvGet('subscriptions');
    if (!Array.isArray(subscriptions)) return false;

    // CRM(학생관리/수강권관리)에서 이메일을 소문자로 저장하므로 대소문자 무시 비교
    const userEmail = currentUser.email.trim().toLowerCase();
    const userSubscription = subscriptions.find((sub: any) =>
      (sub.email || '').trim().toLowerCase() === userEmail && sub.status === 'Active'
    );

    if (!userSubscription) return false;

    // 날짜 단위 비교 (만료일 당일 자정까지 유효)
    const expiryDate = new Date(userSubscription.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate >= today;
  } catch {
    return false;
  }
}

// Check if specific content should be locked
// Deprecated: localStorage-based subscription system replaced by Supabase license system
// Always return false to allow access; actual permission check is done in launchSection
export function isContentLocked(index: number, lockedFrom: number = 3): boolean {
  return false;
}
