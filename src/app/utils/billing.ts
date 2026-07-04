import { Student, WeeklySchedule, AttendanceRecord, MonthlyBilling } from '../types';
import { getStudents, getSchedule, getAttendance } from './storage';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns';

const dayIndexToKey: { [key: number]: keyof WeeklySchedule[string] } = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const dayKeyToKorean: { [key in keyof WeeklySchedule[string]]: string } = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일',
};

export const calculateMonthlyBilling = async (year: number, month: number): Promise<MonthlyBilling[]> => {
  const students = await getStudents();
  const schedule = await getSchedule();
  const attendance = await getAttendance();
  
  const firstDay = startOfMonth(new Date(year, month, 1));
  const lastDay = endOfMonth(new Date(year, month, 1));
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  // 각 학생별로 계산
  const individualBillings = students.map(student => {
    // 자유수업 학생 처리
    if (student.isFreeSchedule) {
      const monthAttendance = attendance.filter(a => {
        if (a.studentId !== student.id) return false;
        const date = new Date(a.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
      
      const presentClasses = monthAttendance.filter(a => a.status === 'present').length;
      
      return {
        studentId: student.id,
        studentName: student.displayName,
        subject: student.subject,
        scheduledClasses: presentClasses,
        attendedClasses: presentClasses,
        absentClasses: 0,
        pricePerClass: student.pricePerClass,
        totalAmount: presentClasses * student.pricePerClass,
      };
    }
    
    // 정기 수업 학생 처리
    const studentSchedule = schedule[student.id] || {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    
    // Count absences first
    const monthAttendance = attendance.filter(a => {
      if (a.studentId !== student.id) return false;
      const date = new Date(a.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    
    const absentDates = new Set(
      monthAttendance
        .filter(a => a.status === 'absent')
        .map(a => a.date)
    );
    
    // Calculate total amount with day-specific rates
    let scheduledClasses = 0;
    let totalAmount = 0;
    const dayRateCounts: { [key: string]: { rate: number; count: number } } = {};
    
    daysInMonth.forEach(day => {
      const dayOfWeek = getDay(day);
      const dayKey = dayIndexToKey[dayOfWeek];
      
      if (studentSchedule[dayKey]) {
        scheduledClasses++;
        
        // Check if not absent on this day
        const dateStr = format(day, 'yyyy-MM-dd');
        if (!absentDates.has(dateStr)) {
          // Use day-specific rate if available, otherwise use default
          const dayRate = student.dayRates?.[dayKey] || student.pricePerClass;
          totalAmount += dayRate;
          
          // Track day-specific counts for display
          const korean = dayKeyToKorean[dayKey];
          if (!dayRateCounts[korean]) {
            dayRateCounts[korean] = { rate: dayRate, count: 0 };
          }
          dayRateCounts[korean].count++;
        }
      }
    });
    
    const absentClasses = absentDates.size;
    const attendedClasses = scheduledClasses - absentClasses;
    
    // Build dayRateDetails
    const dayRateDetails = Object.entries(dayRateCounts).map(([day, { rate, count }]) => ({
      day,
      rate,
      count,
      amount: rate * count,
    }));
    
    return {
      studentId: student.id,
      studentName: student.displayName,
      subject: student.subject,
      scheduledClasses,
      attendedClasses,
      absentClasses,
      pricePerClass: student.pricePerClass,
      totalAmount,
      dayRateDetails: dayRateDetails.length > 0 ? dayRateDetails : undefined,
    };
  });
  
  // 같은 displayName을 가진 학생들을 합산
  const grouped = new Map<string, MonthlyBilling>();
  
  individualBillings.forEach(billing => {
    const key = billing.studentName;
    
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.scheduledClasses += billing.scheduledClasses;
      existing.attendedClasses += billing.attendedClasses;
      existing.absentClasses += billing.absentClasses;
      existing.totalAmount += billing.totalAmount;
      existing.subject = existing.subject 
        ? `${existing.subject}, ${billing.subject}` 
        : billing.subject;
      
      // Merge dayRateDetails
      if (billing.dayRateDetails && billing.dayRateDetails.length > 0) {
        if (!existing.dayRateDetails) {
          existing.dayRateDetails = [];
        }
        billing.dayRateDetails.forEach(detail => {
          const existingDetail = existing.dayRateDetails!.find(d => d.day === detail.day && d.rate === detail.rate);
          if (existingDetail) {
            existingDetail.count += detail.count;
            existingDetail.amount += detail.amount;
          } else {
            existing.dayRateDetails!.push({ ...detail });
          }
        });
      }
    } else {
      grouped.set(key, { ...billing });
    }
  });
  
  return Array.from(grouped.values());
};

export const getScheduledDaysForMonth = async (
  studentId: string,
  year: number,
  month: number
): Promise<Date[]> => {
  const schedule = await getSchedule();
  const studentSchedule = schedule[studentId];
  
  if (!studentSchedule) return [];
  
  const firstDay = startOfMonth(new Date(year, month, 1));
  const lastDay = endOfMonth(new Date(year, month, 1));
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  
  return daysInMonth.filter(day => {
    const dayOfWeek = getDay(day);
    const dayKey = dayIndexToKey[dayOfWeek];
    return studentSchedule[dayKey];
  });
};