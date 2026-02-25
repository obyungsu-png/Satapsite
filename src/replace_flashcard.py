#!/usr/bin/env python3
"""
Dashboard.tsx의 플래시카드 섹션을 WordFlashcard 컴포넌트로 교체하는 스크립트
"""

# Dashboard.tsx 파일 읽기
with open('/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 라인 2228-2354를 교체 (Python은 0-based index이므로 2227-2353)
# 새로운 코드
new_code = """                {wordStudyMode === 'flashcard' && (
                  <WordFlashcard
                    words={selectedWordList.words}
                    currentWordIndex={currentWordIndex}
                    isFlashcardFlipped={isFlashcardFlipped}
                    setIsFlashcardFlipped={setIsFlashcardFlipped}
                    handlePrevWord={handlePrevWord}
                    handleNextWord={handleNextWord}
                  />
                )}

"""

# 라인 2227부터 2354까지 제거하고 새 코드로 교체
new_lines = lines[:2227] + [new_code] + lines[2354:]

# 파일 쓰기
with open('/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ 플래시카드 섹션이 성공적으로 교체되었습니다!")
print(f"📊 변경 전: {len(lines)} 라인")
print(f"📊 변경 후: {len(new_lines)} 라인")
print(f"📉 감소: {len(lines) - len(new_lines)} 라인")
