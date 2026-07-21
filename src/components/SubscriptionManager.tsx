import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, CreditCard, QrCode, CheckCircle, XCircle, Download, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';

// status는 hasActiveSubscription(subscriptionUtils.ts)과 동일한 대문자 규칙 사용
export interface Subscription {
  id: string;
  email: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  amount: number;
  status: 'Active' | 'Expired' | 'Cancelled';
  autoRenew: boolean;
  /** 기기당 1개 등록 제한 — 최초 접속 기기의 device_id에 자동 바인딩됨(subscriptionUtils.getAccessState 참고) */
  deviceId?: string;
}

interface SubscriptionManagerProps {
  onUnlockSuccess?: () => void;
}

// 만료일이 지난 Active 구독은 화면에 '만료'로 표시 (hasActiveSubscription도 만료일로 판정)
export function isSubscriptionExpired(expiryDate: string): boolean {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
}

export function SubscriptionManager({ onUnlockSuccess }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    email: '',
    plan: 'Digital SAT - 6 Months',
    paymentMethod: 'PayPal',
    months: 6
  });

  // 관리자 모드 상태
  const [adminMode, setAdminMode] = useState(() => {
    return localStorage.getItem('adminMode') === 'true';
  });

  // Supabase KV store에서 구독 목록 로드
  useEffect(() => {
    const load = async () => {
      const data = await kvGet('subscriptions');
      if (Array.isArray(data)) {
        setSubscriptions(data);
        console.log('✅ Loaded subscriptions from Supabase:', data.length);
      }
      setLoaded(true);
    };
    load();
  }, []);

  // 관리자 모드 변경 시 localStorage와 unlock 상태 업데이트
  useEffect(() => {
    localStorage.setItem('adminMode', adminMode.toString());
    if (adminMode && onUnlockSuccess) {
      onUnlockSuccess();
    }
  }, [adminMode, onUnlockSuccess]);

  // 상태 업데이트 + Supabase KV store 저장 (항상 함께 수행)
  const saveSubscriptions = async (subs: Subscription[]) => {
    setSubscriptions(subs);
    const ok = await kvSet('subscriptions', subs);
    if (ok) {
      console.log('💾 Saved subscriptions to Supabase:', subs.length);
    } else {
      toast.error('Supabase 저장에 실패했습니다. 네트워크를 확인해주세요.');
    }
  };

  const handleAddSubscription = () => {
    const email = newSubscription.email.trim().toLowerCase();
    if (!email) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + newSubscription.months);

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      email,
      plan: newSubscription.plan,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      paymentMethod: newSubscription.paymentMethod,
      amount: newSubscription.months === 1 ? 29 : newSubscription.months === 3 ? 54 : newSubscription.months === 6 ? 114 : 228,
      status: 'Active',
      autoRenew: false
    };

    // 같은 이메일의 기존 Active 구독이 있으면 교체 (중복 방지)
    const filtered = subscriptions.filter(
      sub => !(sub.email === email && sub.status === 'Active')
    );
    saveSubscriptions([subscription, ...filtered]);
    setNewSubscription({
      email: '',
      plan: 'Digital SAT - 6 Months',
      paymentMethod: 'PayPal',
      months: 6
    });
    setShowAddForm(false);
    toast.success(`구독이 추가되었습니다! (${email})`);

    // Call unlock callback if provided
    if (onUnlockSuccess) {
      onUnlockSuccess();
    }
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm('이 구독을 삭제하시겠습니까?')) {
      saveSubscriptions(subscriptions.filter(sub => sub.id !== id));
      toast.success('구독이 삭제되었습니다');
    }
  };

  const handleToggleStatus = (id: string) => {
    saveSubscriptions(
      subscriptions.map(sub =>
        sub.id === id
          ? { ...sub, status: sub.status === 'Active' ? 'Cancelled' as const : 'Active' as const }
          : sub
      )
    );
    toast.success('상태가 변경되었습니다');
  };

  const handleExportData = () => {
    const csvContent = [
      ['ID', 'Email', 'Plan', 'Start Date', 'Expiry Date', 'Payment Method', 'Amount', 'Status', 'Auto Renew'],
      ...subscriptions.map(sub => [
        sub.id,
        sub.email,
        sub.plan,
        sub.startDate,
        sub.expiryDate,
        sub.paymentMethod,
        sub.amount.toString(),
        sub.status,
        sub.autoRenew ? 'Yes' : 'No'
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('데이터가 다운로드되었습니다');
  };

  // 표시용 상태: Active라도 만료일이 지났으면 'Expired'로 표시
  const getDisplayStatus = (sub: Subscription): string => {
    if (sub.status === 'Active' && isSubscriptionExpired(sub.expiryDate)) return 'Expired';
    return sub.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: '#10b981', text: 'white' };
      case 'Expired':
        return { bg: '#ef4444', text: 'white' };
      case 'Cancelled':
        return { bg: '#6b7280', text: 'white' };
      default:
        return { bg: '#d1d5db', text: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return '활성';
      case 'Expired':
        return '만료';
      case 'Cancelled':
        return '취소';
      default:
        return '알 수 없음';
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const activeCount = subscriptions.filter(s => getDisplayStatus(s) === 'Active').length;

  return (
    <div className="min-h-screen py-6 md:py-12 px-3 md:px-6" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl mb-2" style={{ fontWeight: 700, color: '#1a1a1a' }}>
                구독 관리
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                사용자 구독 정보를 관리하고 결제 상태를 확인하세요. (Supabase에 자동 저장됩니다)
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {/* 관리자 모드 토글 */}
              <motion.button
                onClick={() => {
                  setAdminMode(!adminMode);
                  toast.success(adminMode ? '관리자 모드 비활성화' : '관리자 모드 활성화');
                }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-all text-sm"
                style={{
                  backgroundColor: adminMode ? '#3D5AA1' : 'white',
                  borderColor: adminMode ? '#3D5AA1' : '#d1d5db',
                  color: adminMode ? 'white' : '#374151'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="font-medium hidden sm:inline">
                  관리자 모드 {adminMode ? 'ON' : 'OFF'}
                </span>
                <span className="font-medium sm:hidden">
                  관리자 {adminMode ? 'ON' : 'OFF'}
                </span>
              </motion.button>

              <Button
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
              >
                <Download size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 md:px-6 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#3D5AA1' }}
              >
                + 구독 추가
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">전체 구독</p>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#1a1a1a' }}>
                    {subscriptions.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8edf5' }}>
                  <CreditCard size={24} style={{ color: '#3D5AA1' }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">활성 구독</p>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#10b981' }}>
                    {activeCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">만료 임박</p>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#f59e0b' }}>
                    {subscriptions.filter(s => getDisplayStatus(s) === 'Active' && isExpiringSoon(s.expiryDate)).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                  <Calendar size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">월 수익</p>
                  <p className="text-2xl" style={{ fontWeight: 700, color: '#3D5AA1' }}>
                    ${subscriptions.filter(s => getDisplayStatus(s) === 'Active').reduce((sum, s) => sum + s.amount, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8edf5' }}>
                  <CreditCard size={24} style={{ color: '#3D5AA1' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Subscription Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>
              새 구독 추가
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              💡 아이디로 가입한 회원의 이메일은 <code className="bg-gray-100 px-1 rounded">아이디@members.allmyexam.com</code> 형식입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                  이메일
                </label>
                <input
                  type="email"
                  value={newSubscription.email}
                  onChange={(e) => setNewSubscription({ ...newSubscription, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                  플랜
                </label>
                <select
                  value={newSubscription.plan}
                  onChange={(e) => setNewSubscription({ ...newSubscription, plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Digital SAT - 1 Month">Digital SAT - 1 Month</option>
                  <option value="Digital SAT - 3 Months">Digital SAT - 3 Months</option>
                  <option value="Digital SAT - 6 Months">Digital SAT - 6 Months</option>
                  <option value="Digital SAT - 1 Year">Digital SAT - 1 Year</option>
                  <option value="High School Success - 6 Months">High School Success - 6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                  결제 방법
                </label>
                <select
                  value={newSubscription.paymentMethod}
                  onChange={(e) => setNewSubscription({ ...newSubscription, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PayPal">PayPal</option>
                  <option value="QR Code">QR Code</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="None">Free / Admin Grant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: '#374151' }}>
                  구독 기간 (개월)
                </label>
                <select
                  value={newSubscription.months}
                  onChange={(e) => setNewSubscription({ ...newSubscription, months: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1개월</option>
                  <option value="3">3개월</option>
                  <option value="6">6개월</option>
                  <option value="12">12개월</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddSubscription}
                className="px-6 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#3D5AA1' }}
              >
                추가하기
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700"
              >
                취소
              </Button>
            </div>
          </motion.div>
        )}

        {/* Subscriptions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    이메일
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    플랜
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    시작일
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    만료일
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    결제 방법
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    금액
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-sm" style={{ fontWeight: 700, color: '#374151' }}>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub, index) => {
                  const displayStatus = getDisplayStatus(sub);
                  const statusColor = getStatusColor(displayStatus);
                  const expiringSoon = displayStatus === 'Active' && isExpiringSoon(sub.expiryDate);

                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sub.plan}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sub.startDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span style={{ color: expiringSoon ? '#f59e0b' : '#6b7280' }}>
                            {sub.expiryDate}
                          </span>
                          {expiringSoon && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                              곧 만료
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          {sub.paymentMethod === 'QR Code' && <QrCode size={16} />}
                          {sub.paymentMethod === 'PayPal' && <CreditCard size={16} />}
                          {sub.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ fontWeight: 600, color: '#3D5AA1' }}>
                        ${sub.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            fontWeight: 600
                          }}
                        >
                          {getStatusText(displayStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(sub.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={sub.status === 'Active' ? '취소' : '활성화'}
                          >
                            {sub.status === 'Active' ? (
                              <XCircle size={18} className="text-red-600" />
                            ) : (
                              <CheckCircle size={18} className="text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscription(sub.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="삭제"
                          >
                            <Trash2 size={18} className="text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loaded && subscriptions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">구독 정보가 없습니다</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
