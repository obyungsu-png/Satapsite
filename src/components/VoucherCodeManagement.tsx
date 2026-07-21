import { useEffect, useMemo, useState } from 'react';
import { Ticket, Copy, Ban, Trash2, Download, RefreshCw, KeyRound, Users, CircleDollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import {
  VoucherCode,
  VoucherCategory,
  VOUCHER_PLANS,
  CATEGORY_LABEL,
  getVoucherPlan,
  loadVoucherCodes,
  saveVoucherCodes,
  createVoucherCodes,
} from '../utils/voucherCodes';

type StatusFilter = 'all' | 'unused' | 'used' | 'disabled';

export function VoucherCodeManagement() {
  const [codes, setCodes] = useState<VoucherCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | VoucherCategory>('all');
  const [lastGenerated, setLastGenerated] = useState<VoucherCode[]>([]);

  // 발급 폼 상태
  const [planKey, setPlanKey] = useState(VOUCHER_PLANS[0].key);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(VOUCHER_PLANS[0].price);
  const [note, setNote] = useState('');
  const [generating, setGenerating] = useState(false);

  const selectedPlan = useMemo(() => VOUCHER_PLANS.find((p) => p.key === planKey)!, [planKey]);

  const loadAll = async () => {
    setLoading(true);
    const data = await loadVoucherCodes();
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setPrice(selectedPlan.price);
  }, [selectedPlan]);

  const persist = async (next: VoucherCode[]) => {
    setCodes(next);
    const ok = await saveVoucherCodes(next);
    if (!ok) toast.error('Supabase 저장에 실패했습니다. 네트워크를 확인해주세요.');
  };

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 200) {
      toast.error('수량은 1~200 사이로 입력해주세요.');
      return;
    }
    if (price < 0) {
      toast.error('가격을 확인해주세요.');
      return;
    }
    setGenerating(true);
    try {
      const created = createVoucherCodes(codes, selectedPlan.months, selectedPlan.category, quantity, price, note);
      const next = [...created, ...codes];
      await persist(next);
      setLastGenerated(created);
      setNote('');
      toast.success(`수강권 코드 ${created.length}개가 발급되었습니다.`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDisable = (id: string) => {
    persist(codes.map((c) => (c.id === id ? { ...c, status: 'disabled' as const } : c)));
    toast.success('코드를 비활성화했습니다.');
  };

  const handleReactivate = (id: string) => {
    persist(codes.map((c) => (c.id === id ? { ...c, status: 'unused' as const } : c)));
    toast.success('코드를 다시 활성화했습니다.');
  };

  const handleDelete = (id: string) => {
    if (!confirm('이 코드를 삭제하시겠습니까? (사용된 코드를 삭제해도 이미 등록된 수강권에는 영향이 없습니다)')) return;
    persist(codes.filter((c) => c.id !== id));
    toast.success('코드가 삭제되었습니다.');
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`${code} 복사됨`);
  };

  const copyAllGenerated = () => {
    const text = lastGenerated.map((c) => c.code).join('\n');
    navigator.clipboard?.writeText(text);
    toast.success('발급된 코드를 모두 복사했습니다.');
  };

  const exportCSV = () => {
    const headers = ['코드', '개월', '구분', '가격', '상태', '생성일', '사용자', '사용일', '메모'];
    const rows = codes.map((c) => [
      c.code,
      c.months,
      CATEGORY_LABEL[c.category],
      c.price,
      c.status,
      c.createdAt,
      c.usedByEmail || '',
      c.usedAt || '',
      c.note || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher_codes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = codes.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    return true;
  });

  const stats = {
    total: codes.length,
    unused: codes.filter((c) => c.status === 'unused').length,
    used: codes.filter((c) => c.status === 'used').length,
    revenue: codes.filter((c) => c.status === 'used').reduce((sum, c) => sum + c.price, 0),
  };

  const statusBadge = (status: VoucherCode['status']) => {
    const map = {
      unused: { bg: '#e8edf5', text: '#3D5AA1', label: '미사용' },
      used: { bg: '#dcfce7', text: '#15803d', label: '사용됨' },
      disabled: { bg: '#f3f4f6', text: '#6b7280', label: '비활성' },
    } as const;
    const s = map[status];
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="h-7 w-7 text-[#3D5AA1]" />
              수강권 코드 관리
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              코드를 발급해 학생/학원에 전달하면, 학생이 로그인 후 직접 코드를 입력해 수강권을 등록합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
              <Download size={16} /> CSV 내보내기
            </Button>
            <Button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
              <RefreshCw size={16} /> 새로고침
            </Button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">전체 코드</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Ticket className="w-9 h-9 text-gray-300" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">미사용</p>
                <p className="text-2xl font-bold text-[#3D5AA1]">{stats.unused}</p>
              </div>
              <KeyRound className="w-9 h-9 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">사용됨(등록 완료)</p>
                <p className="text-2xl font-bold text-green-600">{stats.used}</p>
              </div>
              <Users className="w-9 h-9 text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">누적 매출(사용 기준)</p>
                <p className="text-2xl font-bold text-purple-700">₩{stats.revenue.toLocaleString()}</p>
              </div>
              <CircleDollarSign className="w-9 h-9 text-purple-200" />
            </div>
          </div>
        </div>

        {/* 발급 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">새 수강권 코드 발급</h2>
          <p className="text-xs text-gray-500 mb-4">아래 4가지 상품 중 골라 발급하세요. 가격은 제안가이며 자유롭게 조정할 수 있습니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">상품(유형 · 구분)</label>
              <select
                value={planKey}
                onChange={(e) => setPlanKey(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              >
                {VOUCHER_PLANS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label} — 제안가 ₩{p.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1.5">{selectedPlan.description}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">가격 (원)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">수량</label>
              <input
                type="number"
                min={1}
                max={200}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">메모 (선택)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="예: OO학원 3월 발급분"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 rounded-lg text-white text-sm font-bold disabled:opacity-60"
              style={{ backgroundColor: '#3D5AA1' }}
            >
              {generating ? '발급 중...' : `코드 ${quantity}개 발급`}
            </Button>
          </div>

          {lastGenerated.length > 0 && (
            <div className="mt-5 p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> 방금 발급된 코드 {lastGenerated.length}개
                </p>
                <button onClick={copyAllGenerated} className="text-xs font-semibold text-green-700 hover:underline flex items-center gap-1">
                  <Copy size={12} /> 전체 복사
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {lastGenerated.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => copyCode(c.code)}
                    className="text-left px-3 py-1.5 rounded-md bg-white border border-green-200 font-mono text-xs text-gray-800 hover:bg-green-100"
                    title="클릭하여 복사"
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(['all', 'unused', 'used', 'disabled'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s ? 'bg-[#3D5AA1] text-white border-[#3D5AA1]' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {{ all: '전체', unused: '미사용', used: '사용됨', disabled: '비활성' }[s]}
            </button>
          ))}
          <span className="w-px bg-gray-300 mx-1" />
          {(['all', 'individual', 'academy'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                categoryFilter === c ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {c === 'all' ? '전체 구분' : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        {/* 코드 목록 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">코드</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">유형</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">구분</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">가격</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">사용자</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600">메모</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600">작업</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">불러오는 중...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">발급된 코드가 없습니다.</td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button onClick={() => copyCode(c.code)} className="font-mono text-xs text-gray-800 hover:underline flex items-center gap-1">
                          {c.code} <Copy size={11} className="text-gray-400" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.months}개월</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{CATEGORY_LABEL[c.category]}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-semibold">₩{c.price.toLocaleString()}</td>
                      <td className="px-4 py-3">{statusBadge(c.status)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.usedByEmail ? (
                          <div>
                            <div>{c.usedByEmail}</div>
                            <div className="text-gray-400">{c.usedAt ? new Date(c.usedAt).toLocaleDateString('ko-KR') : ''}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.note || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {c.status === 'unused' && (
                            <button onClick={() => handleDisable(c.id)} title="비활성화" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                              <Ban size={15} />
                            </button>
                          )}
                          {c.status === 'disabled' && (
                            <button onClick={() => handleReactivate(c.id)} title="다시 활성화" className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(c.id)} title="삭제" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
