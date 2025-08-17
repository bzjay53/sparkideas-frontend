'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LinearCard, LinearButton } from '@/components/ui';

export default function AuthTestPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testSupabaseConnection();
    checkCurrentUser();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.log('Supabase connection test error:', error.message);
        setIsConnected(false);
      } else {
        console.log('Supabase connection successful:', data);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
    }
    setLoading(false);
  };

  const checkCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const testSignUp = async () => {
    const testEmail = `test+${Date.now()}@example.com`;
    const testPassword = 'test123456';

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (error) {
        console.error('SignUp error:', error);
        alert(`SignUp Error: ${error.message}`);
      } else {
        console.log('SignUp success:', data);
        alert('SignUp successful! Check your email for confirmation.');
      }
    } catch (error) {
      console.error('SignUp failed:', error);
      alert('SignUp failed: Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <LinearCard className="p-8">
          <h1 className="text-2xl font-bold mb-6">🔐 Supabase Auth 테스트</h1>
          
          {/* 연결 상태 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">📡 Supabase 연결 상태</h2>
            {loading ? (
              <p className="text-gray-500">연결 확인 중...</p>
            ) : (
              <div className={`p-3 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isConnected ? '✅ 연결 성공' : '❌ 연결 실패'}
              </div>
            )}
          </div>

          {/* 현재 사용자 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">👤 현재 사용자</h2>
            {user ? (
              <div className="bg-blue-100 text-blue-800 p-3 rounded">
                <p>이메일: {user.email}</p>
                <p>ID: {user.id}</p>
              </div>
            ) : (
              <p className="text-gray-500">로그인되지 않음</p>
            )}
          </div>

          {/* 테스트 버튼들 */}
          <div className="space-y-4">
            <LinearButton 
              onClick={testSignUp}
              className="w-full"
              disabled={!isConnected}
            >
              🧪 테스트 회원가입 (임시 이메일)
            </LinearButton>
            
            <LinearButton 
              variant="secondary"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              🏠 메인으로 돌아가기
            </LinearButton>
          </div>

          {/* 환경변수 정보 */}
          <div className="mt-8 text-sm text-gray-600">
            <h3 className="font-semibold mb-2">🔧 환경변수 확인</h3>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </LinearCard>
      </div>
    </div>
  );
}