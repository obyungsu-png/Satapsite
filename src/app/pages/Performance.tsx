import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { addPerformanceEvent, deletePerformanceEvent, getPerformanceEvents, getStudents } from '../utils/storage';
import { PerformanceItem } from '../types';

export function Performance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<PerformanceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('');
  const [classOptions, setClassOptions] = useState<string[]>([]);

  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formType, setFormType] = useState<'assessment' | 'school-event'>('assessment');
  const [formClass, setFormClass] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formNote, setFormNote] = useState('');

  const loadData = async () => {
    const [loadedEvents, students] = await Promise.all([getPerformanceEvents(), getStudents()]);
    const uniqueClassNames = Array.from(
      new Set(
        students
          .map((student) => student.className)
          .filter((className): className is string => Boolean(className && className.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b, 'ko'));

    setEvents(loadedEvents);
    setClassOptions(uniqueClassNames);
  };

  useEffect(() => {
    loadData();
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });
  const firstDayOfWeek = getDay(startOfMonth(currentDate));
  const calendarCells: (Date | null)[] = [...Array(firstDayOfWeek).fill(null), ...daysInMonth];

  const monthEvents = useMemo(() => {
    const currentMonthStr = format(currentDate, 'yyyy-MM');
    return events.filter((event) => {
      if (!event.date.startsWith(currentMonthStr)) return false;
      if (!selectedClass) return true;
      return event.className === selectedClass;
    });
  }, [events, currentDate, selectedClass]);

  const selectedDayEvents = useMemo(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return monthEvents.filter((event) => event.date === selectedDateStr);
  }, [monthEvents, selectedDate]);

  const eventMap = useMemo(() => {
    const map = new Map<string, PerformanceItem[]>();
    monthEvents.forEach((event) => {
      if (!map.has(event.date)) map.set(event.date, []);
      map.get(event.date)!.push(event);
    });
    return map;
  }, [monthEvents]);

  const handleAdd = async () => {
    if (!formTitle.trim()) return;

    await addPerformanceEvent({
      date: formDate,
      type: formType,
      className: formClass || undefined,
      title: formTitle.trim(),
      note: formNote.trim() || undefined,
    });

    setFormTitle('');
    setFormNote('');
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await deletePerformanceEvent(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">수행평가</h2>
        <p className="text-gray-600 mt-1">이번 달 수행평가/학교행사를 입력하고 확인할 수 있습니다</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-[#F0EBE1] overflow-hidden">
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
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              >
                <option value="">전체 반</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

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

          <div className="grid grid-cols-7">
            {calendarCells.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[110px] border-b border-r border-[#F0EBE1] last:border-r-0"
                  />
                );
              }

              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = eventMap.get(dateStr) || [];
              const selected = isSameDay(day, selectedDate);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(day);
                    setFormDate(dateStr);
                  }}
                  className={`min-h-[110px] border-b border-r border-[#F0EBE1] p-1.5 text-left transition-colors ${
                    selected ? 'bg-[#FFF8E1]' : isToday(day) ? 'bg-[#FFFBEB]' : 'bg-white hover:bg-[#FFFDF7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium">{format(day, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-[#B8860B] font-medium">{dayEvents.length}건</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                          event.type === 'assessment'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#DBEAFE] text-[#1E40AF]'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 px-1.5">+{dayEvents.length - 3}건 더</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-5">
            <h3 className="text-base font-semibold text-[#2D2A26] mb-4">주요 내용 입력</h3>
            <div className="space-y-3">
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              />
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as 'assessment' | 'school-event')}
                className="w-full px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              >
                <option value="assessment">수행평가</option>
                <option value="school-event">학교행사</option>
              </select>
              <select
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                className="w-full px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              >
                <option value="">전체 반 대상</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="제목 (예: 중2 수학 수행평가)"
                className="w-full px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
              />
              <textarea
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                rows={3}
                placeholder="주요 내용/준비물/유의사항"
                className="w-full px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7] resize-none"
              />
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5C518] text-[#2D2A26] rounded-xl hover:bg-[#E5B616] transition-colors"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" />
                일정 추가
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-5">
            <h3 className="text-base font-semibold text-[#2D2A26] mb-3">
              {format(selectedDate, 'M월 d일')} 일정
            </h3>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {selectedDayEvents.length === 0 && (
                <p className="text-sm text-gray-500">등록된 일정이 없습니다.</p>
              )}
              {selectedDayEvents.map((event) => (
                <div key={event.id} className="border border-[#F0EBE1] rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            event.type === 'assessment'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#DBEAFE] text-[#1E40AF]'
                          }`}
                        >
                          {event.type === 'assessment' ? '수행평가' : '학교행사'}
                        </span>
                        {event.className && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {event.className}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#2D2A26] font-medium break-words">{event.title}</p>
                      {event.note && <p className="text-xs text-gray-600 mt-1 break-words">{event.note}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
