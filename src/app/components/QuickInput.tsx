import { useState } from 'react';
import { Zap, Send, HelpCircle } from 'lucide-react';
import { addStudent, getStudents, updateStudentSchedule, markAttendance, updateStudent, removeAttendance } from '../utils/storage';
import { getOrCreateClass } from '../utils/classes';
import { WeeklySchedule } from '../types';

interface QuickInputProps {
  onUpdate?: () => void;
}

const dayMap: { [key: string]: keyof WeeklySchedule[string] } = {
  '월': 'monday',
  '화': 'tuesday',
  '수': 'wednesday',
  '목': 'thursday',
  '금': 'friday',
  '토': 'saturday',
  '일': 'sunday',
};

function parseDays(days: string): WeeklySchedule[string] {
  const schedule: WeeklySchedule[string] = {
    monday: false, tuesday: false, wednesday: false,
    thursday: false, friday: false, saturday: false, sunday: false,
  };
  for (const [korean, english] of Object.entries(dayMap)) {
    if (days.includes(korean)) schedule[english] = true;
  }
  return schedule;
}

export function QuickInput({ onUpdate }: QuickInputProps) {
  const [input, setInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const parseInput = async (text: string): Promise<void> => {
    try {
      text = text.trim();
      
      // 패턴 0: 요일별 다른 금액 (새로운 형식)
      // 예: "김예림 중1 영어 월100 수금200"
      const dayRatePattern = /^(.+?)\s+(\S+)\s+(\S+)\s+(.+)$/;
      const match = text.match(dayRatePattern);
      
      if (match) {
        const [, name, className, subject, ratesStr] = match;
        const dayRatesMatch = ratesStr.match(/([월화수목금토일]+)(\d+)/g);
        
        if (dayRatesMatch && dayRatesMatch.length > 0) {
          // 요일별 금액 파싱
          const dayRates: { [key: string]: number } = {};
          const allDays: string[] = [];
          let firstPrice = 0;
          
          dayRatesMatch.forEach((item, idx) => {
            const itemMatch = item.match(/([월화수목금토일]+)(\d+)/);
            if (itemMatch) {
              const [, days, price] = itemMatch;
              const priceNum = parseInt(price);
              if (idx === 0) firstPrice = priceNum;
              
              for (const [korean, english] of Object.entries(dayMap)) {
                if (days.includes(korean)) {
                  dayRates[english] = priceNum;
                  if (!allDays.includes(korean)) allDays.push(korean);
                }
              }
            }
          });
          
          if (Object.keys(dayRates).length > 0) {
            getOrCreateClass(className.trim());
            
            const students = await getStudents();
            let student = students.find(s => s.displayName === name.trim() && s.subject === subject.trim());
            
            if (!student) {
              // 새 학생 등록
              student = await addStudent({
                name: name.trim(),
                displayName: name.trim(),
                subject: subject.trim(),
                phoneNumber: '',
                pricePerClass: firstPrice,
                className: className.trim(),
                dayRates,
              });
            } else {
              // 기존 학생 업데이트
              await updateStudent(student.id, { 
                pricePerClass: firstPrice, 
                className: className.trim(),
                dayRates 
              });
            }
            
            // 요일 스케줄 설정
            const schedule: WeeklySchedule[string] = {
              monday: false, tuesday: false, wednesday: false,
              thursday: false, friday: false, saturday: false, sunday: false,
            };
            for (const [korean, english] of Object.entries(dayMap)) {
              if (allDays.includes(korean)) {
                schedule[english] = true;
              }
            }
            await updateStudentSchedule(student.id, schedule);
            
            const rateDetails = Object.entries(dayRates)
              .map(([day, rate]) => {
                const korean = Object.entries(dayMap).find(([k, v]) => v === day)?.[0] || day;
                return `${korean}${rate}`;
              })
              .join(' ');
            
            setMessage({ type: 'success', text: `✅ ${name}(${subject}) 시간표 설정 완료 (${className}, ${rateDetails})` });
            setInput('');
            onUpdate?.();
            return;
          }
        }
      }
      
      // 패턴 1: 콜론으로 구분된 다중 입력 (요일별 다른 금액)
      // 예: "김철수 영어 월화 초1A 150: 김철수 영어 수 초1A 100"
      if (text.includes(':')) {
        const parts = text.split(':').map(p => p.trim());
        let allSuccess = true;
        const results: string[] = [];
        
        for (const part of parts) {
          const result = await processSingleInput(part);
          if (!result.success) {
            allSuccess = false;
            setMessage({ type: 'error', text: result.message });
            return;
          }
          results.push(result.message);
        }
        
        if (allSuccess) {
          setMessage({ type: 'success', text: '✅ ' + results.join(' + ') });
          setInput('');
          onUpdate?.();
        }
        return;
      }
      
      // 패턴 2: 단일 입력
      const result = await processSingleInput(text);
      if (result.success) {
        setMessage({ type: 'success', text: '✅ ' + result.message });
        setInput('');
        onUpdate?.();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: '❌ 처리 중 오류가 발생했습니다. 입력 형식을 확인해주세요.' });
    }
  };

  const processSingleInput = async (text: string): Promise<{ success: boolean; message: string }> => {
    text = text.trim();
    
    // 패턴 1: 결석 처리
    // 예: "김철수 영어 3/18 결석"
    const attendancePattern = /^(.+?)\s+(\S+)\s+(오늘|내일|\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2})\s+(결석|보강|출석)$/;
    const m1 = text.match(attendancePattern);
    
    if (m1) {
      const [, displayName, subject, dateStr, status] = m1;
      const students = await getStudents();
      const student = students.find(s => s.displayName === displayName.trim() && s.subject === subject.trim());
      
      if (!student) {
        return { success: false, message: `❌ "${displayName}(${subject})" 학생을 찾을 수 없습니다` };
      }
      
      await handleAttendance(student, dateStr, status);
      return { success: true, message: `${displayName}(${subject}) ${dateStr} ${status} 처리 완료` };
    }
    
    // 패턴 2: 자유수업 등록
    // 예: "이영희 영어 자유수업 초2B 45000"
    const freeSchedulePattern = /^(.+?)\s+(\S+)\s+자유수업\s+(\S+)\s+(\d+)(?:원)?$/;
    const m2 = text.match(freeSchedulePattern);
    
    if (m2) {
      const [, displayName, subject, className, price] = m2;
      const pricePerClass = parseInt(price);
      getOrCreateClass(className.trim());
      
      const student = await addStudent({
        name: displayName.trim(),
        displayName: displayName.trim(),
        subject: subject.trim(),
        phoneNumber: '',
        pricePerClass,
        className: className.trim(),
        isFreeSchedule: true,
      });
      
      return { success: true, message: `${displayName}(${subject}) 자유수업 등록 완료 (${className}, ${pricePerClass.toLocaleString()}원)` };
    }
    
    // 패턴 3: 정규 수업 등록 (요일별 금액 포함)
    // 예: "김철수 영어 월수금 중1 200"
    const regularPattern = /^(.+?)\s+(\S+)\s+([월화수목금토일]+)\s+(\S+)\s+(\d+)(?:원)?$/;
    const m3 = text.match(regularPattern);
    
    if (m3) {
      const [, displayName, subject, days, className, price] = m3;
      const pricePerClass = parseInt(price);
      getOrCreateClass(className.trim());
      
      const students = await getStudents();
      let student = students.find(s => s.displayName === displayName.trim() && s.subject === subject.trim());
      
      if (!student) {
        // 새 학생 등록
        student = await addStudent({
          name: displayName.trim(),
          displayName: displayName.trim(),
          subject: subject.trim(),
          phoneNumber: '',
          pricePerClass,
          className: className.trim(),
        });
      } else {
        // 기존 학생 업데이트
        await updateStudent(student.id, { pricePerClass, className: className.trim() });
      }
      
      // 요일 스케줄 설정
      const parsedSchedule = parseDays(days);
      await updateStudentSchedule(student.id, parsedSchedule);
      
      // dayRates 설정 (해당 요일만)
      const dayRates = student.dayRates || {};
      for (const [korean, english] of Object.entries(dayMap)) {
        if (days.includes(korean)) {
          dayRates[english] = pricePerClass;
        }
      }
      await updateStudent(student.id, { dayRates });
      
      return { success: true, message: `${displayName}(${subject}) 시간표 설정 완료 (${days}, ${className}, ${pricePerClass.toLocaleString()}원)` };
    }
    
    return { success: false, message: '❌ 입력 형식을 확인해주세요. 도움말 버튼을 클릭하세요.' };
  };

  const handleAttendance = async (student: any, dateStr: string, status: string) => {
    let date: Date;
    if (dateStr === '오늘') {
      date = new Date();
    } else if (dateStr === '내일') {
      date = new Date();
      date.setDate(date.getDate() + 1);
    } else if (dateStr.includes('/')) {
      const [month, day] = dateStr.split('/').map(n => parseInt(n));
      const year = new Date().getFullYear();
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateStr);
    }
    
    const dateString = date.toISOString().split('T')[0];
    
    if (status === '결석') {
      await markAttendance(student.id, dateString, 'absent');
    } else {
      await removeAttendance(student.id, dateString);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      parseInput(input);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#F5C518] to-[#FFD54F] rounded-2xl shadow-lg p-6 text-[#2D2A26]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6" />
          <h3 className="text-lg font-semibold">빠른 입력</h3>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 hover:bg-[#E5B616] rounded-xl transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {showHelp && (
        <div className="bg-white/30 rounded-xl p-4 mb-4 text-sm">
          <p className="font-semibold mb-2">입력 예시:</p>
          <ul className="space-y-1">
            <li>• 정규 수업: <strong>"김철수 영어 월수금 중1 200"</strong></li>
            <li>• 요일별 다른 금액 (신규): <strong>"김예림 중1 영어 월100 수금200"</strong></li>
            <li>• 요일별 다른 금액 (구형): <strong>"김철수 영어 월화 중1 150: 김철수 영어 수 중1 100"</strong></li>
            <li>• 자유수업: <strong>"이영희 수학 자유수업 초2B 180"</strong></li>
            <li>• 결석: <strong>"김철수 영어 3/18 결석"</strong></li>
            <li>• 출석 추가: <strong>"이영희 수학 3/20 출석"</strong> (자유수업용)</li>
            <li>• 보강 처리: <strong>"박민수 국어 3/25 보강"</strong></li>
          </ul>
          <div className="mt-3 pt-3 border-t border-white/30 text-xs text-[#5D5A56]">
            💡 같은 이름으로 여러 과목을 들으면 정산 시 자동으로 합산됩니다.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='예: "김예림 중1 영어 월100 수금200"'
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B8860B] bg-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#2D2A26] text-white rounded-xl font-medium hover:bg-[#3D3A36] transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            입력
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500 bg-opacity-30'
                : 'bg-red-500 bg-opacity-30'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}