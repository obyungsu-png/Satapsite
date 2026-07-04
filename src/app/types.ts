export interface Student {
  id: string;
  name: string; // 실제 저장되는 이름 (예: "김철수A", "김철수B")
  displayName: string; // 화면에 표시되는 이름 (예: "김철수")
  phoneNumber: string;
  pricePerClass: number;
  subject: string; // 과목 필수
  className?: string;
  isFreeSchedule?: boolean; // 자유수업 여부
  dayRates?: { // 요일별 금액 (선택적, 없으면 pricePerClass 사용)
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
    sunday?: number;
  };
  createdAt: string;
}

export interface WeeklySchedule {
  [studentId: string]: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface MonthlyBilling {
  studentId: string;
  studentName: string;
  subject?: string;
  scheduledClasses: number;
  attendedClasses: number;
  absentClasses: number;
  pricePerClass: number;
  totalAmount: number;
  dayRateDetails?: { // 요일별 수업료 세부 정보
    day: string; // 한글 요일명 (예: "월", "수", "금")
    rate: number; // 해당 요일 수업료
    count: number; // 해당 요일에 출석한 수업 수
    amount: number; // 해당 요일 총 금액
  }[];
}

export interface Class {
  id: string;
  name: string;
  color: string;
}

export interface PerformanceItem {
  id: string;
  date: string; // yyyy-MM-dd
  type: 'assessment' | 'school-event';
  title: string;
  note?: string;
  className?: string;
  createdAt: string;
}

export interface PaymentStatus {
  studentId: string;
  year: number;
  month: number;
  isPaid: boolean;
}