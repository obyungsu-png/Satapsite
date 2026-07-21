import { useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { redeemVoucherCode } from '../utils/voucherCodes';
import { getDeviceId } from '../utils/deviceId';

interface RedeemVoucherFormProps {
  email: string | undefined | null;
  onSuccess?: (expiryDate: string) => void;
  compact?: boolean;
}

// 학생이 관리자로부터 받은 수강권 코드를 직접 입력해 등록하는 폼.
// 페이월(잠금) 화면과 잠금 안내 모달 양쪽에서 재사용한다.
export function RedeemVoucherForm({ email, onSuccess, compact = false }: RedeemVoucherFormProps) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('수강권 코드를 입력해주세요.');
      return;
    }
    if (!email) {
      toast.error('로그인 후 이용할 수 있습니다.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await redeemVoucherCode(trimmed, email, getDeviceId());
      if (!result.ok) {
        const messages: Record<string, string> = {
          not_found: '존재하지 않는 수강권 코드예요. 다시 확인해주세요.',
          used: '이미 사용된 수강권 코드예요.',
          disabled: '비활성화된 수강권 코드예요. 관리자에게 문의해주세요.',
          no_email: '로그인 후 이용할 수 있습니다.',
        };
        toast.error(messages[result.reason] || '수강권 등록에 실패했어요.');
        return;
      }
      toast.success(`수강권이 등록되었습니다! (만료일: ${result.subscription.expiryDate})`);
      setCode('');
      onSuccess?.(result.subscription.expiryDate);
    } catch (err) {
      console.error('Voucher redeem error:', err);
      toast.error('수강권 등록에 실패했어요. 네트워크를 확인 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'w-full' : 'w-full max-w-sm mx-auto'}>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SAT-XXXX-XXXX-XXXX"
          className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 uppercase tracking-wide text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3D5AA1]/40 focus:border-[#3D5AA1]"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#3D5AA1' }}
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Ticket size={15} />}
          등록
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        관리자(학원/담당자)에게 받은 수강권 코드를 입력하면 로그인한 계정({email || '로그인 필요'})에 바로 적용됩니다.
        수강권은 최초 등록한 기기 1대에서만 이용할 수 있습니다.
      </p>
    </form>
  );
}
