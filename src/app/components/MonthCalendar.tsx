import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { getStudents, getSchedule, getAttendance } from '../utils/storage';
import { getScheduledDaysForMonth } from '../utils/billing';
import { getClassColor } from '../utils/classes';
import { ClassFilter } from './ClassFilter';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  getDay,
  getDaysInMonth,
} from 'date-fns';

export function MonthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [calendarData, setCalendarData] = useState<Map<string, Array<{student: string, className?: string, status: string}>>>(new Map());
  const [showPaymentMessage, setShowPaymentMessage] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, selectedClass]);

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

  const loadCalendarData = async () => {
    const allStudents = await getStudents();
    const students = selectedClass 
      ? selectedClass === 'no-class'
        ? allStudents.filter(s => !s.className)
        : allStudents.filter(s => s.className === selectedClass)
      : allStudents;
    
    const attendance = await getAttendance();
    const data = new Map<string, Array<{student: string, className?: string, status: string}>>();

    for (const student of students) {
      const scheduledDays = await getScheduledDaysForMonth(
        student.id,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );

      scheduledDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const attendanceRecord = attendance.find(
          a => a.studentId === student.id && a.date === dateStr
        );

        const status = attendanceRecord?.status === 'absent' ? '결석' : '출석';
        const studentInfo = {
          student: student.name,
          className: student.className,
          status,
        };

        if (!data.has(dateStr)) {
          data.set(dateStr, []);
        }
        data.get(dateStr)!.push(studentInfo);
      });
    }

    setCalendarData(data);
  };

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startDayOfWeek = getDay(firstDay);

  const calendarCells: (Date | null)[] = [
    ...Array(startDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  // Calculate payment notification day (2 days before end of month)
  const getPaymentNotificationDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonthCount = getDaysInMonth(date);
    return new Date(year, month, daysInMonthCount - 2);
  };

  const paymentDay = getPaymentNotificationDay(currentDate);

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
    // Bird chirp melody (높은 음에서 낮은 음으로)
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] overflow-hidden relative">{/* Payment Message Overlay */}
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EBE1]">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-3">
          <h3 className="text-base text-[#2D2A26]" style={{ fontWeight: 600 }}>
            {format(currentDate, 'yyyy년 M월')}
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

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-[#F0EBE1]">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div
            key={idx}
            className={`text-center text-xs py-2 ${
              idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
            style={{ fontWeight: 500 }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarCells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[100px] border-b border-r border-[#F0EBE1] last:border-r-0"
              />
            );
          }

          const dateStr = format(day, 'yyyy-MM-dd');
          const entries = calendarData.get(dateStr) || [];
          const today = isToday(day);
          const isPaymentDay = isSameDay(day, paymentDay);
          const dayOfWeek = getDay(day);
          const MAX_VISIBLE = 4;
          const hasMore = entries.length > MAX_VISIBLE;

          return (
            <div
              key={dateStr}
              className={`min-h-[100px] border-b border-r border-[#F0EBE1] p-1.5 relative ${
                today ? 'bg-[#FFFBEB]' : isPaymentDay ? 'bg-[#FFF8E1]' : 'bg-white'
              }`}
            >
              {/* Payment Day Bell Icon */}
              {isPaymentDay && (
                <div 
                  className="absolute top-1 right-1 bg-[#F5C518] rounded-full p-1 shadow-md animate-pulse z-10 cursor-pointer"
                  onMouseEnter={handleBellHover}
                >
                  <Bell className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    today
                      ? 'bg-[#F5C518] text-[#2D2A26]'
                      : isPaymentDay
                      ? 'bg-[#FFD700] text-[#2D2A26] font-bold'
                      : dayOfWeek === 0
                      ? 'text-red-400'
                      : dayOfWeek === 6
                      ? 'text-blue-400'
                      : 'text-gray-600'
                  }`}
                  style={{ fontWeight: today || isPaymentDay ? 700 : 500 }}
                >
                  {format(day, 'd')}
                </span>
                {entries.length > 0 && (
                  <span className="text-[10px] text-gray-400">{entries.length}</span>
                )}
              </div>

              {/* Student entries */}
              <div className="space-y-0.5">
                {entries.slice(0, MAX_VISIBLE).map((info, idx) => {
                  const isAbsent = info.status === '결석';
                  return (
                    <div
                      key={idx}
                      className={`text-[11px] leading-tight px-1.5 py-0.5 rounded truncate ${
                        isAbsent
                          ? 'text-red-500 line-through bg-red-50'
                          : 'text-gray-700 bg-gray-50'
                      }`}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0"
                        style={{
                          backgroundColor: isAbsent ? '#EF4444' : (getClassColor(info.className) || '#9CA3AF'),
                          verticalAlign: 'middle',
                        }}
                      />
                      {info.student}
                    </div>
                  );
                })}
                {hasMore && (
                  <div className="text-[10px] text-gray-400 px-1.5">
                    +{entries.length - MAX_VISIBLE}명 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}