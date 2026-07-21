import { kvGet, kvSet } from './supabase/client';
import { getDeviceId } from './deviceId';

export type AccessState =
  | { status: 'none' } // 로그인 안 함 또는 수강권 없음
  | { status: 'expired' } // 수강권은 있으나 만료됨
  | { status: 'device_mismatch' } // 다른 기기에 이미 등록된 수강권
  | { status: 'active' }; // 이용 가능

// 로그인한 사용자의 수강권 상태를 확인한다 (Supabase KV store 기반).
// 서버에 /subscriptions 엔드포인트가 없으므로(404) KV store를 직접 읽는다.
//
// 기기당 1개 등록 제한: 수강권(subscription)에 처음 접속한 기기의 device_id를
// 자동으로 바인딩해두고, 이후 다른 기기에서 같은 계정으로 접속하면 'device_mismatch'로
// 판정해 잠근다. (voucher 코드로 새로 등록할 때는 그 기기에 바로 바인딩됨 — voucherCodes.ts)
export async function getAccessState(): Promise<AccessState> {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.email) return { status: 'none' };

  try {
    const subscriptions = await kvGet('subscriptions');
    if (!Array.isArray(subscriptions)) return { status: 'none' };

    // CRM(학생관리/수강권관리)에서 이메일을 소문자로 저장하므로 대소문자 무시 비교
    const userEmail = currentUser.email.trim().toLowerCase();
    const idx = subscriptions.findIndex(
      (sub: any) => (sub.email || '').trim().toLowerCase() === userEmail && sub.status === 'Active'
    );
    if (idx === -1) return { status: 'none' };

    const sub = subscriptions[idx];

    // 날짜 단위 비교 (만료일 당일 자정까지 유효)
    const expiryDate = new Date(sub.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate < today) return { status: 'expired' };

    const deviceId = getDeviceId();
    if (!sub.deviceId) {
      // 기기 정보가 없는 기존 수강권(관리자 수동 부여 등) — 최초 접속 기기에 자동 바인딩
      const updated = [...subscriptions];
      updated[idx] = { ...sub, deviceId };
      await kvSet('subscriptions', updated);
      return { status: 'active' };
    }
    if (sub.deviceId !== deviceId) return { status: 'device_mismatch' };
    return { status: 'active' };
  } catch {
    return { status: 'none' };
  }
}

// Check if user has an active subscription
export async function hasActiveSubscription(): Promise<boolean> {
  const state = await getAccessState();
  return state.status === 'active';
}

// Check if specific content should be locked
// Deprecated: localStorage-based subscription system replaced by Supabase license system
// Always return false to allow access; actual permission check is done in launchSection
export function isContentLocked(index: number, lockedFrom: number = 3): boolean {
  return false;
}
