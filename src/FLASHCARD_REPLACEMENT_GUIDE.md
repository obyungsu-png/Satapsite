# 단어 관리 플래시카드 교체 가이드

## 📍 수정 위치
파일: `/components/Dashboard.tsx`
라인: 2228-2354

## ✂️ 삭제할 코드
라인 2228부터 2354까지의 전체 플래시카드 섹션을 삭제합니다.
(`{wordStudyMode === 'flashcard' && (`로 시작해서 `)}` 까지)

## ✨ 추가할 코드
삭제한 위치에 아래 코드를 추가합니다:

```tsx
                {wordStudyMode === 'flashcard' && (
                  <WordFlashcard
                    words={selectedWordList.words}
                    currentWordIndex={currentWordIndex}
                    isFlashcardFlipped={isFlashcardFlipped}
                    setIsFlashcardFlipped={setIsFlashcardFlipped}
                    handlePrevWord={handlePrevWord}
                    handleNextWord={handleNextWord}
                  />
                )}
```

## ✅ 완료!
이제 단어 관리 플래시카드가 SAT VOCA 스타일로 완전히 변경됩니다!

## 🎨 변경사항
- ✅ 파란색 그라데이션 카드
- ✅ 양옆 큰 화살표 버튼
- ✅ 발음 듣기 버튼 (스피커 아이콘)
- ✅ 3D 플립 효과
- ✅ 여성/남성 음성 토글
- ✅ 깔끔한 카운터 (하단)
- ✅ 뜻/정의 녹색 그라데이션 (뒷면)
