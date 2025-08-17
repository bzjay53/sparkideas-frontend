'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { isFeatureEnabled } from '@/lib/config';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('인증 시도:', { email, isLogin, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL });
      
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        console.log('로그인 결과:', { data, error });

        if (error) {
          console.error('로그인 에러:', error);
          
          // 이메일 확인 에러에 대한 특별 처리
          if (error.message === 'Email not confirmed') {
            setMessage('이메일 확인이 필요합니다. 가입 시 받은 이메일을 확인하거나, 아래 소셜 로그인을 이용해주세요.');
          } else if (error.message === 'Invalid login credentials') {
            setMessage('이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
          } else {
            setMessage(`로그인 실패: ${error.message}`);
          }
        } else if (data.user) {
          setMessage('로그인 성공! 대시보드로 이동합니다.');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            // 개발 환경에서는 이메일 확인 스킵 (프로덕션에서는 제거)
            data: {
              email_confirm: false
            }
          }
        });

        console.log('회원가입 결과:', { data, error });

        if (error) {
          console.error('회원가입 에러:', error);
          if (error.message.includes('already registered')) {
            setMessage('이미 가입된 이메일입니다. 로그인을 시도하거나 소셜 로그인을 이용해주세요.');
          } else {
            setMessage(`회원가입 실패: ${error.message}`);
          }
        } else {
          setMessage('회원가입 성공! 잠시 후 로그인을 시도해보세요.');
        }
      }
    } catch (error) {
      console.error('네트워크 에러:', error);
      setMessage(`네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error(`${provider} 로그인 에러:`, error);
        setMessage(`${provider} 로그인 실패: ${error.message}`);
        setSocialLoading(null);
      }
      // 성공 시에는 리다이렉트되므로 로딩 상태를 유지
    } catch (error) {
      console.error(`${provider} 로그인 네트워크 에러:`, error);
      setMessage(`네트워크 오류가 발생했습니다.`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {/* 메인 로고 */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IdeaSpark
          </span>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  처리 중...
                </div>
              ) : (
                isLogin ? '로그인' : '회원가입'
              )}
            </button>
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

          {/* 소셜 로그인 - 권장 방법 (조건부 표시) */}
          {isFeatureEnabled('enableSocialLogin') && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center mb-4">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  🚀 빠르고 안전한 소셜 로그인 (권장)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  이메일 확인 없이 바로 시작하세요
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'google' ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === 'github' ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                  )}
                  GitHub
                </button>
              </div>
              <div className="text-center mt-3">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ 즉시 사용 가능 • 이메일 확인 불필요 • 더 안전함
                </p>
              </div>
            </div>
          )}
          
          {/* 소셜 로그인 비활성화 안내 */}
          {!isFeatureEnabled('enableSocialLogin') && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                  🔧 소셜 로그인 설정 중
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  현재 이메일/비밀번호 로그인만 사용 가능합니다.<br/>
                  소셜 로그인은 곧 활성화됩니다.
                </p>
              </div>
            </div>
          )}
        </LinearCard>

      </div>
    </div>
  );
}