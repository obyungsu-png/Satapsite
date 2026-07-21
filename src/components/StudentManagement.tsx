import { useState, useEffect } from 'react';
import { GraduationCap, RefreshCw, CheckCircle, XCircle, Ticket, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';
import { Subscription, isSubscriptionExpired } from './SubscriptionManager';

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  testCount?: number;
}

// 학생 이메일 기준 가장 최근 구독 1건 반환
function latestSubscription(subs: Subscription[], email: string): Subscription | null {
  const matches = subs.filter(s => s.email === email);
  if (matches.length === 0) return null;
  return matches.sort((a, b) => (a.id < b.id ? 1 : -1))[0];
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  // 학생별 부여 기간 선택값 (기본 6개월)
  const [grantMonths, setGrantMonths] = useState<Record<string, number>>({});

  const loadAll = async () => {
    setLoading(true);
    // 1) 학생 목록 (KV store — 로그인/가입 시 registerStudent가 자동 등록)
    const studentData = await kvGet('students');
    setStudents(Array.isArray(studentData) ? studentData : []);
    // 2) 구독 목록 (KV store — hasActiveSubscription과 동일 소스)
    const subs = await kvGet('subscriptions');
    if (Array.isArray(subs)) setSubscriptions(subs);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const saveSubscriptions = async (subs: Subscription[]) => {
    setSubscriptions(subs);
    const ok = await kvSet('subscriptions', subs);
    if (ok) {
      console.log('💾 Saved subscriptions to Supabase:', subs.length);
    } else {
      toast.error('Supabase 저장에 실패했습니다. 네트워크를 확인해주세요.');
    }
  };

  // 수강권 부여: 해당 이메일의 기존 Active 구독을 교체
  const grantSubscription = (student: Student) => {
    const email = (student.email || '').trim().toLowerCase();
    if (!email) {
      toast.error('이 학생에게 등록된 이메일이 없습니다.');
      return;
    }
    const months = grantMonths[student.id] ?? 6;
    const start = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      email,
      plan: `Digital SAT - ${months} Month${months > 1 ? 's' : ''}`,
      startDate: start.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      paymentMethod: 'None',
      amount: 0,
      status: 'Active',
      autoRenew: false
    };

    const filtered = subscriptions.filter(
      s => !(s.email === email && s.status === 'Active')
    );
    saveSubscriptions([newSub, ...filtered]);
    toast.success(`${student.name} 학생에게 ${months}개월 수강권 부여 완료 (만료일: ${newSub.expiryDate})`);
  };

  // 수강권 해제: Active 구독을 Cancelled로 변경
  const revokeSubscription = (student: Student) => {
    const email = (student.email || '').trim().toLowerCase();
    if (!confirm(`${student.name} 학생의 수강권을 해제하시겠습니까?`)) return;
    saveSubscriptions(
      subscriptions.map(s =>
        s.email === email && s.status === 'Active'
          ? { ...s, status: 'Cancelled' as const }
          : s
      )
    );
    toast.success(`${student.name} 학생의 수강권이 해제되었습니다`);
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
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white w-fit">
            <CheckCircle size={12} />
            활성
          </span>
          <span className="text-xs text-gray-500">~ {sub.expiryDate}</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
          sub.status === 'Cancelled' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <XCircle size={12} />
          {sub.status === 'Cancelled' ? '해제됨' : '만료됨'}
        </span>
        <span className="text-xs text-gray-500">만료일: {sub.expiryDate}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            학생 관리 (CRM)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            등록된 학생을 확인하고 수강권을 부여/해제할 수 있습니다. 변경 사항은 Supabase에 즉시 저장됩니다.
          </p>
        </div>
        <Button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
        >
          <RefreshCw size={16} />
          새로고침
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        💡 아이디로 가입한 회원의 이메일은 <code className="bg-white px-1 rounded border border-blue-200">아이디@members.allmyexam.com</code> 형식입니다.
        수강권은 이 이메일 기준으로 적용됩니다.
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">불러오는 중...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">등록된 학생이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시험 횟수</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강권 상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수강권 관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const email = (student.email || '').trim().toLowerCase();
                const sub = latestSubscription(subscriptions, email);
                const hasActive = !!sub && sub.status === 'Active' && !isSubscriptionExpired(sub.expiryDate);
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.testCount || 0}회
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {renderStatusBadge(student)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={grantMonths[student.id] ?? 6}
                          onChange={(e) =>
                            setGrantMonths(prev => ({ ...prev, [student.id]: parseInt(e.target.value) }))
                          }
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                        >
                          <option value={1}>1개월</option>
                          <option value={3}>3개월</option>
                          <option value={6}>6개월</option>
                          <option value={12}>12개월</option>
                        </select>
                        <button
                          onClick={() => grantSubscription(student)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                          style={{ backgroundColor: '#3D5AA1' }}
                        >
                          <Ticket size={13} />
                          부여
                        </button>
                        {hasActive && (
                          <button
                            onClick={() => revokeSubscription(student)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={13} />
                            해제
                          </button>
                        )}
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
