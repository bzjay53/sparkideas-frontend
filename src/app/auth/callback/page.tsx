'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LinearCard } from '@/components/ui';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 코드를 처리
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('인증 콜백 에러:', error);
          setStatus('error');
          setMessage(`인증 실패: ${error.message}`);
          return;
        }

        if (data.session) {
          console.log('인증 성공:', data.session.user);
          setStatus('success');
          setMessage('로그인 성공! 대시보드로 이동합니다...');
          
          // 2초 후 대시보드로 리다이렉트
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('인증 세션을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('콜백 처리 에러:', error);
        setStatus('error');
        setMessage('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <LinearCard className="p-8 shadow-2xl bg-white dark:bg-gray-800 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              인증 처리 중...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              잠시만 기다려주세요.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              로그인 성공!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              인증 실패
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {message}
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              다시 시도
            </button>
          </>
        )}
      </LinearCard>
    </div>
  );
}