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

    const userSubscription = subscriptions.find((sub: any) =>
      sub.email === currentUser.email && sub.status === 'Active'
    );

    if (!userSubscription) return false;

    // Check if subscription is still valid
    const expiryDate = new Date(userSubscription.expiryDate);
    const today = new Date();
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
