import { Student, WeeklySchedule, AttendanceRecord, PerformanceItem, PaymentStatus } from '../types';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a8a911aa`;

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'API request failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error(`API Error (${endpoint}):`, {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error(`Network Error (${endpoint}):`, {
      error,
      apiBase: API_BASE,
      endpoint,
      fullUrl: `${API_BASE}${endpoint}`,
    });
    throw error;
  }
}

// ============ Students ============
export const getStudents = async (): Promise<Student[]> => {
  try {
    const data = await apiCall('/students');
    return data.students || [];
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
};

export const saveStudents = async (students: Student[]): Promise<void> => {
  // This function is not used with API-based storage
  console.warn('saveStudents is deprecated with API storage');
};

export const addStudent = async (data: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
  try {
    const students = await getStudents();
    
    // displayName이 없으면 name에서 추출
    const displayName = data.displayName || data.name;
    
    // 같은 displayName과 subject를 가진 학생이 있는지 확인
    const existingWithSameSubject = students.filter(
      s => s.displayName === displayName && s.subject === data.subject
    );
    
    let finalName = data.name;
    
    // 만약 name에 A, B가 없고 이미 같은 과목이 있다면 자동으로 접미사 추가
    if (!data.name.match(/[A-Z]$/) && existingWithSameSubject.length > 0) {
      // A, B, C... 중 사용 가능한 것 찾기
      const usedSuffixes = existingWithSameSubject
        .map(s => s.name.match(/([A-Z])$/)?.[1])
        .filter(Boolean);
      
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const char of alphabet) {
        if (!usedSuffixes.includes(char)) {
          finalName = displayName + char;
          break;
        }
      }
    }
    
    const response = await apiCall('/students', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        name: finalName,
        displayName: displayName,
      }),
    });
    
    return response.student;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
  try {
    await apiCall(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await apiCall(`/students/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// ============ Schedule ============
export const getSchedule = async (): Promise<WeeklySchedule> => {
  try {
    const data = await apiCall('/schedules');
    return data.schedules || {};
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return {};
  }
};

export const saveSchedule = async (schedule: WeeklySchedule): Promise<void> => {
  // This function is not used with API-based storage
  console.warn('saveSchedule is deprecated with API storage');
};

export const updateStudentSchedule = async (studentId: string, schedule: WeeklySchedule[string]): Promise<void> => {
  try {
    await apiCall(`/schedules/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({ schedule }),
    });
  } catch (error) {
    console.error('Error updating student schedule:', error);
    throw error;
  }
};

// ============ Attendance ============
export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    const data = await apiCall('/attendance');
    return data.attendance || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};

export const saveAttendance = async (attendance: AttendanceRecord[]): Promise<void> => {
  // This function is not used with API-based storage
  console.warn('saveAttendance is deprecated with API storage');
};

export const markAttendance = async (studentId: string, date: string, status: 'present' | 'absent'): Promise<void> => {
  try {
    await apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify({ studentId, date, status }),
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const markPresent = async (studentId: string, date: string): Promise<void> => {
  await markAttendance(studentId, date, 'present');
};

export const removeAttendance = async (studentId: string, date: string): Promise<void> => {
  try {
    await apiCall(`/attendance/${studentId}/${date}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing attendance:', error);
    throw error;
  }
};

export const getAttendanceForMonth = async (studentId: string, year: number, month: number): Promise<AttendanceRecord[]> => {
  const attendance = await getAttendance();
  return attendance.filter(a => {
    if (a.studentId !== studentId) return false;
    const date = new Date(a.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

// ============ Billing Adjustments ============
export interface BillingAdjustment {
  studentId: string;
  year: number;
  month: number;
  adjustedAmount: number;
}

export const getBillingAdjustments = async (): Promise<BillingAdjustment[]> => {
  try {
    const data = await apiCall('/billing-adjustments');
    return data.adjustments || [];
  } catch (error) {
    console.error('Error fetching billing adjustments:', error);
    return [];
  }
};

export const saveBillingAdjustments = async (adjustments: BillingAdjustment[]): Promise<void> => {
  // This function is not used with API-based storage
  console.warn('saveBillingAdjustments is deprecated with API storage');
};

export const getBillingAdjustment = async (studentId: string, year: number, month: number): Promise<number | null> => {
  const adjustments = await getBillingAdjustments();
  const adjustment = adjustments.find(
    a => a.studentId === studentId && a.year === year && a.month === month
  );
  return adjustment ? adjustment.adjustedAmount : null;
};

export const setBillingAdjustment = async (studentId: string, year: number, month: number, adjustedAmount: number): Promise<void> => {
  try {
    await apiCall('/billing-adjustments', {
      method: 'POST',
      body: JSON.stringify({ studentId, year, month, adjustedAmount }),
    });
  } catch (error) {
    console.error('Error setting billing adjustment:', error);
    throw error;
  }
};

export const removeBillingAdjustment = async (studentId: string, year: number, month: number): Promise<void> => {
  try {
    await apiCall(`/billing-adjustments/${studentId}/${year}/${month}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing billing adjustment:', error);
    throw error;
  }
};

// ============ Performance / School Events ============
const PERFORMANCE_EVENTS_KEY = 'academy_performance_events';

export const getPerformanceEvents = async (): Promise<PerformanceItem[]> => {
  try {
    const raw = localStorage.getItem(PERFORMANCE_EVENTS_KEY);
    const parsed: PerformanceItem[] = raw ? JSON.parse(raw) : [];
    return parsed.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching performance events:', error);
    return [];
  }
};

export const savePerformanceEvents = async (events: PerformanceItem[]): Promise<void> => {
  localStorage.setItem(PERFORMANCE_EVENTS_KEY, JSON.stringify(events));
};

export const addPerformanceEvent = async (
  data: Omit<PerformanceItem, 'id' | 'createdAt'>,
): Promise<PerformanceItem> => {
  const current = await getPerformanceEvents();
  const newEvent: PerformanceItem = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await savePerformanceEvents([...current, newEvent]);
  return newEvent;
};

export const deletePerformanceEvent = async (id: string): Promise<void> => {
  const current = await getPerformanceEvents();
  await savePerformanceEvents(current.filter((event) => event.id !== id));
};

// ============ Payment Status ============
export const getPaymentStatuses = async (): Promise<PaymentStatus[]> => {
  try {
    const data = await apiCall('/payment-statuses');
    return data.statuses || [];
  } catch (error) {
    console.error('Error fetching payment statuses:', error);
    return [];
  }
};

export const getPaymentStatus = async (studentId: string, year: number, month: number): Promise<boolean> => {
  const statuses = await getPaymentStatuses();
  const status = statuses.find(
    s => s.studentId === studentId && s.year === year && s.month === month
  );
  return status ? status.isPaid : false;
};

export const setPaymentStatus = async (studentId: string, year: number, month: number, isPaid: boolean): Promise<void> => {
  try {
    await apiCall('/payment-statuses', {
      method: 'POST',
      body: JSON.stringify({ studentId, year, month, isPaid }),
    });
  } catch (error) {
    console.error('Error setting payment status:', error);
    throw error;
  }
};

export const removePaymentStatus = async (studentId: string, year: number, month: number): Promise<void> => {
  try {
    await apiCall(`/payment-statuses/${studentId}/${year}/${month}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error removing payment status:', error);
    throw error;
  }
};