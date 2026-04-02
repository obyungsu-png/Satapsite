import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    // Check if server is accessible
    const checkServer = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/health`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          setServerStatus('ok');
        } else {
          console.error('Server health check failed:', response.status, response.statusText);
          setServerStatus('error');
        }
      } catch (error) {
        console.error('Server not accessible:', error);
        setServerStatus('error');
      }
    };

    checkServer();
  }, []);

  if (serverStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5C518] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2D2A26] text-lg font-medium">서버 연결 확인 중...</p>
        </div>
      </div>
    );
  }

  if (serverStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#2D2A26] mb-2">서버 연결 실패</h1>
            <p className="text-[#8A8478] mb-6">
              백엔드 서버에 연결할 수 없습니다. 아래 단계를 따라 문제를 해결해주세요.
            </p>
          </div>

          <div className="bg-[#FFF8E1] border border-[#F5C518]/30 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#2D2A26] mb-4">해결 방법:</h2>
            <ol className="space-y-3 text-[#5D5A56]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#F5C518] text-[#2D2A26] rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium">Supabase Edge Function 배포 확인</p>
                  <p className="text-sm mt-1">브라우저 콘솔을 열어 상세한 오류 메시지를 확인하세요.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#F5C518] text-[#2D2A26] rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-medium">인터넷 연결 확인</p>
                  <p className="text-sm mt-1">네트워크 연결이 정상인지 확인하세요.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#F5C518] text-[#2D2A26] rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium">페이지 새로고침</p>
                  <p className="text-sm mt-1">잠시 후 페이지를 새로고침해주세요.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">기술 정보:</p>
            <p className="font-mono text-xs break-all">
              Server URL: https://{projectId}.supabase.co/functions/v1/server/health
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full mt-6 px-6 py-3 bg-[#F5C518] text-[#2D2A26] rounded-xl font-semibold hover:bg-[#E5B616] transition-colors"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;