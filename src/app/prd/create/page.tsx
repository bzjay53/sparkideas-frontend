'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  CpuChipIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CreatePRDPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_market: '',
    key_features: [] as string[],
    constraints: [] as string[],
    template_type: 'web_app'
  });
  const [currentFeature, setCurrentFeature] = useState('');
  const [currentConstraint, setCurrentConstraint] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const templateTypes = [
    { 
      id: 'web_app', 
      name: '💻 웹 애플리케이션', 
      description: '브라우저 기반 웹 서비스',
      examples: 'SaaS, 관리 도구, 대시보드'
    },
    { 
      id: 'mobile_app', 
      name: '📱 모바일 앱', 
      description: 'iOS/Android 네이티브 또는 하이브리드 앱',
      examples: '커머스, 소셜, 유틸리티'
    },
    { 
      id: 'saas', 
      name: '☁️ SaaS 플랫폼', 
      description: 'B2B 구독 기반 소프트웨어',
      examples: '팀 협업, CRM, 프로젝트 관리'
    },
    { 
      id: 'enterprise', 
      name: '🏢 엔터프라이즈 시스템', 
      description: '대기업용 복합 시스템',
      examples: 'ERP, 통합 플랫폼, 데이터 분석'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addFeature = () => {
    const feature = currentFeature.trim();
    if (feature && !formData.key_features.includes(feature) && formData.key_features.length < 10) {
      setFormData(prev => ({ ...prev, key_features: [...prev.key_features, feature] }));
      setCurrentFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      key_features: prev.key_features.filter(feature => feature !== featureToRemove) 
    }));
  };

  const addConstraint = () => {
    const constraint = currentConstraint.trim();
    if (constraint && !formData.constraints.includes(constraint) && formData.constraints.length < 10) {
      setFormData(prev => ({ ...prev, constraints: [...prev.constraints, constraint] }));
      setCurrentConstraint('');
    }
  };

  const removeConstraint = (constraintToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      constraints: prev.constraints.filter(constraint => constraint !== constraintToRemove) 
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제품명을 입력해주세요';
    } else if (formData.title.length < 5) {
      newErrors.title = '제품명은 최소 5자 이상이어야 합니다';
    } else if (formData.title.length > 200) {
      newErrors.title = '제품명은 200자를 초과할 수 없습니다';
    }

    if (!formData.description.trim()) {
      newErrors.description = '제품 설명을 입력해주세요';
    } else if (formData.description.length < 20) {
      newErrors.description = '제품 설명은 최소 20자 이상이어야 합니다';
    } else if (formData.description.length > 1000) {
      newErrors.description = '제품 설명은 1000자를 초과할 수 없습니다';
    }

    if (!formData.template_type) {
      newErrors.template_type = '제품 유형을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/prd/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success && result.data?.prd) {
        // 성공 시 결과 페이지로 이동 (임시로 PRD 목록으로)
        router.push('/prd?success=generated');
      } else {
        setErrors({ submit: result.error || 'PRD 생성에 실패했습니다' });
      }
    } catch (error) {
      console.error('Error generating PRD:', error);
      setErrors({ submit: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-2 text-purple-600" />
                  AI PRD 자동 생성
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  아이디어를 입력하면 AI가 완전한 PRD를 자동으로 생성합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* 기본 정보 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CpuChipIcon className="w-5 h-5 mr-2 text-blue-600" />
                  기본 정보
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제품명 *
                    </label>
                    <LinearInput
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="예: AI 기반 스마트 쇼핑 추천 앱"
                      className={`w-full ${errors.title ? 'border-red-300' : ''}`}
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.title.length}/200자
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제품 설명 *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="제품이 해결하고자 하는 문제와 핵심 가치를 자세히 설명해주세요..."
                      rows={4}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {formData.description.length}/1000자
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      타겟 시장 (선택사항)
                    </label>
                    <LinearInput
                      type="text"
                      value={formData.target_market}
                      onChange={(e) => handleInputChange('target_market', e.target.value)}
                      placeholder="예: 20-40대 직장인, B2B 중소기업, 온라인 쇼핑족"
                      className="w-full"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      주요 타겟 고객층을 설명해주세요
                    </p>
                  </div>
                </div>
              </LinearCard>

              {/* 제품 유형 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4">📋 제품 유형</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templateTypes.map((template) => (
                    <label
                      key={template.id}
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        formData.template_type === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template_type"
                        value={template.id}
                        checked={formData.template_type === template.id}
                        onChange={(e) => handleInputChange('template_type', e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900 mb-2">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {template.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        예: {template.examples}
                      </div>
                      {formData.template_type === template.id && (
                        <div className="absolute top-3 right-3 text-blue-500">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {errors.template_type && (
                  <p className="text-red-600 text-sm mt-2">{errors.template_type}</p>
                )}
              </LinearCard>

              {/* 핵심 기능 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-green-600" />
                  핵심 기능 (선택사항)
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <LinearInput
                      type="text"
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      placeholder="핵심 기능을 입력하세요 (예: 사용자 인증, 실시간 알림)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1"
                    />
                    <LinearButton
                      type="button"
                      variant="outline"
                      onClick={addFeature}
                      disabled={!currentFeature.trim() || formData.key_features.length >= 10}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      추가
                    </LinearButton>
                  </div>

                  {formData.key_features.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">추가된 핵심 기능:</p>
                      <div className="space-y-2">
                        {formData.key_features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <span className="text-sm text-green-800">• {feature}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(feature)}
                              className="p-1 hover:bg-green-200 rounded-full"
                            >
                              <XMarkIcon className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-xs">
                    최대 10개까지 추가 가능 | 제품의 핵심 기능들을 나열해주세요
                  </p>
                </div>
              </LinearCard>

              {/* 제약사항 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2 text-orange-600" />
                  제약사항 & 고려사항 (선택사항)
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <LinearInput
                      type="text"
                      value={currentConstraint}
                      onChange={(e) => setCurrentConstraint(e.target.value)}
                      placeholder="제약사항을 입력하세요 (예: 예산 100만원 이하, 3개월 내 출시)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
                      className="flex-1"
                    />
                    <LinearButton
                      type="button"
                      variant="outline"
                      onClick={addConstraint}
                      disabled={!currentConstraint.trim() || formData.constraints.length >= 10}
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      추가
                    </LinearButton>
                  </div>

                  {formData.constraints.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">추가된 제약사항:</p>
                      <div className="space-y-2">
                        {formData.constraints.map((constraint, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <span className="text-sm text-orange-800">• {constraint}</span>
                            <button
                              type="button"
                              onClick={() => removeConstraint(constraint)}
                              className="p-1 hover:bg-orange-200 rounded-full"
                            >
                              <XMarkIcon className="w-4 h-4 text-orange-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-500 text-xs">
                    예산, 일정, 기술적 제약, 규제 요건 등을 추가해주세요
                  </p>
                </div>
              </LinearCard>

              {/* 에러 메시지 */}
              {errors.submit && (
                <LinearCard padding="lg" className="border-red-200 bg-red-50">
                  <p className="text-red-600 text-center">{errors.submit}</p>
                </LinearCard>
              )}

              {/* 생성 버튼 */}
              <div className="flex justify-center">
                <LinearButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isGenerating}
                  className="px-12 py-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      AI가 PRD 생성 중... (약 30-60초)
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      AI PRD 자동 생성하기
                    </>
                  )}
                </LinearButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}