import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, CreditCard, QrCode, CheckCircle, XCircle, Download, Trash2, Edit2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface Subscription {
  id: string;
  email: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

interface SubscriptionManagerProps {
  onUnlockSuccess?: () => void;
}

export function SubscriptionManager({ onUnlockSuccess }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'sub-001',
      email: 'user@example.com',
      plan: 'Digital SAT - 6 Months',
      startDate: '2024-01-01',
      expiryDate: '2024-07-01',
      paymentMethod: 'PayPal',
      amount: 114,
      status: 'active',
      autoRenew: true
    }
  ]);

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

  // 관리자 모드 변경 시 localStorage와 unlock 상태 업데이트
  useEffect(() => {
    localStorage.setItem('adminMode', adminMode.toString());
    if (adminMode && onUnlockSuccess) {
      onUnlockSuccess();
    }
  }, [adminMode, onUnlockSuccess]);

  const handleAddSubscription = () => {
    if (!newSubscription.email) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + newSubscription.months);

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      email: newSubscription.email,
      plan: newSubscription.plan,
      startDate: startDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      paymentMethod: newSubscription.paymentMethod,
      amount: newSubscription.months === 1 ? 29 : newSubscription.months === 3 ? 54 : newSubscription.months === 6 ? 114 : 228,
      status: 'active',
      autoRenew: false
    };

    setSubscriptions(prev => [subscription, ...prev]);
    setNewSubscription({
      email: '',
      plan: 'Digital SAT - 6 Months',
      paymentMethod: 'PayPal',
      months: 6
    });
    setShowAddForm(false);
    toast.success('구독이 추가되었습니다!');
    
    // Call unlock callback if provided
    if (onUnlockSuccess) {
      onUnlockSuccess();
    }
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm('이 구독을 삭제하시겠습니까?')) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('구독이 삭제되었습니다');
    }
  };

  const handleToggleStatus = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id
          ? { ...sub, status: sub.status === 'active' ? 'cancelled' : 'active' }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#10b981', text: 'white' };
      case 'expired':
        return { bg: '#ef4444', text: 'white' };
      case 'cancelled':
        return { bg: '#6b7280', text: 'white' };
      default:
        return { bg: '#d1d5db', text: '#374151' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'expired':
        return '만료';
      case 'cancelled':
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
                사용자 구독 정보를 관리하고 결제 상태를 확인하세요.
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
                <span className="hidden sm:inline">내보내기</span>
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
                    {subscriptions.filter(s => s.status === 'active').length}
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
                    {subscriptions.filter(s => isExpiringSoon(s.expiryDate)).length}
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
                    ${subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0)}
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
                  const statusColor = getStatusColor(sub.status);
                  const expiringSoon = isExpiringSoon(sub.expiryDate);

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
                          {getStatusText(sub.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(sub.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={sub.status === 'active' ? '취소' : '활성화'}
                          >
                            {sub.status === 'active' ? (
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

          {subscriptions.length === 0 && (
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