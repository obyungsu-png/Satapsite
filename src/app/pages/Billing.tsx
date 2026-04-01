import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Edit2, Check, X } from 'lucide-react';
import { MonthlyBilling } from '../types';
import { calculateMonthlyBilling } from '../utils/billing';
import { getStudents, getBillingAdjustment, setBillingAdjustment, removeBillingAdjustment, getPaymentStatus, setPaymentStatus } from '../utils/storage';
import { getClassColor } from '../utils/classes';
import { ClassFilter } from '../components/ClassFilter';
import { Invoice } from '../components/Invoice';
import { Checkbox } from '../components/ui/checkbox';
import { format, addMonths, subMonths } from 'date-fns';

export function Billing() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [billingData, setBillingData] = useState<MonthlyBilling[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filteredBilling, setFilteredBilling] = useState<MonthlyBilling[]>([]);
  const [invoiceBilling, setInvoiceBilling] = useState<MonthlyBilling | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadBillingData();
    loadStudents();
  }, [currentDate]);

  useEffect(() => {
    filterBilling();
  }, [billingData, selectedClass]);

  const loadBillingData = async () => {
    const data = await calculateMonthlyBilling(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    
    // Apply adjustments
    const adjustedData = await Promise.all(data.map(async billing => {
      const adjustment = await getBillingAdjustment(
        billing.studentId,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      if (adjustment !== null) {
        return { ...billing, totalAmount: adjustment, isAdjusted: true };
      }
      return { ...billing, isAdjusted: false };
    }));
    
    setBillingData(adjustedData as MonthlyBilling[]);
    
    // Load payment statuses for the new billing data
    const statuses: {[key: string]: boolean} = {};
    for (const billing of adjustedData) {
      const isPaid = await getPaymentStatus(
        billing.studentId,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      statuses[billing.studentId] = isPaid;
    }
    setPaymentStatuses(statuses);
  };

  const loadStudents = async () => {
    const allStudents = await getStudents();
    setStudents(allStudents);
  };

  const filterBilling = async () => {
    if (!selectedClass) {
      setFilteredBilling(billingData);
    } else {
      if (selectedClass === 'no-class') {
        const noClassStudentIds = students.filter(s => !s.className).map(s => s.id);
        setFilteredBilling(billingData.filter(b => noClassStudentIds.includes(b.studentId)));
      } else {
        const classStudentIds = students.filter(s => s.className === selectedClass).map(s => s.id);
        setFilteredBilling(billingData.filter(b => classStudentIds.includes(b.studentId)));
      }
    }
  };

  const togglePayment = async (studentId: string) => {
    const currentStatus = paymentStatuses[studentId] || false;
    const newStatus = !currentStatus;
    
    try {
      await setPaymentStatus(
        studentId,
        currentDate.getFullYear(),
        currentDate.getMonth(),
        newStatus
      );
      
      setPaymentStatuses(prev => ({
        ...prev,
        [studentId]: newStatus
      }));
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('수업료 수령 상태를 업데이트하는데 실패했습니다');
    }
  };

  const startEdit = (billing: MonthlyBilling) => {
    setEditingId(billing.studentId);
    setEditValue(billing.totalAmount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (studentId: string) => {
    const amount = parseInt(editValue.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount < 0) {
      alert('올바른 금액을 입력해주세요');
      return;
    }

    await setBillingAdjustment(
      studentId,
      currentDate.getFullYear(),
      currentDate.getMonth(),
      amount
    );
    
    setEditingId(null);
    setEditValue('');
    await loadBillingData();
  };

  const resetAdjustment = async (studentId: string) => {
    await removeBillingAdjustment(
      studentId,
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    await loadBillingData();
  };

  const totalRevenue = filteredBilling.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalClasses = filteredBilling.reduce((sum, b) => sum + b.attendedClasses, 0);
  const totalAbsences = filteredBilling.reduce((sum, b) => sum + b.absentClasses, 0);

  const openInvoice = (billing: MonthlyBilling) => {
    setInvoiceBilling(billing);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2D2A26]">수업료 정산</h2>
        <p className="text-[#8A8478] mt-1">월별 수업료를 확인하고 학부모에게 청구서를 보낼 수 있습니다</p>
      </div>

      {/* Month Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE1]">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-base text-[#2D2A26]" style={{ fontWeight: 600 }}>
              {format(currentDate, 'yyyy년 M월')} 정산
            </h3>
            <ClassFilter selectedClass={selectedClass} onClassChange={setSelectedClass} />
          </div>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 border-b border-[#F0EBE1]">
          <div className="px-6 py-4 border-r border-[#F0EBE1]">
            <p className="text-xs text-[#8A8478] mb-1">총 수입</p>
            <p className="text-xl text-[#B8860B]" style={{ fontWeight: 700 }}>
              {totalRevenue.toLocaleString()}원
            </p>
          </div>
          <div className="px-6 py-4 border-r border-[#F0EBE1]">
            <p className="text-xs text-[#8A8478] mb-1">총 출석 수업</p>
            <p className="text-xl text-green-700" style={{ fontWeight: 700 }}>{totalClasses}회</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-[#8A8478] mb-1">총 결석</p>
            <p className="text-xl text-red-600" style={{ fontWeight: 700 }}>{totalAbsences}회</p>
          </div>
        </div>

        {/* Billing Table */}
        {filteredBilling.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#8A8478]">해당 월의 정산 데이터가 없습니다</p>
            <p className="text-xs text-[#C4BFB6] mt-1">
              학생 추가 및 스케줄 설정을 먼저 진행해주세요
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF8]">
                <th className="text-left py-2.5 px-5 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  학생명
                </th>
                <th className="text-center py-2.5 px-3 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  예정
                </th>
                <th className="text-center py-2.5 px-3 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  결석
                </th>
                <th className="text-center py-2.5 px-3 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  출석
                </th>
                <th className="text-right py-2.5 px-3 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  단가
                </th>
                <th className="text-center py-2.5 px-3 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  수령
                </th>
                <th className="text-right py-2.5 px-5 text-xs text-[#8A8478]" style={{ fontWeight: 500 }}>
                  청구 금액
                </th>
                <th className="py-2.5 px-3 text-xs text-[#8A8478] w-24" style={{ fontWeight: 500 }}>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBilling.map((billing, idx) => {
                const student = students.find(s => s.id === billing.studentId);
                const classColor = getClassColor(student?.className);
                const isEditing = editingId === billing.studentId;
                const isAdjusted = (billing as any).isAdjusted;
                
                return (
                  <tr
                    key={billing.studentId}
                    className={`group hover:bg-[#FFFDF7] transition-colors ${
                      idx !== filteredBilling.length - 1 ? 'border-b border-[#F0EBE1]' : ''
                    }`}
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: classColor }}
                        />
                        <span className="text-sm text-[#2D2A26]" style={{ fontWeight: 500 }}>
                          {billing.studentName}
                        </span>
                        {student?.subject && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                            {student.subject}
                          </span>
                        )}
                        {student?.className && (
                          <span className="text-[11px] text-[#8A8478]">({student.className})</span>
                        )}
                        {student?.isFreeSchedule && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600" style={{ fontWeight: 500 }}>
                            자유
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-[#8A8478]">
                      {student?.isFreeSchedule ? '-' : `${billing.scheduledClasses}회`}
                    </td>
                    <td className="py-3 px-3 text-center text-sm">
                      <span className={billing.absentClasses > 0 ? 'text-red-500' : 'text-[#8A8478]'} style={{ fontWeight: billing.absentClasses > 0 ? 500 : 400 }}>
                        {billing.absentClasses}회
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-sm">
                      <span className="text-green-600" style={{ fontWeight: 500 }}>
                        {billing.attendedClasses}회
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-[#8A8478]">
                      {billing.pricePerClass.toLocaleString()}원
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Checkbox
                        checked={paymentStatuses[billing.studentId] || false}
                        onCheckedChange={() => togglePayment(billing.studentId)}
                      />
                    </td>
                    <td className="py-3 px-5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-24 px-2 py-1 text-sm text-right border border-[#F5C518] rounded focus:outline-none focus:ring-1 focus:ring-[#F5C518]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(billing.studentId);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <span className="text-xs text-[#8A8478]">원</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-sm ${isAdjusted ? 'text-[#B8860B]' : 'text-[#2D2A26]'}`} style={{ fontWeight: 600 }}>
                              {billing.totalAmount.toLocaleString()}원
                            </span>
                            {isAdjusted && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFF8E1] text-[#B8860B]" style={{ fontWeight: 500 }}>
                                수정됨
                              </span>
                            )}
                          </div>
                          {billing.dayRateDetails && billing.dayRateDetails.length > 0 && (
                            <div className="flex items-center justify-end gap-1 text-[10px] text-[#8A8478]">
                              {billing.dayRateDetails.map((detail, idx) => (
                                <span key={idx} className="whitespace-nowrap">
                                  {detail.day}{detail.rate.toLocaleString()}×{detail.count}
                                  {idx < billing.dayRateDetails!.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => saveEdit(billing.studentId)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="저장"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="취소"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(billing)}
                            className="p-1 text-[#B8860B] hover:bg-[#FFF8E1] rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="금액 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdjusted && (
                            <button
                              onClick={() => resetAdjustment(billing.studentId)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="원래 금액으로 복원"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openInvoice(billing)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-[#B8860B] bg-[#FFF8E1] rounded-md hover:bg-[#FFEFB8] transition-colors"
                            style={{ fontWeight: 500 }}
                            title="청구서 보기"
                          >
                            <FileText className="w-3 h-3" />
                            청구서
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#2D2A26] bg-[#FAFAF8]">
                <td className="py-3.5 px-5 text-sm text-[#2D2A26]" style={{ fontWeight: 600 }}>합계</td>
                <td className="py-3.5 px-3 text-center text-sm text-[#8A8478]" style={{ fontWeight: 500 }}>
                  {filteredBilling.reduce((sum, b) => sum + b.scheduledClasses, 0)}회
                </td>
                <td className="py-3.5 px-3 text-center text-sm text-red-500" style={{ fontWeight: 500 }}>
                  {totalAbsences}회
                </td>
                <td className="py-3.5 px-3 text-center text-sm text-green-600" style={{ fontWeight: 500 }}>
                  {totalClasses}회
                </td>
                <td className="py-3.5 px-3"></td>
                <td className="py-3.5 px-5 text-right">
                  <span className="text-base text-[#B8860B]" style={{ fontWeight: 700 }}>
                    {totalRevenue.toLocaleString()}원
                  </span>
                </td>
                <td className="py-3.5 px-3"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#FFF8E1] border border-[#F5C518]/30 rounded-2xl p-4">
        <h4 className="text-sm text-[#2D2A26] mb-2" style={{ fontWeight: 600 }}>💡 정산 안내</h4>
        <ul className="text-xs text-[#5D5A56] space-y-1">
          <li>• <strong>정기 학생</strong>: 예정 수업 - 결석 = 출석 수업</li>
          <li>• <strong>자유수업 학생</strong>: 출석 체크한 날만 계산 (예정 수업 "-" 표시)</li>
          <li>• 청구 금액 = 출석 수업 × 수업료/회</li>
          <li>• <strong>수령 체크박스</strong>: 단가 옆의 체크박스를 클릭하여 수업료를 받은 여부를 기록할 수 있습니다</li>
          <li>• <strong>금액 수정</strong>: 각 행에 마우스를 올리면 수정 버튼이 나타나며, 클릭하여 금액을 직접 수정할 수 있습니다</li>
          <li>• <strong>청구서</strong> 버튼을 눌러 학부모에게 보낼 청구서를 인쇄하거나 텍스트로 복사할 수 있습니다</li>
        </ul>
      </div>

      {/* Invoice Modal */}
      {invoiceBilling && (
        <Invoice
          billing={invoiceBilling}
          student={students.find(s => s.id === invoiceBilling.studentId)}
          currentDate={currentDate}
          onClose={() => setInvoiceBilling(null)}
        />
      )}
    </div>
  );
}