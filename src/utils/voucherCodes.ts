import { kvGet, kvSet } from './supabase/client';
import { Subscription, isSubscriptionExpired } from '../components/SubscriptionManager';

// 수강권 코드(바우처) 시스템
// 관리자가 코드를 발급 → 학생이 로그인 후 코드를 직접 입력해 수강권을 등록한다.
// (기존의 "관리자가 학생을 골라 부여 버튼을 클릭" 방식을 대체)

export type VoucherCategory = 'individual' | 'academy';

export interface VoucherPlan {
  months: number;
  category: VoucherCategory;
  key: string;
  label: string;
  price: number; // KRW
  description: string;
}

export const CATEGORY_LABEL: Record<VoucherCategory, string> = {
  individual: '외부인(개인)',
  academy: '학원용',
};

// 제안 가격 — 관리자가 코드 발급 시 화면에서 자유롭게 수정할 수 있다.
export const VOUCHER_PLANS: VoucherPlan[] = [
  {
    months: 1,
    category: 'individual',
    key: '1-individual',
    label: '1개월 · 외부인(개인)',
    price: 99000,
    description: '학원 소속이 아닌 개인 수강생을 위한 1개월 이용권입니다.',
  },
  {
    months: 6,
    category: 'individual',
    key: '6-individual',
    label: '6개월 · 외부인(개인)',
    price: 495000,
    description: '개인 수강생을 위한 6개월 이용권. 1개월권을 6번 사는 것(594,000원)보다 약 17% 저렴합니다.',
  },
  {
    months: 1,
    category: 'academy',
    key: '1-academy',
    label: '1개월 · 학원용',
    price: 69000,
    description: '제휴 학원이 원생에게 나눠주는 1개월 이용권. 개인가 대비 약 30% 할인된 학원 공급가입니다.',
  },
  {
    months: 6,
    category: 'academy',
    key: '6-academy',
    label: '6개월 · 학원용',
    price: 345000,
    description: '제휴 학원이 원생에게 나눠주는 6개월 이용권. 학원 1개월권을 6번 사는 것보다 약 17% 저렴합니다.',
  },
];

export function getVoucherPlan(months: number, category: VoucherCategory): VoucherPlan | undefined {
  return VOUCHER_PLANS.find((p) => p.months === months && p.category === category);
}

export interface VoucherCode {
  id: string;
  code: string;
  months: number;
  category: VoucherCategory;
  price: number;
  status: 'unused' | 'used' | 'disabled';
  note?: string;
  createdAt: string;
  usedByEmail?: string;
  usedAt?: string;
}

// 헷갈리는 글자(0/O, 1/I/L) 제외
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSegment(len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export function generateCodeString(): string {
  return `SAT-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`;
}

export async function loadVoucherCodes(): Promise<VoucherCode[]> {
  const data = await kvGet('voucher_codes');
  return Array.isArray(data) ? data : [];
}

export async function saveVoucherCodes(codes: VoucherCode[]): Promise<boolean> {
  return kvSet('voucher_codes', codes);
}

// 코드 N개 생성 (기존 코드와 중복되지 않도록)
export function createVoucherCodes(
  existing: VoucherCode[],
  months: number,
  category: VoucherCategory,
  quantity: number,
  price: number,
  note?: string
): VoucherCode[] {
  const existingSet = new Set(existing.map((c) => c.code));
  const created: VoucherCode[] = [];
  let guard = 0;
  while (created.length < quantity && guard < quantity * 50 + 200) {
    guard++;
    const code = generateCodeString();
    if (existingSet.has(code)) continue;
    existingSet.add(code);
    created.push({
      id: `voucher-${Date.now()}-${created.length}-${Math.random().toString(36).slice(2, 7)}`,
      code,
      months,
      category,
      price,
      status: 'unused',
      note: note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
  }
  return created;
}

export type RedeemResult =
  | { ok: true; subscription: Subscription; voucher: VoucherCode }
  | { ok: false; reason: 'not_found' | 'used' | 'disabled' | 'no_email' };

// 수강권 코드 등록 — 로그인한 학생이 직접 코드를 입력해 수강권을 활성화한다.
// 이미 활성 수강권이 있으면 만료일부터 이어서 연장(갱신)하고, 없으면 오늘부터 시작한다.
// deviceId를 넘기면 새 수강권이 그 기기에 바로 바인딩된다(기기당 1개 제한).
export async function redeemVoucherCode(
  rawCode: string,
  email: string | undefined | null,
  deviceId?: string
): Promise<RedeemResult> {
  const emailLower = (email || '').trim().toLowerCase();
  if (!emailLower) return { ok: false, reason: 'no_email' };

  const normalized = rawCode.trim().toUpperCase();
  const codes = await loadVoucherCodes();
  const idx = codes.findIndex((c) => c.code.toUpperCase() === normalized);
  if (idx === -1) return { ok: false, reason: 'not_found' };

  const target = codes[idx];
  if (target.status === 'disabled') return { ok: false, reason: 'disabled' };
  if (target.status === 'used') return { ok: false, reason: 'used' };

  const subs = await loadSubscriptionsRaw();
  const existingActive = subs.find(
    (s) => s.email === emailLower && s.status === 'Active' && !isSubscriptionExpired(s.expiryDate)
  );
  const base = existingActive ? new Date(existingActive.expiryDate) : new Date();
  const expiry = new Date(base);
  expiry.setMonth(expiry.getMonth() + target.months);

  const newSub: Subscription = {
    id: `sub-${Date.now()}`,
    email: emailLower,
    plan: `Digital SAT - ${target.months}개월 (${CATEGORY_LABEL[target.category]})`,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    paymentMethod: 'Voucher Code',
    amount: target.price,
    status: 'Active',
    autoRenew: false,
    deviceId: deviceId || undefined,
  };

  const filteredSubs = subs.filter((s) => !(s.email === emailLower && s.status === 'Active'));
  const savedSub = await saveSubscriptionsRaw([newSub, ...filteredSubs]);
  if (!savedSub) throw new Error('구독 저장에 실패했습니다.');

  const updatedVoucher: VoucherCode = {
    ...target,
    status: 'used',
    usedByEmail: emailLower,
    usedAt: new Date().toISOString(),
  };
  const updatedCodes = [...codes];
  updatedCodes[idx] = updatedVoucher;
  const savedCodes = await saveVoucherCodes(updatedCodes);
  if (!savedCodes) throw new Error('수강권 코드 저장에 실패했습니다.');

  return { ok: true, subscription: newSub, voucher: updatedVoucher };
}

async function loadSubscriptionsRaw(): Promise<Subscription[]> {
  const data = await kvGet('subscriptions');
  return Array.isArray(data) ? data : [];
}

async function saveSubscriptionsRaw(subs: Subscription[]): Promise<boolean> {
  return kvSet('subscriptions', subs);
}
