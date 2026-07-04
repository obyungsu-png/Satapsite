import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { Student, WeeklySchedule } from '../types';
import { getStudents, getSchedule, updateStudentSchedule } from '../utils/storage';
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
  getDay,
} from 'date-fns';

const DAYS = [
  { key: 'monday', label: '월' },
  { key: 'tuesday', label: '화' },
  { key: 'wednesday', label: '수' },
  { key: 'thursday', label: '목' },
  { key: 'friday', label: '금' },
  { key: 'saturday', label: '토' },
  { key: 'sunday', label: '일' },
] as const;

export function Schedule() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
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
    const loadData = async () => {
      const loadedStudents = await getStudents();
      setStudents(loadedStudents);
      setSchedule(await getSchedule());
      if (loadedStudents.length > 0) {
        setSelectedStudent(loadedStudents[0].id);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, selectedClass]);

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

  const currentSchedule = selectedStudent
    ? schedule[selectedStudent] || {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      }
    : null;

  const toggleDay = async (day: keyof WeeklySchedule[string]) => {
    if (!selectedStudent || !currentSchedule) return;

    const newSchedule = {
      ...currentSchedule,
      [day]: !currentSchedule[day],
    };

    await updateStudentSchedule(selectedStudent, newSchedule);
    setSchedule(await getSchedule());
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

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  // Monthly calendar data
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startingDayOfWeek = firstDay.getDay();
  const calendarDays: (Date | null)[] = [
    ...Array(startingDayOfWeek).fill(null),
    ...daysInMonth,
  ];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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
        <h2 className="text-2xl font-semibold text-gray-900">수업 스케줄</h2>
        <p className="text-gray-600 mt-1">학생별 주간 수업 요일을 설정하고 월별 스케줄을 확인합니다</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-12 text-center">
          <Calendar className="w-16 h-16 text-[#D9D3C7] mx-auto mb-4" />
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

          {/* View Mode Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-[#F5C518] text-[#2D2A26] font-medium'
                  : 'bg-[#FAFAF8] text-[#8A8478] hover:bg-[#F0EBE1]'
              }`}
            >
              주간 설정
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-[#F5C518] text-[#2D2A26] font-medium'
                  : 'bg-[#FAFAF8] text-[#8A8478] hover:bg-[#F0EBE1]'
              }`}
            >
              월별 보기
            </button>
          </div>

          {currentSchedule && selectedStudentData && (
            <>
              {viewMode === 'weekly' ? (
                <>
                  {/* Schedule Grid */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">주간 수업 요일</h3>
                    <div className="grid grid-cols-7 gap-3">
                      {DAYS.map(day => (
                        <button
                          key={day.key}
                          onClick={() => toggleDay(day.key)}
                          className={`p-6 rounded-xl border-2 transition-all ${
                            currentSchedule[day.key]
                              ? 'border-[#F5C518] bg-[#FFF8E1] text-[#B8860B]'
                              : 'border-[#F0EBE1] bg-white text-[#8A8478] hover:border-[#D9D3C7]'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-semibold mb-1">{day.label}</div>
                            <div className="text-xs">
                              {currentSchedule[day.key] ? '수업' : '휴무'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#FFFDF7] rounded-xl p-4 border border-[#F0EBE1]">
                    <h4 className="font-medium text-[#2D2A26] mb-2">수업 요약</h4>
                    <div className="text-sm text-[#5D5A56]">
                      <p>
                        <span className="font-medium">{selectedStudentData.name}</span> 학생은{' '}
                        <span className="font-medium text-[#B8860B]">
                          주 {Object.values(currentSchedule).filter(Boolean).length}회
                        </span>{' '}
                        수업을 받습니다.
                      </p>
                      <p className="mt-1">
                        수업 요일:{' '}
                        {DAYS.filter(day => currentSchedule[day.key])
                          .map(day => day.label)
                          .join(', ') || '없음'}
                      </p>
                      <p className="mt-1">
                        월 예상 수업료: 약{' '}
                        {(
                          Object.values(currentSchedule).filter(Boolean).length *
                          4 *
                          selectedStudentData.pricePerClass
                        ).toLocaleString()}
                        원 (주 기준)
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                        const isToday = isSameDay(day, new Date());
                        const paymentDay = getPaymentNotificationDay(currentDate);
                        const isPaymentDay = isSameDay(day, paymentDay);
                        const dayOfWeek = getDay(day);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                          <div
                            key={dateStr}
                            className={`aspect-square p-3 rounded-xl border-2 transition-all relative ${
                              isPaymentDay
                                ? 'border-[#F5C518] bg-[#FFF8E1]'
                                : isScheduled
                                ? 'border-green-300 bg-green-50'
                                : 'border-[#F0EBE1] bg-white'
                            } ${isToday ? 'ring-2 ring-[#F5C518]' : ''}`}
                          >
                            <div className={`text-sm font-medium ${
                              isWeekend ? 'text-red-500' : 'text-gray-700'
                            }`}>
                              {format(day, 'd')}
                            </div>
                            {isScheduled && (
                              <div className="text-[10px] text-green-600 mt-0.5">
                                • 수업
                              </div>
                            )}
                            {isPaymentDay && (
                              <div
                                className="absolute -top-1 -right-1 bg-[#F5C518] rounded-full p-1 shadow-md animate-pulse"
                                onMouseEnter={handleBellHover}
                              >
                                <Bell className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#FFFDF7] rounded-xl p-4 border border-[#F0EBE1]">
                    <h4 className="font-medium text-[#2D2A26] mb-2">이번 달 수업 요약</h4>
                    <div className="text-sm text-[#5D5A56]">
                      <p>
                        <span className="font-medium">{selectedStudentData.name}</span> 학생의{' '}
                        {format(currentDate, 'M월')} 수업: {' '}
                        <span className="font-medium text-green-600">
                          {scheduledDays.length}회
                        </span>
                      </p>
                      <p className="mt-1">
                        예상 수업료:{' '}
                        <span className="font-medium text-[#B8860B]">
                          {(scheduledDays.length * selectedStudentData.pricePerClass).toLocaleString()}원
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-[#FFF8E1] border border-[#F5C518]/30 rounded-2xl p-4">
        <h4 className="font-medium text-[#2D2A26] mb-2">💡 사용 안내</h4>
        <ul className="text-sm text-[#5D5A56] space-y-1">
          <li>• <strong>주간 설정</strong>: 수업하는 요일을 클릭하여 선택하세요</li>
          <li>• <strong>월별 보기</strong>: 해당 월의 실제 수업일을 확인할 수 있습니다</li>
          <li>• 🔔 벨 아이콘: 납부 용지 배부일 (매달 말 2틀 전)</li>
          <li>• 초록색 테두리: 수업이 예정된 날</li>
          <li>• 노란색 테두리: 납부일</li>
        </ul>
      </div>
    </div>
  );
}