'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  ArrowLeftIcon,
  TagIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CreatePostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    project_status: 'idea',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { id: '자랑', name: '🚀 자랑 - 완성한 프로젝트나 MVP 공유', description: '개발 완료된 프로젝트나 서비스를 자랑해보세요' },
    { id: '협업', name: '🤝 협업 - 팀원 모집 및 협업 제안', description: '함께 프로젝트를 진행할 팀원을 찾아보세요' },
    { id: '외주', name: '💼 외주 - 개발 외주 의뢰 및 제안', description: '외주 프로젝트 의뢰나 프리랜서 모집' },
    { id: '공유', name: '💬 공유 - 아이디어, 지식, 경험 공유', description: '개발 관련 지식이나 경험을 공유해보세요' }
  ];

  const projectStatuses = [
    { id: 'idea', name: '아이디어 단계', description: '아직 구체적인 계획을 세우는 단계' },
    { id: 'development', name: '개발 진행 중', description: '현재 개발을 진행하고 있는 단계' },
    { id: 'launched', name: '출시 완료', description: '서비스나 제품을 이미 출시한 상태' },
    { id: 'completed', name: '프로젝트 완료', description: '모든 개발과 운영이 완료된 상태' }
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

  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (formData.title.length < 5) {
      newErrors.title = '제목은 최소 5자 이상이어야 합니다';
    } else if (formData.title.length > 200) {
      newErrors.title = '제목은 200자를 초과할 수 없습니다';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    } else if (formData.content.length < 20) {
      newErrors.content = '내용은 최소 20자 이상이어야 합니다';
    } else if (formData.content.length > 5000) {
      newErrors.content = '내용은 5000자를 초과할 수 없습니다';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // 성공 시 커뮤니티 페이지로 이동
        router.push('/community?success=created');
      } else {
        setErrors({ submit: result.error || '게시글 작성에 실패했습니다' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
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
                  <span className="text-gray-900">✍️ 새 글 작성</span>
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="text-gray-600">커뮤니티에 나누고 싶은 이야기를 작성해보세요</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 제목 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-gray-900">제목</span>
                </h2>
                <LinearInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: 🚀 React Native 쇼핑몰 앱 MVP 완성! 피드백 구합니다"
                  className={`w-full ${errors.title ? 'border-red-300' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-2">{errors.title}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {formData.title.length}/200자 | 구체적이고 매력적인 제목을 작성해보세요
                </p>
              </LinearCard>

              {/* 카테고리 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  <span className="text-gray-900">📂 카테고리</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`relative flex p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.category === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={formData.category === category.id}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {category.description}
                        </div>
                      </div>
                      {formData.category === category.id && (
                        <div className="absolute top-3 right-3 text-blue-500">
                          ✓
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-2">{errors.category}</p>
                )}
              </LinearCard>

              {/* 프로젝트 단계 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  <span className="text-gray-900">🚀 프로젝트 단계</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projectStatuses.map((status) => (
                    <label
                      key={status.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.project_status === status.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="project_status"
                        value={status.id}
                        checked={formData.project_status === status.id}
                        onChange={(e) => handleInputChange('project_status', e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <div className="font-medium text-sm">{status.name}</div>
                        <div className="text-xs text-gray-600">{status.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </LinearCard>

              {/* 내용 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  <span className="text-gray-900">📝 내용</span>
                </h2>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="프로젝트에 대한 자세한 설명을 작성해주세요..."
                  rows={12}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.content && (
                  <p className="text-red-600 text-sm mt-2">{errors.content}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {formData.content.length}/5000자 | 마크다운 문법을 사용할 수 있습니다
                </p>
              </LinearCard>

              {/* 태그 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                  <TagIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-gray-900">태그 (선택사항)</span>
                </h2>
                
                <div className="flex items-center space-x-2 mb-4">
                  <LinearInput
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="태그 입력 후 추가 버튼 클릭"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <LinearButton
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 10}
                    className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    <span className="text-gray-700">추가</span>
                  </LinearButton>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 p-0.5 hover:bg-blue-200 rounded-full"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  최대 10개까지 추가 가능 | 관련 키워드를 입력하면 다른 사용자가 찾기 쉬워집니다
                </p>
              </LinearCard>

              {/* 에러 메시지 */}
              {errors.submit && (
                <LinearCard padding="lg" className="border-red-200 bg-red-50">
                  <p className="text-red-600 text-center">{errors.submit}</p>
                </LinearCard>
              )}

              {/* 버튼 */}
              <div className="flex justify-end space-x-4">
                <LinearButton
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="text-gray-700">취소</span>
                </LinearButton>
                <LinearButton
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700"
                >
                  <span className="text-white">{isSubmitting ? '작성 중...' : '게시글 작성'}</span>
                </LinearButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}