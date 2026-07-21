/**
 * AI 튜터 유틸 — 선택된 텍스트에 대해 Claude에 4가지 액션 요청
 * (설명 / 번역 / 분석 / 재작성)
 */

export type AiTutorAction = 'explain' | 'translate' | 'analyze' | 'rewrite';

export const AI_TUTOR_ACTION_LABELS: Record<AiTutorAction, string> = {
  explain: 'Explain',
  translate: 'Translate',
  analyze: 'Analyze',
  rewrite: 'Rewrite',
};

function buildPrompt(action: AiTutorAction, text: string, context?: string): string {
  const trimmed = text.trim().slice(0, 800);
  const ctx = context ? `\n\n(원문 문맥 일부: "${context.slice(0, 400)}...")` : '';
  switch (action) {
    case 'explain':
      return `다음 영어 문장/구를 한국어로 이해하기 쉽게 설명해줘. 핵심 의미와 왜 그렇게 해석되는지를 2~4문장으로 간결히.\n\n"${trimmed}"${ctx}`;
    case 'translate':
      return `다음 영어 문장/구를 자연스러운 한국어로 번역해줘. 번역문만 한 줄로.\n\n"${trimmed}"`;
    case 'analyze':
      return `다음 영어 문장의 구조(주어/동사/수식어 관계)와 논리 전개를 한국어로 짧게 분석해줘. 3~5개의 불릿으로.\n\n"${trimmed}"${ctx}`;
    case 'rewrite':
      return `다음 영어 문장을 더 쉬운 영어로 다시 써줘. 재작성된 영어 한 문장만.\n\n"${trimmed}"`;
  }
}

export async function askAiTutor(
  action: AiTutorAction,
  text: string,
  context?: string
): Promise<string | null> {
  const prompt = buildPrompt(action, text, context);
  try {
    const response = await fetch('/api/claude/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      '';
    return typeof content === 'string' ? content.trim() : null;
  } catch (err) {
    console.warn('[aiTutor] Error:', err);
    return null;
  }
}
