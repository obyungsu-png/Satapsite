const saveYearlyVoca = (title, text) => {
  // 1. 입력값 확인
  if (!title.trim() || !text.trim()) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  // 2. 텍스트 파싱
  const parsedData = text
    .split('\n')                              // 줄바꿈 기준으로 분리
    .filter(line => line.trim() !== '')       // 빈 줄 제거
    .map(line => {
      const parts = line.trim().split(/\s+/); // 공백(스페이스바 1개 이상) 기준으로 쪼개기
      
      return {
        word: parts[0] || "",                 // 1번째: 단어
        meaning: parts[1] || "",              // 2번째: 뜻
        engMeaning: parts[2] || "",           // 3번째: 영영 뜻
        synonym: parts.slice(3).join(" ")     // 4번째 이후 전부: 띄어쓰기 포함하여 동의어로 묶음
      };
    });

  // 3. 저장 키(Key) 생성
  const storageKey = `voca:yearly:${title.trim()}`;

  // 4. localStorage 저장 (및 API 호출 예시)
  try {
    // [옵션 A] 로컬 스토리지에 즉시 저장
    localStorage.setItem(storageKey, JSON.stringify(parsedData));
    console.log("저장된 데이터:", parsedData);
    alert(`"${title}" (총 ${parsedData.length}개 단어) 저장 완료!`);

    // [옵션 B] API 서버로 전송할 경우 아래 주석 해제
    /*
    fetch('/api/voca/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: storageKey, data: parsedData })
    });
    */
  } catch (error) {
    console.error("저장 에러:", error);
    alert("저장에 실패했습니다.");
  }
};