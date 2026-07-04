import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Users, Calendar, DollarSign, TrendingUp, Zap, Bell } from 'lucide-react';
import { getStudents, getSchedule, getAttendance } from '../utils/storage';
import { calculateMonthlyBilling, getScheduledDaysForMonth } from '../utils/billing';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, lastDayOfMonth, differenceInDays } from 'date-fns';
import { QuickInput } from '../components/QuickInput';
import { MonthCalendar } from '../components/MonthCalendar';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    monthlyRevenue: 0,
    scheduledClasses: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const loadData = async () => {
      const students = await getStudents();
      const currentDate = new Date();
      const billing = await calculateMonthlyBilling(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );

      const totalRevenue = billing.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalClasses = billing.reduce((sum, b) => sum + b.scheduledClasses, 0);

      setStats({
        totalStudents: students.length,
        monthlyRevenue: totalRevenue,
        scheduledClasses: totalClasses,
      });
    };
    
    loadData();
  }, [refreshKey]);

  const currentMonth = format(new Date(), 'yyyy년 M월');

  // 청구 리마인더: 매월 말일 2일 전
  const today = new Date();
  const monthEnd = lastDayOfMonth(today);
  const daysUntilEnd = differenceInDays(monthEnd, today);
  const showBillingReminder = daysUntilEnd <= 2;
  const billingDueDate = format(monthEnd, 'M월 d일');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">대시보드</h2>
        <p className="text-gray-600 mt-1">{currentMonth} 현황</p>
      </div>

      {/* Billing Reminder */}
      {showBillingReminder && (
        <div className="flex items-start gap-3 bg-gradient-to-r from-[#FFF3CD] to-[#FFF8E1] border border-[#F5C518]/40 rounded-2xl p-4">
          <div className="w-9 h-9 bg-[#F5C518] rounded-xl flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-[#2D2A26]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#2D2A26]" style={{ fontWeight: 600 }}>
              {daysUntilEnd === 0
                ? '🚨 오늘이 말일입니다! 학원비 청구를 완료해주세요.'
                : daysUntilEnd === 1
                  ? '⏰ 내일이 말일입니다! 학원비 청구를 준비해주세요.'
                  : `⏰ 말일 2일 전입니다! (${billingDueDate}) 학원비 청구를 준비해주세요.`}
            </p>
            <p className="text-xs text-[#8A8478] mt-1">
              수업료 정산 → 각 학생별 청구서 버튼으로 학부모에게 청구서를 보내세요.
            </p>
          </div>
          <Link
            to="/billing"
            className="flex-shrink-0 px-3 py-1.5 bg-[#F5C518] text-[#2D2A26] rounded-lg text-xs hover:bg-[#E5B616] transition-colors"
            style={{ fontWeight: 600 }}
          >
            정산하기
          </Link>
        </div>
      )}

      {/* Quick Input */}
      <QuickInput onUpdate={refreshData} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A8478]">총 학생 수</p>
              <p className="text-3xl font-semibold text-[#2D2A26] mt-2">
                {stats.totalStudents}명
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FFF8E1] rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#B8860B]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A8478]">이번 달 수업</p>
              <p className="text-3xl font-semibold text-[#2D2A26] mt-2">
                {stats.scheduledClasses}회
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A8478]">이번 달 수입</p>
              <p className="text-3xl font-semibold text-[#2D2A26] mt-2">
                {stats.monthlyRevenue.toLocaleString()}원
              </p>
            </div>
            <div className="w-12 h-12 bg-[#FFF3CD] rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#B8860B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Month Calendar */}
      <MonthCalendar key={refreshKey} />

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
        <h3 className="text-lg font-semibold text-[#2D2A26] mb-4">빠른 실행</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/students"
            className="flex items-center gap-3 p-4 border border-[#F0EBE1] rounded-xl hover:border-[#F5C518] hover:bg-[#FFF8E1] transition-colors"
          >
            <Users className="w-5 h-5 text-[#B8860B]" />
            <span className="font-medium text-[#2D2A26]">학생 추가</span>
          </Link>
          <Link
            to="/schedule"
            className="flex items-center gap-3 p-4 border border-[#F0EBE1] rounded-xl hover:border-[#F5C518] hover:bg-[#FFF8E1] transition-colors"
          >
            <Calendar className="w-5 h-5 text-[#B8860B]" />
            <span className="font-medium text-[#2D2A26]">스케줄 설정</span>
          </Link>
          <Link
            to="/attendance"
            className="flex items-center gap-3 p-4 border border-[#F0EBE1] rounded-xl hover:border-[#F5C518] hover:bg-[#FFF8E1] transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-[#B8860B]" />
            <span className="font-medium text-[#2D2A26]">출석 체크</span>
          </Link>
          <Link
            to="/billing"
            className="flex items-center gap-3 p-4 border border-[#F0EBE1] rounded-xl hover:border-[#F5C518] hover:bg-[#FFF8E1] transition-colors"
          >
            <DollarSign className="w-5 h-5 text-[#B8860B]" />
            <span className="font-medium text-[#2D2A26]">수업료 정산</span>
          </Link>
        </div>
      </div>

      {/* Getting Started Guide */}
      {stats.totalStudents === 0 && (
        <div className="bg-[#FFF8E1] border border-[#F5C518]/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#2D2A26] mb-2">시작하기</h3>
          <p className="text-[#5D5A56] mb-4">
            위의 "빠른 입력" 기능을 사용하여 바로 시작할 수 있습니다!
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[#5D5A56]">
            <li>학생과 시간표를 한번에 입력하세요 (예: "김철수 50000 월수금")</li>
            <li>결석이나 보강은 간단히 입력하세요 (예: "김철수 3/18 결석")</li>
            <li>달력에서 자동으로 수업료가 계산됩니다</li>
          </ol>
        </div>
      )}
    </div>
  );
}