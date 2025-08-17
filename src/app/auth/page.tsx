'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setMessage(`로그인 실패: ${error.message}`);
        } else {
          setMessage('로그인 성공! 대시보드로 이동합니다.');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          setMessage(`회원가입 실패: ${error.message}`);
        } else {
          setMessage('회원가입 성공! 이메일을 확인해주세요.');
        }
      }
    } catch (error) {
      setMessage('네트워크 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* 메인 로고 */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          💡 IdeaSpark
        </Link>
      </div>

      <div className="w-full max-w-md">
        <LinearCard className="p-8 shadow-2xl">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isLogin ? '로그인' : '회원가입'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? '계정에 로그인하세요' : '새 계정을 만드세요'}
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <LinearInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <LinearInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            {/* 메시지 */}
            {message && (
              <div className={`p-3 rounded text-sm ${
                message.includes('성공') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* 제출 버튼 */}
            <LinearButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  처리 중...
                </div>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </LinearButton>
          </form>

          {/* 전환 링크 */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>

          {/* 비밀번호 찾기 */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link href="/auth/reset" className="text-sm text-gray-600 hover:text-blue-600">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          )}

          {/* 소셜 로그인 (추후 구현) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-4">
              또는 소셜 계정으로 계속하기
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled
              >
                🔧 Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled
              >
                🔧 GitHub
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              소셜 로그인은 곧 지원 예정입니다.
            </p>
          </div>
        </LinearCard>

        {/* 테스트 링크 */}
        <div className="mt-6 text-center">
          <Link href="/auth-test" className="text-sm text-blue-600 hover:text-blue-800">
            🧪 개발자 테스트 페이지
          </Link>
        </div>
      </div>
    </div>
  );
}