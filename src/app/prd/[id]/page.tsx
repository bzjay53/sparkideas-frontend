'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LinearCard, LinearButton } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ArrowLeftIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function PRDViewerPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold">PRD 상세보기</h1>
              </div>
              <div className="flex items-center space-x-2">
                <LinearButton variant="outline" size="sm">
                  <ShareIcon className="w-4 h-4 mr-1" />
                  공유
                </LinearButton>
                <LinearButton variant="outline" size="sm">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  다운로드
                </LinearButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <LinearCard padding="lg">
            <p>PRD ID: {params.id}</p>
            <p>PRD 상세 내용이 여기에 표시됩니다.</p>
          </LinearCard>
        </div>
      </div>
    </ProtectedRoute>
  );
}