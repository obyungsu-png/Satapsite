import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { Student } from '../types';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../utils/storage';
import { getClasses, getOrCreateClass, getClassColor, renameClass } from '../utils/classes';

interface GroupedStudents {
  [className: string]: Student[];
}

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [editingClassName, setEditingClassName] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    pricePerClass: '',
    className: '',
    subject: '',
    isFreeSchedule: false,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const allStudents = await getStudents();
    setStudents(allStudents);
    groupStudentsByClass(allStudents);
  };

  const groupStudentsByClass = (students: Student[]) => {
    const grouped: GroupedStudents = {};
    
    students.forEach(student => {
      const className = student.className || '반 미지정';
      if (!grouped[className]) {
        grouped[className] = [];
      }
      grouped[className].push(student);
    });
    
    setGroupedStudents(grouped);
    setExpandedClasses(new Set(Object.keys(grouped)));
  };

  const toggleClass = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.displayName,
        phoneNumber: student.phoneNumber,
        pricePerClass: student.pricePerClass.toString(),
        className: student.className || '',
        subject: student.subject || '',
        isFreeSchedule: student.isFreeSchedule || false,
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', phoneNumber: '', pricePerClass: '', className: '', subject: '', isFreeSchedule: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', phoneNumber: '', pricePerClass: '', className: '', subject: '', isFreeSchedule: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pricePerClass = parseFloat(formData.pricePerClass);
    if (isNaN(pricePerClass) || pricePerClass <= 0) {
      alert('유효한 수업료를 입력해주세요');
      return;
    }

    if (formData.className.trim()) {
      getOrCreateClass(formData.className.trim());
    }

    if (editingStudent) {
      await updateStudent(editingStudent.id, {
        displayName: formData.name,
        phoneNumber: formData.phoneNumber,
        pricePerClass,
        className: formData.className.trim() || undefined,
        subject: formData.subject.trim(),
        isFreeSchedule: formData.isFreeSchedule,
      });
    } else {
      await addStudent({
        name: formData.name,
        displayName: formData.name,
        phoneNumber: formData.phoneNumber,
        pricePerClass,
        className: formData.className.trim() || undefined,
        subject: formData.subject.trim(),
        isFreeSchedule: formData.isFreeSchedule,
      });
    }

    await loadStudents();
    closeModal();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`${name} 학생을 삭제하시겠습니까?`)) {
      await deleteStudent(id);
      await loadStudents();
    }
  };

  const startEditingClassName = (className: string) => {
    if (className === '반 미지정') return;
    setEditingClassName(className);
    setNewClassName(className);
  };

  const saveClassName = async (oldClassName: string) => {
    if (!newClassName.trim() || newClassName === oldClassName) {
      setEditingClassName(null);
      return;
    }

    renameClass(oldClassName, newClassName.trim());
    
    const studentsInClass = students.filter(s => s.className === oldClassName);
    for (const student of studentsInClass) {
      await updateStudent(student.id, { className: newClassName.trim() });
    }

    setEditingClassName(null);
    await loadStudents();
  };

  const cancelEditingClassName = () => {
    setEditingClassName(null);
    setNewClassName('');
  };

  const classNames = Object.keys(groupedStudents).sort((a, b) => {
    if (a === '반 미지정') return 1;
    if (b === '반 미지정') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#2D2A26]">학생 관리</h2>
          <p className="text-[#8A8478] mt-1">
            총 {students.length}명 · {classNames.filter(c => c !== '반 미지정').length}개 반
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F5C518] text-[#2D2A26] rounded-xl hover:bg-[#E5B616] transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          학생 추가
        </button>
      </div>

      {/* Empty State */}
      {classNames.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] p-12 text-center">
          <Users className="w-16 h-16 text-[#D9D3C7] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#2D2A26] mb-2">등록된 학생이 없습니다</h3>
          <p className="text-[#8A8478] mb-4">빠른 입력 또는 학생 추가 버튼으로 학생을 등록하세요</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5C518] text-[#2D2A26] rounded-xl hover:bg-[#E5B616] transition-colors"
          >
            <Plus className="w-5 h-5" />
            첫 학생 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {classNames.map(className => {
            const classStudents = groupedStudents[className];
            const isExpanded = expandedClasses.has(className);
            const classColor = className === '반 미지정' ? '#9CA3AF' : getClassColor(className);
            
            return (
              <div key={className} className="bg-white rounded-2xl shadow-sm border border-[#F0EBE1] overflow-hidden">
                {/* Class Header */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none hover:bg-[#FAFAF8] transition-colors"
                  onClick={() => toggleClass(className)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#8A8478] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#8A8478] flex-shrink-0" />
                  )}

                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: classColor }}
                  />
                  
                  {editingClassName === className ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveClassName(className);
                          if (e.key === 'Escape') cancelEditingClassName();
                        }}
                        className="px-2 py-0.5 border border-[#F5C518] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => saveClassName(className)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEditingClassName}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm text-[#2D2A26]" style={{ fontWeight: 600 }}>{className}</span>
                      {className !== '반 미지정' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingClassName(className);
                          }}
                          className="p-0.5 text-[#C4BFB6] hover:text-[#8A8478] rounded transition-colors"
                          title="반 이름 수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  <span className="text-xs text-[#8A8478] flex-shrink-0">
                    {classStudents.length}명
                  </span>
                </div>

                {/* Students Table */}
                {isExpanded && (
                  <div className="border-t border-[#F0EBE1]">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#FAFAF8]">
                          <th className="text-left text-xs text-[#8A8478] px-5 py-2" style={{ fontWeight: 500 }}>이름</th>
                          <th className="text-left text-xs text-[#8A8478] px-5 py-2" style={{ fontWeight: 500 }}>과목</th>
                          <th className="text-left text-xs text-[#8A8478] px-5 py-2" style={{ fontWeight: 500 }}>연락처</th>
                          <th className="text-right text-xs text-[#8A8478] px-5 py-2" style={{ fontWeight: 500 }}>수업료</th>
                          <th className="text-right text-xs text-[#8A8478] px-5 py-2 w-20" style={{ fontWeight: 500 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student, idx) => (
                          <tr
                            key={student.id}
                            className={`group hover:bg-[#FFFDF7] transition-colors ${
                              idx !== classStudents.length - 1 ? 'border-b border-[#F0EBE1]' : ''
                            }`}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#2D2A26]" style={{ fontWeight: 500 }}>
                                  {student.name}
                                </span>
                                {student.isFreeSchedule && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600" style={{ fontWeight: 500 }}>
                                    자유
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              {student.subject ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600" style={{ fontWeight: 500 }}>
                                  {student.subject}
                                </span>
                              ) : (
                                <span className="text-sm text-[#C4BFB6]">-</span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-sm text-[#8A8478]">
                                {student.phoneNumber || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="text-sm text-[#2D2A26]">
                                <span>{student.pricePerClass.toLocaleString()}원</span>
                                {student.dayRates && Object.keys(student.dayRates).length > 0 && (
                                  <div className="text-[10px] text-[#8A8478] mt-0.5">
                                    요일별 금액 설정됨
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openModal(student)}
                                  className="p-1 text-[#C4BFB6] hover:text-[#2D2A26] rounded transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(student.id, student.name)}
                                  className="p-1 text-[#C4BFB6] hover:text-red-500 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg text-[#2D2A26] mb-5" style={{ fontWeight: 600 }}>
              {editingStudent ? '학생 정보 수정' : '새 학생 추가'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8A8478] mb-1.5" style={{ fontWeight: 500 }}>
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F0EBE1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-white text-sm"
                  placeholder="김철수"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A8478] mb-1.5" style={{ fontWeight: 500 }}>
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F0EBE1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-white text-sm"
                  placeholder="010-1234-5678"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A8478] mb-1.5" style={{ fontWeight: 500 }}>
                  수업료 (원/회) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.pricePerClass}
                  onChange={e => setFormData({ ...formData, pricePerClass: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F0EBE1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-white text-sm"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A8478] mb-1.5" style={{ fontWeight: 500 }}>
                  반
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F0EBE1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-white text-sm"
                  placeholder="예: 초1A, 중2B"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8A8478] mb-1.5" style={{ fontWeight: 500 }}>
                  과목
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[#F0EBE1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C518] bg-white text-sm"
                  placeholder="예: 수학, 영어"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeSchedule"
                  checked={formData.isFreeSchedule}
                  onChange={e => setFormData({ ...formData, isFreeSchedule: e.target.checked })}
                  className="w-4 h-4 text-[#F5C518] border-[#D9D3C7] rounded focus:ring-[#F5C518]"
                />
                <label htmlFor="freeSchedule" className="text-sm text-[#5D5A56]">
                  자유수업 (출석한 날만 계산)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-[#F0EBE1] text-[#5D5A56] rounded-xl hover:bg-[#FAFAF8] transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#F5C518] text-[#2D2A26] rounded-xl hover:bg-[#E5B616] transition-colors text-sm"
                  style={{ fontWeight: 500 }}
                >
                  {editingStudent ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}