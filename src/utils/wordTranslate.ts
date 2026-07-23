/**
 * 단어 번역 유틸리티 — 무료 API 우선 사용
 * 1차: MyMemory 번역 API(한국어 뜻) + Free Dictionary API(품사/영어 설명) — 무료
 * 2차: Claude API 프록시(/api/claude/chat/completions) — 폴백
 */

export interface WordTranslation {
  koreanMeaning: string;
  partOfSpeech: string;
  englishExplanation: string;
}

/**
 * MyMemory 무료 번역 API로 영어 단어 → 한국어 번역
 * https://api.mymemory.translated.net/get?q=word&langpair=en|ko
 */
async function translateWithMyMemory(word: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|ko`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const translated: string | undefined = data?.responseData?.translatedText;
    if (!translated) return null;

    // MyMemory가 번역 실패 시 원문 그대로 반환하거나 경고 메시지를 반환하는 경우 필터링
    const lower = translated.toLowerCase();
    if (lower === word.toLowerCase()) return null;
    if (lower.includes('please enter') || lower.includes('invalid') || lower.includes('query limit')) {
      return null;
    }
    // 한글이 포함되어 있지 않으면 번역 실패로 간주
    if (!/[\uac00-\ud7af]/.test(translated)) return null;

    return translated;
  } catch (err) {
    console.warn('[wordTranslate] MyMemory error:', err);
    return null;
  }
}

/**
 * Free Dictionary API에서 단일 품사 + 영어 정의 조회
 * https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */
async function getEnglishDef(word: string): Promise<{ partOfSpeech: string; definition: string } | null> {
  try {
    const cleaned = word.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleaned)}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const meaning = data[0]?.meanings?.[0];
    if (!meaning) return null;

    const def = meaning.definitions?.[0]?.definition || '';
    return {
      partOfSpeech: meaning.partOfSpeech || '',
      definition: def,
    };
  } catch (err) {
    console.warn('[wordTranslate] Dictionary API error:', err);
    return null;
  }
}

/**
 * Claude API 폴백 — 무료 API 실패 시에만 호출 (유료)
 */
async function translateWithClaude(word: string, context?: string): Promise<WordTranslation | null> {
  const prompt = context
    ? `Translate the English word "${word}" as used in this context: "${context.slice(0, 200)}".
Return ONLY a JSON object with these fields:
- koreanMeaning: the Korean translation of the word (brief, 1-3 words)
- partOfSpeech: the part of speech in English (noun, verb, adjective, etc.)
- englishExplanation: a brief English explanation (1 sentence, max 20 words)

No markdown, no code blocks, just the JSON object.`
    : `Translate the English word "${word}".
Return ONLY a JSON object with these fields:
- koreanMeaning: the Korean translation of the word (brief, 1-3 words)
- partOfSpeech: the part of speech in English (noun, verb, adjective, etc.)
- englishExplanation: a brief English explanation (1 sentence, max 20 words)

No markdown, no code blocks, just the JSON object.`;

  try {
    const response = await fetch('/api/claude/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';

    // JSON 추출 (코드 블록이 있는 경우 제거)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      koreanMeaning: parsed.koreanMeaning || '',
      partOfSpeech: parsed.partOfSpeech || '',
      englishExplanation: parsed.englishExplanation || '',
    };
  } catch (err) {
    console.warn('[wordTranslate] Claude fallback error:', err);
    return null;
  }
}

/**
 * 단어의 한국어 뜻을 조회합니다.
 * 1차: 무료 API (MyMemory + dictionaryapi.dev) 동시 조회
 * 2차: Claude API 폴백
 * @param word 조회할 단어
 * @param context 지문 내 문맥 (선택)
 * @returns 한국어 뜻, 품사, 영어 설명
 */
export async function translateWord(word: string, context?: string): Promise<WordTranslation | null> {
  const cleaned = word.trim().replace(/[^a-zA-Z'-]/g, '');
  if (!cleaned) return null;

  // 1차: 무료 API로 한국어 뜻 + 품사/영어 정의 동시 조회
  const [korean, englishDef] = await Promise.all([
    translateWithMyMemory(cleaned),
    getEnglishDef(cleaned),
  ]);

  if (korean) {
    return {
      koreanMeaning: korean,
      partOfSpeech: englishDef?.partOfSpeech || '',
      englishExplanation: englishDef?.definition || '',
    };
  }

  // 2차: 무료 API 실패 시 Claude API 폴백 (유료)
  return translateWithClaude(cleaned, context);
}
