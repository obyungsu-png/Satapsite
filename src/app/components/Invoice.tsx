import { useRef } from 'react';
import { X, Printer, Copy, Check } from 'lucide-react';
import { MonthlyBilling, Student } from '../types';
import { format } from 'date-fns';
import { useState } from 'react';

interface InvoiceProps {
  billing: MonthlyBilling;
  student: Student | undefined;
  currentDate: Date;
  onClose: () => void;
}

export function Invoice({ billing, student, currentDate, onClose }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const issueDate = format(new Date(), 'yyyy년 M월 d일');
  const billingPeriod = `${year}년 ${month}월`;
  const invoiceNo = `INV-${year}${String(month).padStart(2, '0')}-${billing.studentId.slice(-4).toUpperCase()}`;
  const subjectLabel = student?.subject ? ` (${student.subject})` : '';

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build day rate details HTML
    let dayRateDetailsHTML = '';
    if (billing.dayRateDetails && billing.dayRateDetails.length > 0) {
      dayRateDetailsHTML = billing.dayRateDetails.map((detail) => `
        <tr>
          <td>${detail.day}요일 수업</td>
          <td style="text-align: center; color: #16A34A; font-weight: 500;">${detail.count}회 × ${detail.rate.toLocaleString()}원</td>
          <td>${detail.amount.toLocaleString()}원</td>
        </tr>
      `).join('');
    } else if (student?.isFreeSchedule) {
      dayRateDetailsHTML = `
        <tr>
          <td>출석 수업 <span class="badge badge-free">자유수업</span></td>
          <td>${billing.attendedClasses}회</td>
          <td>${(billing.attendedClasses * billing.pricePerClass).toLocaleString()}원</td>
        </tr>
      `;
    } else {
      dayRateDetailsHTML = `
        <tr>
          <td>출석 수업</td>
          <td>${billing.attendedClasses}회</td>
          <td>${billing.totalAmount.toLocaleString()}원</td>
        </tr>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>수업료 청구서 - ${billing.studentName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #2D2A26; }
          .invoice { max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #F5C518; }
          .header h1 { font-size: 22px; font-weight: 700; margin: 0 0 4px 0; }
          .header p { font-size: 13px; color: #8A8478; margin: 0; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 13px; }
          .meta-block p { margin: 4px 0; }
          .meta-label { color: #8A8478; }
          .meta-value { font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; font-size: 12px; color: #8A8478; font-weight: 500; padding: 10px 12px; border-bottom: 1px solid #F0EBE1; }
          th:last-child, td:last-child { text-align: right; }
          td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F0EBE1; }
          .total-row td { font-weight: 600; border-top: 2px solid #2D2A26; border-bottom: none; padding-top: 14px; }
          .total-amount { font-size: 20px; color: #B8860B; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #F0EBE1; font-size: 12px; color: #8A8478; text-align: center; }
          .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
          .badge-free { background: #F3E8FF; color: #7C3AED; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>수업료 청구서</h1>
            <p>TUITION INVOICE</p>
          </div>
          <div class="meta">
            <div class="meta-block">
              <p><span class="meta-label">학생명: </span><span class="meta-value">${billing.studentName}${subjectLabel}</span></p>
              ${student?.className ? `<p><span class="meta-label">반: </span><span class="meta-value">${student.className}</span></p>` : ''}
              ${student?.phoneNumber ? `<p><span class="meta-label">연락처: </span><span class="meta-value">${student.phoneNumber}</span></p>` : ''}
            </div>
            <div class="meta-block" style="text-align: right;">
              <p><span class="meta-label">청구번호: </span><span class="meta-value">${invoiceNo}</span></p>
              <p><span class="meta-label">청구기간: </span><span class="meta-value">${billingPeriod}</span></p>
              <p><span class="meta-label">발행일: </span><span class="meta-value">${issueDate}</span></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>항목</th>
                <th>내용</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>수업료 (1회)</td>
                <td>-</td>
                <td>${billing.pricePerClass.toLocaleString()}원</td>
              </tr>
              ${!student?.isFreeSchedule ? `
              <tr>
                <td>예정 수업</td>
                <td>${billing.scheduledClasses}회</td>
                <td>${(billing.scheduledClasses * billing.pricePerClass).toLocaleString()}원</td>
              </tr>` : ''}
              ${billing.absentClasses > 0 ? `
              <tr>
                <td>결석 차감</td>
                <td>${billing.absentClasses}회</td>
                <td style="color: #DC2626;">-${(billing.absentClasses * billing.pricePerClass).toLocaleString()}원</td>
              </tr>` : ''}
              ${dayRateDetailsHTML}
            </tbody>
            <tbody>
              <tr class="total-row">
                <td colspan="2">청구 금액</td>
                <td class="total-amount">${billing.totalAmount.toLocaleString()}원</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>본 청구서는 ${billingPeriod} 수업료 안내를 위해 발행되었습니다.</p>
            <p>문의사항이 있으시면 연락 부탁드립니다. 감사합니다.</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopyText = () => {
    const lines = [
      `📋 수업료 청구서`,
      ``,
      `학생명: ${billing.studentName}${subjectLabel}`,
      student?.className ? `반: ${student.className}` : '',
      `청구기간: ${billingPeriod}`,
      `발행일: ${issueDate}`,
      ``,
      `───────────────`,
      `수업료 (1회): ${billing.pricePerClass.toLocaleString()}원`,
      !student?.isFreeSchedule ? `예정 수업: ${billing.scheduledClasses}회` : '',
      billing.absentClasses > 0 ? `결석: ${billing.absentClasses}회 (-${(billing.absentClasses * billing.pricePerClass).toLocaleString()}원)` : '',
      `출석 수업: ${billing.attendedClasses}회`,
      `───────────────`,
      ``,
      `💰 청구 금액: ${billing.totalAmount.toLocaleString()}원`,
      ``,
      `감사합니다.`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE1]">
          <h3 className="text-base text-[#2D2A26]" style={{ fontWeight: 600 }}>청구서 미리보기</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5D5A56] border border-[#F0EBE1] rounded-lg hover:bg-[#FAFAF8] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '복사됨' : '텍스트 복사'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2D2A26] bg-[#F5C518] rounded-lg hover:bg-[#E5B616] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8A8478] hover:text-[#2D2A26] rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto p-6" ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="text-center mb-6 pb-5 border-b-2 border-[#F5C518]">
            <h2 className="text-xl text-[#2D2A26]" style={{ fontWeight: 700 }}>수업료 청구서</h2>
            <p className="text-xs text-[#8A8478] mt-1 tracking-widest">TUITION INVOICE</p>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between mb-6 text-sm">
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <span className="text-[#8A8478]">학생명</span>
                <span className="text-[#2D2A26]" style={{ fontWeight: 600 }}>{billing.studentName}{subjectLabel}</span>
              </div>
              {student?.className && (
                <div className="flex gap-2">
                  <span className="text-[#8A8478]">반</span>
                  <span className="text-[#2D2A26]" style={{ fontWeight: 500 }}>{student.className}</span>
                </div>
              )}
              {student?.phoneNumber && (
                <div className="flex gap-2">
                  <span className="text-[#8A8478]">연락처</span>
                  <span className="text-[#2D2A26]" style={{ fontWeight: 500 }}>{student.phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="text-right space-y-1.5">
              <div className="flex justify-end gap-2">
                <span className="text-[#8A8478]">청구번호</span>
                <span className="text-[#2D2A26] font-mono text-xs" style={{ fontWeight: 500 }}>{invoiceNo}</span>
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-[#8A8478]">청구기간</span>
                <span className="text-[#2D2A26]" style={{ fontWeight: 500 }}>{billingPeriod}</span>
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-[#8A8478]">발행일</span>
                <span className="text-[#2D2A26]" style={{ fontWeight: 500 }}>{issueDate}</span>
              </div>
            </div>
          </div>

          {/* Billing Details Table */}
          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-[#F0EBE1]">
                <th className="text-left text-xs text-[#8A8478] py-2.5 px-3" style={{ fontWeight: 500 }}>항목</th>
                <th className="text-center text-xs text-[#8A8478] py-2.5 px-3" style={{ fontWeight: 500 }}>내용</th>
                <th className="text-right text-xs text-[#8A8478] py-2.5 px-3" style={{ fontWeight: 500 }}>금액</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[#F0EBE1]">
                <td className="py-3 px-3 text-[#2D2A26]">수업료 (1회)</td>
                <td className="py-3 px-3 text-center text-[#8A8478]">-</td>
                <td className="py-3 px-3 text-right text-[#2D2A26]">{billing.pricePerClass.toLocaleString()}원</td>
              </tr>
              {!student?.isFreeSchedule && (
                <tr className="border-b border-[#F0EBE1]">
                  <td className="py-3 px-3 text-[#2D2A26]">예정 수업</td>
                  <td className="py-3 px-3 text-center text-[#2D2A26]">{billing.scheduledClasses}회</td>
                  <td className="py-3 px-3 text-right text-[#2D2A26]">
                    {(billing.scheduledClasses * billing.pricePerClass).toLocaleString()}원
                  </td>
                </tr>
              )}
              {billing.absentClasses > 0 && (
                <tr className="border-b border-[#F0EBE1]">
                  <td className="py-3 px-3 text-[#2D2A26]">결석 차감</td>
                  <td className="py-3 px-3 text-center text-red-500">{billing.absentClasses}회</td>
                  <td className="py-3 px-3 text-right text-red-500">
                    -{(billing.absentClasses * billing.pricePerClass).toLocaleString()}원
                  </td>
                </tr>
              )}
              {billing.dayRateDetails && billing.dayRateDetails.length > 0 ? (
                billing.dayRateDetails.map((detail, idx) => (
                  <tr key={idx} className="border-b border-[#F0EBE1]">
                    <td className="py-3 px-3 text-[#2D2A26]">
                      {detail.day}요일 수업
                    </td>
                    <td className="py-3 px-3 text-center text-green-600" style={{ fontWeight: 500 }}>
                      {detail.count}회 × {detail.rate.toLocaleString()}원
                    </td>
                    <td className="py-3 px-3 text-right text-[#2D2A26]">{detail.amount.toLocaleString()}원</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-[#F0EBE1]">
                  <td className="py-3 px-3 text-[#2D2A26]">
                    출석 수업
                    {student?.isFreeSchedule && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded" style={{ fontWeight: 500 }}>자유수업</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-green-600" style={{ fontWeight: 500 }}>{billing.attendedClasses}회</td>
                  <td className="py-3 px-3 text-right text-[#2D2A26]">{billing.totalAmount.toLocaleString()}원</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex items-center justify-between py-4 px-3 border-t-2 border-[#2D2A26]">
            <span className="text-sm text-[#2D2A26]" style={{ fontWeight: 600 }}>청구 금액</span>
            <span className="text-2xl text-[#B8860B]" style={{ fontWeight: 700 }}>
              {billing.totalAmount.toLocaleString()}원
            </span>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-[#F0EBE1] text-center space-y-1">
            <p className="text-xs text-[#8A8478]">
              본 청구서는 {billingPeriod} 수업료 안내를 위해 발행되었습니다.
            </p>
            <p className="text-xs text-[#8A8478]">
              문의사항이 있으시면 연락 부탁드립니다. 감사합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}