// SGR Grammar PDF 다운로드 — 브라우저 인쇄 창을 열어 PDF로 저장
// 문제편(question) / 문제+해답편(answer) 두 가지 모드 지원

import type { GrammarLesson } from "./SGRGrammarViewer";

function esc(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function downloadSGRGrammarPdf(lesson: GrammarLesson, mode: "question" | "answer") {
  const html = buildGrammarHtml(lesson, mode === "answer");
  const win = window.open("", "_blank");
  if (!win) {
    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

function buildGrammarHtml(lesson: GrammarLesson, showAnswer: boolean): string {
  const explanationHtml = lesson.explanation
    .map((line) => `<li>${esc(line)}</li>`)
    .join("");

  const examplesHtml = lesson.examples
    .map(
      (ex) => `
      <div class="example">
        <p class="wrong">✗ ${esc(ex.wrong)}</p>
        <p class="correct">✓ ${esc(ex.correct)}</p>
        <p class="note">${esc(ex.note)}</p>
      </div>`
    )
    .join("");

  const questionsHtml = lesson.questions
    .map((q, qi) => {
      const choicesHtml = q.choices
        .map((c, ci) => {
          const letter = String.fromCharCode(65 + ci);
          const isAns = ci === q.answer;
          const cls = showAnswer && isAns ? "choice correct" : "choice";
          return `<div class="${cls}"><span class="letter">${letter}.</span> ${esc(c)}</div>`;
        })
        .join("");
      const explanationHtml = showAnswer
        ? `<div class="explanation"><strong>해설:</strong> ${esc(q.explanation)}</div>`
        : "";
      return `
        <div class="question">
          <p class="prompt"><span class="qnum">Q${qi + 1}.</span> ${esc(q.prompt)}</p>
          <div class="choices">${choicesHtml}</div>
          ${explanationHtml}
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${esc(lesson.title)} — SGR Grammar</title>
<style>
  @page { margin: 20mm 18mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif; color: #1f2937; line-height: 1.6; }
  h1 { font-size: 22px; color: #b45309; border-bottom: 2px solid #fcd34d; padding-bottom: 6px; }
  .category { display: inline-block; font-size: 11px; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 8px; border-radius: 9999px; margin-bottom: 8px; }
  .summary { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #92400e; margin-top: 24px; margin-bottom: 8px; }
  ul { padding-left: 20px; }
  ul li { margin-bottom: 4px; font-size: 14px; }
  .example { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  .wrong { color: #ef4444; text-decoration: line-through; font-size: 14px; margin: 0 0 4px; }
  .correct { color: #10b981; font-weight: 600; font-size: 14px; margin: 0 0 4px; }
  .note { color: #9ca3af; font-size: 12px; margin: 0; }
  .question { border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px; }
  .prompt { font-weight: 500; font-size: 14px; margin-bottom: 8px; }
  .qnum { color: #b45309; font-weight: 700; margin-right: 4px; }
  .choices { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .choice { font-size: 13px; padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; }
  .choice.correct { border-color: #10b981; background: #ecfdf5; font-weight: 600; }
  .letter { font-weight: 700; color: #9ca3af; margin-right: 6px; }
  .explanation { margin-top: 6px; font-size: 12px; color: #6b7280; background: #fffbeb; padding: 6px 10px; border-radius: 6px; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div class="no-print" style="text-align:right; margin-bottom:12px;">
    <button onclick="window.print()" style="padding:8px 16px; background:#b45309; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">PDF로 저장</button>
  </div>
  <span class="category">${esc(lesson.category)}</span>
  <h1>${esc(lesson.title)}</h1>
  <p class="summary">${esc(lesson.summary)}</p>

  <h2>📖 문법 설명</h2>
  <ul>${explanationHtml}</ul>

  ${lesson.examples.length > 0 ? `<h2>💡 예시</h2>${examplesHtml}` : ""}

  <h2>✏️ 관련 SAT 문제</h2>
  ${questionsHtml}
</body>
</html>`;
}
