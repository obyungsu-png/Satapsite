import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Bell } from 'lucide-react';
import { Student } from '../types';
import { getStudents, markAttendance, getAttendance } from '../utils/storage';
import { getScheduledDaysForMonth } from '../utils/billing';
import { getClassColor } from '../utils/classes';
import { ClassFilter } from '../components/ClassFilter';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDaysInMonth,
} from 'date-fns';

export function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<Map<string, 'present' | 'absent'>>(new Map());
  const [paymentAlertPlayed, setPaymentAlertPlayed] = useState(false);
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);
  const [scheduledDays, setScheduledDays] = useState<Date[]>([]);

  // Check if today is payment notification day and show message automatically
  useEffect(() => {
    const today = new Date();
    const paymentDay = getPaymentNotificationDay(today);
    const isPaymentDayToday = isSameDay(today, paymentDay);
    
    // Check if user has already seen the message today
    const lastShownDate = localStorage.getItem('paymentMessageShownDate');
    const todayStr = format(today, 'yyyy-MM-dd');
    
    if (isPaymentDayToday && lastShownDate !== todayStr) {
      // Show message automatically after a short delay
      setTimeout(() => {
        playBirdSound();
        setShowPaymentMessage(true);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const paymentDay = getPaymentNotificationDay(today);
    
    if (isSameDay(today, paymentDay) && !paymentAlertPlayed) {
      playPaymentAlert();
      setPaymentAlertPlayed(true);
      setShowPaymentMessage(true);
    }
  }, []);

  const playPaymentAlert = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple pleasant notification sound
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    // Pleasant notification melody (C-E-G chord)
    playNote(523.25, now, 0.2); // C5
    playNote(659.25, now + 0.15, 0.2); // E5
    playNote(783.99, now + 0.3, 0.3); // G5
  };

  // Calculate payment notification day (2 days before end of month)
  const getPaymentNotificationDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(date);
    return new Date(year, month, daysInMonth - 2);
  };

  // Play bird sound on bell hover
  const playBirdSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple bird chirp sound
    const playChirp = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    // Bird chirp melody
    playChirp(1200, now, 0.08);
    playChirp(1400, now + 0.08, 0.08);
    playChirp(1100, now + 0.16, 0.12);
  };

  const handleBellHover = () => {
    playBirdSound();
    setShowPaymentMessage(true);
    setTimeout(() => setShowPaymentMessage(false), 2000);
  };

  const handleMessageClick = () => {
    setShowPaymentMessage(false);
    // Save that user has seen the message today
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem('paymentMessageShownDate', todayStr);
  };

  useEffect(() => {
    const loadData = async () => {
      const loadedStudents = await getStudents();
      setStudents(loadedStudents);
      if (loadedStudents.length > 0) {
        setSelectedStudent(loadedStudents[0].id);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, selectedClass]);

  useEffect(() => {
    if (selectedStudent) {
      loadAttendance();
    }
  }, [selectedStudent, currentDate]);

  const filterStudents = () => {
    if (!selectedClass) {
      setFilteredStudents(students);
    } else if (selectedClass === 'no-class') {
      setFilteredStudents(students.filter(s => !s.className));
    } else {
      setFilteredStudents(students.filter(s => s.className === selectedClass));
    }
    
    // Update selected student if it's not in filtered list
    if (filteredStudents.length > 0 && !filteredStudents.find(s => s.id === selectedStudent)) {
      setSelectedStudent(filteredStudents[0].id);
    }
  };

  const loadAttendance = async () => {
    const allRecords = await getAttendance();
    const records = allRecords.filter(
      a =>
        a.studentId === selectedStudent &&
        new Date(a.date).getFullYear() === currentDate.getFullYear() &&
        new Date(a.date).getMonth() === currentDate.getMonth()
    );

    const map = new Map<string, 'present' | 'absent'>();
    records.forEach(record => {
      map.set(record.date, record.status);
    });
    setAttendance(map);
  };

  useEffect(() => {
    const loadScheduledDays = async () => {
      if (selectedStudent) {
        const days = await getScheduledDaysForMonth(
          selectedStudent,
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
        setScheduledDays(days);
      } else {
        setScheduledDays([]);
      }
    };
    
    loadScheduledDays();
  }, [selectedStudent, currentDate]);

  const handleDayClick = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentStatus = attendance.get(dateStr);

    // Cycle through: undefined -> absent -> undefined
    const newStatus = currentStatus === 'absent' ? undefined : 'absent';

    if (newStatus) {
      await markAttendance(selectedStudent, dateStr, newStatus);
    } else {
      // Remove the absence marking - need to use the API's removeAttendance
      const { removeAttendance } = await import('../utils/storage');
      await removeAttendance(selectedStudent, dateStr);
    }

    await loadAttendance();
  };

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Get the starting day of week (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = firstDay.getDay();

  // Create calendar grid
  const calendarDays: (Date | null)[] = [
    ...Array(startingDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      {/* Payment Message Overlay */}
      {showPaymentMessage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 cursor-pointer"
          onClick={handleMessageClick}
        >
          <div className="animate-message-popup">
            <div className="bg-gradient-to-br from-[#F5C518] to-[#FFD700] text-[#2D2A26] px-12 py-8 rounded-3xl shadow-2xl border-4 border-white">
              <p className="text-4xl font-bold text-center whitespace-nowrap">
                이번달 납부일입니다
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">출결 관리</h2>
        <p className="text-gray-600 mt-1">학생의 결석일을 관리합니다</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 학생이 없습니다</h3>
          <p className="text-gray-600">먼저 학생을 추가해주세요</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-6">
          {/* Student Selector */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 선택
              </label>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              >
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}{student.subject ? ` (${student.subject})` : ''} {student.className ? `[${student.className}]` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-7">
              <ClassFilter selectedClass={selectedClass} onClassChange={setSelectedClass} />
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-[#FFF8E1] rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-[#2D2A26]">
              {format(currentDate, 'yyyy년 M월')}
            </h3>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-[#FFF8E1] rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateStr = format(day, 'yyyy-MM-dd');
                const isScheduled = scheduledDays.some(sd => isSameDay(sd, day));
                const status = attendance.get(dateStr);
                const isToday = isSameDay(day, new Date());
                const paymentDay = getPaymentNotificationDay(currentDate);
                const isPaymentDay = isSameDay(day, paymentDay);

                return (
                  <button
                    key={dateStr}
                    onClick={() => isScheduled && handleDayClick(day)}
                    disabled={!isScheduled}
                    className={`aspect-square p-2 rounded-xl border-2 transition-all relative ${
                      !isScheduled
                        ? 'border-transparent bg-[#FAF7F2] text-[#D9D3C7] cursor-not-allowed'
                        : status === 'absent'
                        ? 'border-red-400 bg-red-50 text-red-700 hover:bg-red-100'
                        : 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                    } ${isToday ? 'ring-2 ring-[#F5C518]' : ''} ${
                      isPaymentDay ? 'ring-2 ring-offset-2 ring-[#F5C518]' : ''
                    }`}
                  >
                    <div className="text-sm font-medium">{format(day, 'd')}</div>
                    {isScheduled && (
                      <div className="text-xs mt-1">
                        {status === 'absent' ? '결석' : '출석'}
                      </div>
                    )}
                    {status === 'absent' && (
                      <X className="w-3 h-3 absolute top-1 right-1" />
                    )}
                    {isPaymentDay && (
                      <div className="absolute -top-1 -right-1 bg-[#F5C518] rounded-full p-1 shadow-md animate-pulse" onMouseEnter={handleBellHover}>
                        <Bell className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {selectedStudentData && (
            <div className="bg-[#FFFDF7] rounded-xl p-4 border border-[#F0EBE1]">
              <h4 className="font-medium text-[#2D2A26] mb-2">출결 요약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">예정 수업</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {scheduledDays.length}회
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">결석</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {Array.from(attendance.values()).filter(s => s === 'absent').length}회
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">출석 (계산용)</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {scheduledDays.length -
                      Array.from(attendance.values()).filter(s => s === 'absent').length}
                    회
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-[#FFF8E1] border border-[#F5C518]/30 rounded-2xl p-4">
        <h4 className="font-medium text-[#2D2A26] mb-2">💡 사용 안내</h4>
        <ul className="text-sm text-[#5D5A56] space-y-1">
          <li>• 초록색: 예정된 수업일 (출석으로 계산됨)</li>
          <li>• 빨간색: 결석으로 표시된 날 (수업료에서 차감)</li>
          <li>• 회색: 수업이 없는 날</li>
          <li>• 수업일을 클릭하면 결석으로 표시되고, 다시 클릭하면 출석으로 변경됩니다</li>
          <li>• 🔔 벨 아이콘: 납부 용지 배부일 (매달 말 2틀 전)</li>
        </ul>
      </div>
    </div>
  );
}