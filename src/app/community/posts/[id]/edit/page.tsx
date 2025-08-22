'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LinearCard, LinearButton, LinearInput } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  ArrowLeftIcon,
  TagIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface PostData {
  title: string;
  content: string;
  category: string;
  project_status: string;
  tags: string[];
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PostData>({
    title: '',
    content: '',
    category: '',
    project_status: 'idea',
    tags: []
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

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await fetch(`/api/community/posts/${postId}`);
        const result = await response.json();

        if (result.success && result.data?.post) {
          const post = result.data.post;
          setFormData({
            title: post.title,
            content: post.content,
            category: post.category,
            project_status: post.project_status || 'idea',
            tags: post.tags || []
          });
        } else {
          console.error('Failed to load post:', result.error);
          router.push('/community');
        }
      } catch (error) {
        console.error('Error loading post:', error);
        router.push('/community');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/community/posts/${postId}?success=updated`);
      } else {
        setErrors({ submit: result.error || '게시글 수정에 실패했습니다' });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setErrors({ submit: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/community/posts/${postId}?userId=temp-user-id`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        router.push('/community?success=deleted');
      } else {
        setErrors({ submit: result.error || '게시글 삭제에 실패했습니다' });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setErrors({ submit: '네트워크 오류가 발생했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">
                  ✏️ 게시글 수정
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  게시글 내용을 수정하거나 삭제할 수 있습니다
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
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  제목
                </h2>
                <LinearInput
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="게시글 제목을 입력해주세요"
                  className={`w-full ${errors.title ? 'border-red-300' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-2">{errors.title}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {formData.title.length}/200자
                </p>
              </LinearCard>

              {/* 카테고리 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4">📂 카테고리</h2>
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
                <h2 className="text-lg font-semibold mb-4">🚀 프로젝트 단계</h2>
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
                <h2 className="text-lg font-semibold mb-4">📝 내용</h2>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="게시글 내용을 입력해주세요..."
                  rows={12}
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.content && (
                  <p className="text-red-600 text-sm mt-2">{errors.content}</p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  {formData.content.length}/5000자
                </p>
              </LinearCard>

              {/* 태그 */}
              <LinearCard padding="lg" shadow="sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-blue-600" />
                  태그 (선택사항)
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
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    추가
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
                  최대 10개까지 추가 가능
                </p>
              </LinearCard>

              {/* 에러 메시지 */}
              {errors.submit && (
                <LinearCard padding="lg" className="border-red-200 bg-red-50">
                  <p className="text-red-600 text-center">{errors.submit}</p>
                </LinearCard>
              )}

              {/* 버튼 */}
              <div className="flex justify-between">
                <LinearButton
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="border-red-300 text-red-700 bg-white hover:bg-red-50"
                >
                  게시글 삭제
                </LinearButton>
                
                <div className="flex space-x-4">
                  <LinearButton
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    취소
                  </LinearButton>
                  <LinearButton
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="px-8"
                  >
                    {isSubmitting ? '수정 중...' : '수정 완료'}
                  </LinearButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}