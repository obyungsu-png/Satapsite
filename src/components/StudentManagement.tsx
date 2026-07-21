import { useState, useEffect } from 'react';
import { GraduationCap, RefreshCw, CheckCircle, XCircle, AlertCircle, KeyRound, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';
import { Subscription, isSubscriptionExpired } from './SubscriptionManager';
import {
  VoucherCode,
  VOUCHER_PLANS,
  loadVoucherCodes,
  saveVoucherCodes,
  createVoucherCodes,
} from '../utils/voucherCodes';

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  testCount?: number;
}

interface StudentManagementProps {
  /** "수강권 코드" 관리 탭으로 이동하고 싶을 때 사용 (선택) */
  onOpenVoucherTab?: () => void;
}

// 학생 이메일 기준 가장 최근 구독 1건 반환
function latestSubscription(subs: Subscription[], email: string): Subscription | null {
  const matches = subs.filter((s) => s.email === email);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => (a.id < b.id ? 1 : -1))[0];
}

export function StudentManagement({ onOpenVoucherTab }: StudentManagementProps = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [vouchers, setVouchers] = useState<VoucherCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // 학생별 "갱신용 코드 발급" 상품 선택값 (기본: 6개월 · 외부인)
  const [renewPlanKey, setRenewPlanKey] = useState<Record<string, string>>({});

  const loadAll = async () => {
    setLoading(true);
    const studentData = await kvGet('students');
    setStudents(Array.isArray(studentData) ? studentData : []);
    const subs = await kvGet('subscriptions');
    if (Array.isArray(subs)) setSubscriptions(subs);
    const codes = await loadVoucherCodes();
    setVouchers(codes);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveSubscriptions = async (subs: Subscription[]) => {
    setSubscriptions(subs);
    const ok = await kvSet('subscriptions', subs);
    if (!ok) toast.error('Supabase 저장에 실패했습니다. 네트워크를 확인해주세요.');
  };

  // 수강권 해제: Active 구독을 Cancelled로 변경 (환불/오등록 등 예외 처리용)
  const revokeSubscription = (student: Student) => {
    const email = (student.email || '').trim().toLowerCase();
    if (!confirm(`${student.name} 학생의 수강권을 해제하시겠습니까?`)) return;
    saveSubscriptions(
      subscriptions.map((s) => (s.email === email && s.status === 'Active' ? { ...s, status: 'Cancelled' as const } : s))
    );
    toast.success(`${student.name} 학생의 수강권이 해제되었습니다`);
  };

  // 학생 삭제: CRM 목록에서만 제거 (수강권/구독 이력은 이메일 기준으로 별도 보관되어 영향 없음)
  const deleteStudent = async (student: Student) => {
    if (!confirm(`${student.name} (${student.email}) 학생을 목록에서 삭제하시겠습니까?`)) return;
    const next = students.filter((s) => s.id !== student.id);
    setStudents(next);
    const ok = await kvSet('students', next);
    if (ok) toast.success('학생이 삭제되었습니다');
    else toast.error('Supabase 저장에 실패했습니다. 네트워크를 확인해주세요.');
  };

  // 갱신용 수강권 코드 발급: 관리자가 바로 부여하지 않고, 코드를 만들어 학생에게 전달한다.
  // 학생은 로그인 후 이 코드를 직접 입력해야 수강권이 등록된다.
  const issueRenewalCode = async (student: Student) => {
    const email = (student.email || '').trim().toLowerCase();
    if (!email) {
      toast.error('이 학생에게 등록된 이메일이 없습니다.');
      return;
    }
    const planKey = renewPlanKey[student.id] || VOUCHER_PLANS[1].key; // 기본 6개월·외부인
    const plan = VOUCHER_PLANS.find((p) => p.key === planKey) || VOUCHER_PLANS[1];

    const latestCodes = await loadVoucherCodes();
    const [created] = createVoucherCodes(
      latestCodes,
      plan.months,
      plan.category,
      1,
      plan.price,
      `학생: ${student.name} (${email}) 갱신용`
    );
    const next = [created, ...latestCodes];
    const ok = await saveVoucherCodes(next);
    if (!ok) {
      toast.error('코드 발급에 실패했습니다. 네트워크를 확인해주세요.');
      return;
    }
    setVouchers(next);
    navigator.clipboard?.writeText(created.code);
    toast.success(`코드가 발급되어 복사되었습니다: ${created.code} (${plan.label})`, { duration: 6000 });
  };

  const renderStatusBadge = (student: Student) => {
    const email = (student.email || '').trim().toLowerCase();
    const sub = latestSubscription(subscriptions, email);
    if (!sub) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
          <AlertCircle size={12} />
          수강권 없음
        </span>
      );
    }
    const active = sub.status === 'Active' && !isSubscriptionExpired(sub.expiryDate);
    if (active) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white w-fit">
          <CheckCircle size={12} />
          활성
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
          sub.status === 'Cancelled' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        <XCircle size={12} />
        {sub.status === 'Cancelled' ? '해제됨' : '만료됨'}
      </span>
    );
  };

  // 수강비: 이 학생이 실제로 등록(사용)한 수강권 코드 금액의 합계
  const totalPaid = (email: string): number =>
    vouchers.filter((v) => v.status === 'used' && v.usedByEmail === email).reduce((sum, v) => sum + v.price, 0);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            학생 관리 (CRM)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            수강권은 코드 등록 방식으로 운영됩니다. 학생이 로그인 후 직접 코드를 입력하면 자동 등록되며,
            여기서는 등록 현황을 확인하고 갱신 코드를 발급/관리할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          {onOpenVoucherTab && (
            <Button
              onClick={onOpenVoucherTab}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              <ExternalLink size={16} />
              수강권 코드 관리
            </Button>
          )}
          <Button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
            <RefreshCw size={16} />
            새로고침
          </Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        💡 아이디로 가입한 회원의 이메일은 <code className="bg-white px-1 rounded border border-blue-200">아이디@members.allmyexam.com</code> 형식입니다.
        "갱신용 코드 발급"은 코드만 만들어 복사해줄 뿐, 학생이 직접 입력해야 수강권이 실제로 등록됩니다.
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="이름 또는 이메일로 검색"
        className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
      />

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">불러오는 중...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 학생이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강 기간</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강비(누적)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강권 상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">갱신</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const email = (student.email || '').trim().toLowerCase();
                const sub = latestSubscription(subscriptions, email);
                const hasActive = !!sub && sub.status === 'Active' && !isSubscriptionExpired(sub.expiryDate);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub ? (
                        <span>
                          {sub.startDate} ~ {sub.expiryDate}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      ₩{totalPaid(email).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{renderStatusBadge(student)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={renewPlanKey[student.id] || VOUCHER_PLANS[1].key}
                          onChange={(e) => setRenewPlanKey((prev) => ({ ...prev, [student.id]: e.target.value }))}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                        >
                          {VOUCHER_PLANS.map((p) => (
                            <option key={p.key} value={p.key}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => issueRenewalCode(student)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                          style={{ backgroundColor: '#3D5AA1' }}
                          title="코드를 발급해 클립보드로 복사합니다. 학생이 직접 입력해야 적용됩니다."
                        >
                          <KeyRound size={13} />
                          코드 발급
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {hasActive && (
                          <button
                            onClick={() => revokeSubscription(student)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={13} />
                            해제
                          </button>
                        )}
                        <button
                          onClick={() => deleteStudent(student)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                          title="CRM 목록에서 삭제"
                        >
                          <Trash2 size={13} />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
