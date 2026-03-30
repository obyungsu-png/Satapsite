import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { getClasses } from '../utils/classes';
import { getStudents } from '../utils/storage';
import { Class } from '../types';

interface ClassFilterProps {
  selectedClass: string;
  onClassChange: (className: string) => void;
}

export function ClassFilter({ selectedClass, onClassChange }: ClassFilterProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [hasNoClassStudents, setHasNoClassStudents] = useState(false);

  useEffect(() => {
    const loadClassOptions = async () => {
      const [allClasses, students] = await Promise.all([Promise.resolve(getClasses()), getStudents()]);
      const studentClassNames = Array.from(
        new Set(
          students
            .map((student) => student.className)
            .filter((className): className is string => Boolean(className && className.trim())),
        ),
      );

      const classByName = new Map(allClasses.map((cls) => [cls.name, cls]));
      const activeClasses = studentClassNames.map((name) => {
        const existing = classByName.get(name);
        return (
          existing || {
            id: `derived-${name}`,
            name,
            color: '#6B7280',
          }
        );
      });

      setClasses(activeClasses);
      setHasNoClassStudents(students.some((student) => !student.className));
    };

    loadClassOptions();
  }, []);

  if (classes.length === 0 && !hasNoClassStudents) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-[#8A8478]" />
      <select
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
        className="px-3 py-2 border border-[#F0EBE1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-[#FFFDF7]"
      >
        <option value="">전체 반</option>
        {classes.map(cls => (
          <option key={cls.id} value={cls.name}>
            {cls.name}
          </option>
        ))}
        {hasNoClassStudents && <option value="no-class">반 미지정</option>}
      </select>
    </div>
  );
}