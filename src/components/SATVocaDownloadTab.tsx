import React from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface SATVocaDownloadTabProps {
  words: any[];
}

export function SATVocaDownloadTab({ words }: SATVocaDownloadTabProps) {
  const [showModal, setShowModal] = React.useState(false);
  const [downloadFormat, setDownloadFormat] = React.useState<'pdf' | 'word'>('pdf');

  const handleDownload = (type: 'test' | 'answer' | 'all') => {
    if (downloadFormat === 'pdf') {
      handlePDFDownload(type);
    } else {
      handleWordDownload(type);
    }
    setShowModal(false);
  };

  const handlePDFDownload = (type: 'test' | 'answer' | 'all') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    if (type === 'test') {
      // 시험지 다운로드 - 1장에 50개까지 표시
      const testContent = words.map((w, idx) => `${idx + 1}. ${w.english}`).join('\\n');
      printWindow.document.write(`
        <html>
          <head>
            <title>SAT 시험지</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 30px 40px; line-height: 1.4; }
              .date { text-align: right; margin-bottom: 8px; color: #666; font-size: 13px; }
              .info { text-align: right; margin-bottom: 8px; color: #666; font-size: 13px; }
              hr { border: 1px solid #ddd; margin-bottom: 15px; }
              pre { white-space: pre-wrap; font-family: 'Arial'; font-size: 13px; line-height: 1.4; margin: 0; }
            </style>
          </head>
          <body>
            <div class="date">${new Date().toLocaleDateString('ko-KR')}</div>
            <hr>
            <div class="info">이름:  </div>
            <div class="info">맞은 개수:            / ${words.length}</div>
            <hr>
            <pre>${testContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else if (type === 'answer') {
      // 답안지 다운로드 - 1장에 2단 구성
      const halfLength = Math.ceil(words.length / 2);
      const leftColumn = words.slice(0, halfLength);
      const rightColumn = words.slice(halfLength);
      
      let leftHTML = '';
      let rightHTML = '';
      
      leftColumn.forEach((w, idx) => {
        leftHTML += `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${idx + 1}.</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${w.english}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #dc2626;">${w.korean}</td></tr>`;
      });
      
      rightColumn.forEach((w, idx) => {
        rightHTML += `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${halfLength + idx + 1}.</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${w.english}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #dc2626;">${w.korean}</td></tr>`;
      });
      
      printWindow.document.write(`
        <html>
          <head>
            <title>SAT 답안지</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; }
              .date { text-align: right; margin-bottom: 10px; color: #666; font-size: 14px; }
              .info { text-align: right; margin-bottom: 10px; color: #666; font-size: 14px; }
              hr { border: 1px solid #ddd; margin-bottom: 20px; }
              .tables-container { display: flex; gap: 30px; margin-top: 20px; }
              table { border-collapse: collapse; width: 48%; font-size: 14px; }
              td { vertical-align: top; }
              .clear { clear: both; }
            </style>
          </head>
          <body>
            <div class="date">${new Date().toLocaleDateString('ko-KR')}</div>
            <hr>
            <div class="info">이름:  </div>
            <div class="info">맞은 개수:            / ${words.length}</div>
            <hr>
            <div class="tables-container">
              <table>
                ${leftHTML}
              </table>
              <table>
                ${rightHTML}
              </table>
            </div>
            <div class="clear"></div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      // 시험지+답안지 - 2장 구성
      const testContent = words.map((w, idx) => `${idx + 1}. ${w.english}`).join('\\n');
      
      const halfLength = Math.ceil(words.length / 2);
      const leftColumn = words.slice(0, halfLength);
      const rightColumn = words.slice(halfLength);
      
      let leftHTML = '';
      let rightHTML = '';
      
      leftColumn.forEach((w, idx) => {
        leftHTML += `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${idx + 1}.</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${w.english}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #dc2626;">${w.korean}</td></tr>`;
      });
      
      rightColumn.forEach((w, idx) => {
        rightHTML += `<tr><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${halfLength + idx + 1}.</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${w.english}</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #dc2626;">${w.korean}</td></tr>`;
      });
      
      printWindow.document.write(`
        <html>
          <head>
            <title>SAT 전체 자료</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 30px 40px; }
              .date { text-align: right; margin-bottom: 8px; color: #666; font-size: 13px; }
              .info { text-align: right; margin-bottom: 8px; color: #666; font-size: 13px; }
              hr { border: 1px solid #ddd; margin-bottom: 15px; }
              .section { page-break-after: always; margin-bottom: 50px; }
              pre { white-space: pre-wrap; font-family: 'Arial'; font-size: 13px; line-height: 1.4; margin: 0; }
              .tables-container { display: flex; gap: 30px; margin-top: 20px; }
              table { border-collapse: collapse; width: 48%; font-size: 14px; }
              td { vertical-align: top; }
            </style>
          </head>
          <body>
            <div class="section">
              <div class="date">${new Date().toLocaleDateString('ko-KR')}</div>
              <hr>
              <div class="info">이름:  </div>
              <div class="info">맞은 개수:            / ${words.length}</div>
              <hr>
              <pre>${testContent}</pre>
            </div>
            <div>
              <div class="date">${new Date().toLocaleDateString('ko-KR')}</div>
              <hr>
              <div class="info">이름:  </div>
              <div class="info">맞은 개수:            / ${words.length}</div>
              <hr>
              <div class="tables-container">
                <table>
                  ${leftHTML}
                </table>
                <table>
                  ${rightHTML}
                </table>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleWordDownload = (type: 'test' | 'answer' | 'all') => {
    if (type === 'test') {
      const testContent = words.map((w, idx) => `${idx + 1}. ${w.english}\n`).join('');
      const headerLine = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const blob = new Blob([
        headerLine,
        `${new Date().toLocaleDateString('ko-KR').padEnd(30)}  ( 이름 )  ${'─'.repeat(40)}    ( 맞은개수 )      / ${words.length}\n`,
        headerLine,
        `\n`,
        testContent
      ], { type: 'application/msword' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SAT_시험지_${new Date().toLocaleDateString('ko-KR')}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (type === 'answer') {
      const answerContent = words.map((w, idx) => `${idx + 1}. ${w.english} - ${w.korean}\n`).join('');
      const headerLine = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const blob = new Blob([
        headerLine,
        `${new Date().toLocaleDateString('ko-KR').padEnd(30)}  ( 이름 )  ${'─'.repeat(40)}    ( 맞은개수 )      / ${words.length}\n`,
        headerLine,
        `\n`,
        answerContent
      ], { type: 'application/msword' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SAT_답안지_${new Date().toLocaleDateString('ko-KR')}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const testContent = words.map((w, idx) => `${idx + 1}. ${w.english}\n`).join('');
      const answerContent = words.map((w, idx) => `${idx + 1}. ${w.english} - ${w.korean}\n`).join('');
      const headerLine = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const blob = new Blob([
        `━━━━━━ 시험지 ━━━━━━\n`,
        headerLine,
        `${new Date().toLocaleDateString('ko-KR').padEnd(30)}  ( 이름 )  ${'─'.repeat(40)}    ( 맞은개수 )      / ${words.length}\n`,
        headerLine,
        `\n`,
        testContent,
        `\n\n`,
        `━━━━━━ 답안지 ━━━━━━\n`,
        headerLine,
        `${new Date().toLocaleDateString('ko-KR').padEnd(30)}  ( 이름 )  ${'─'.repeat(40)}    ( 맞은개수 )      / ${words.length}\n`,
        headerLine,
        `\n`,
        answerContent
      ], { type: 'application/msword' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SAT_시험지_답안지_${new Date().toLocaleDateString('ko-KR')}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl mb-6">학습 자료 다운로드</h2>
      
      <div className="flex items-center justify-center gap-6">
        <Button
          onClick={() => {
            setDownloadFormat('pdf');
            setShowModal(true);
          }}
          className="px-12 py-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-2xl flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl">PDF 다운로드</span>
        </Button>

        <Button
          onClick={() => {
            setDownloadFormat('word');
            setShowModal(true);
          }}
          className="px-12 py-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-2xl flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl">워드 다운로드</span>
        </Button>
      </div>

      {/* Download Type Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl">다운로드 유형 선택</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleDownload('test')}
                className="w-full p-6 border-2 border-teal-400 text-teal-600 rounded-2xl hover:bg-teal-50 transition-colors text-center text-xl"
              >
                시험지 다운로드
              </button>

              <button
                onClick={() => handleDownload('answer')}
                className="w-full p-6 border-2 border-teal-400 text-teal-600 rounded-2xl hover:bg-teal-50 transition-colors text-center text-xl"
              >
                답안지 다운로드
              </button>

              <button
                onClick={() => handleDownload('all')}
                className="w-full p-6 bg-teal-500 text-white rounded-2xl hover:bg-teal-600 transition-colors text-center text-xl"
              >
                시험지 + 답안지
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}