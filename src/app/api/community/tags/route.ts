import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/community/tags - 태그 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (popular) {
      // 인기 태그 조회 (게시글에서 많이 사용된 태그)
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('tags')
        .not('tags', 'is', null);

      if (error) {
        throw ErrorFactory.database(`Failed to fetch tags: ${error.message}`);
      }

      // 태그 빈도수 계산
      const tagCounts: { [key: string]: number } = {};
      posts?.forEach(post => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (typeof tag === 'string' && tag.trim()) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
          });
        }
      });

      // 빈도수 기준으로 정렬
      const popularTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({
          name,
          count,
          category: getTagCategory(name)
        }));

      return NextResponse.json(createSuccessResponse({
        tags: popularTags
      }));

    } else {
      // 미리 정의된 태그 목록 반환
      const predefinedTags = [
        // 기술 스택
        { name: 'React', category: 'tech', count: 0 },
        { name: 'Next.js', category: 'tech', count: 0 },
        { name: 'TypeScript', category: 'tech', count: 0 },
        { name: 'Python', category: 'tech', count: 0 },
        { name: 'Node.js', category: 'tech', count: 0 },
        { name: 'JavaScript', category: 'tech', count: 0 },
        { name: 'AI/ML', category: 'tech', count: 0 },
        { name: 'GPT', category: 'tech', count: 0 },
        
        // 프로젝트 유형
        { name: 'SaaS', category: 'project', count: 0 },
        { name: '모바일앱', category: 'project', count: 0 },
        { name: '웹사이트', category: 'project', count: 0 },
        { name: 'API', category: 'project', count: 0 },
        { name: '대시보드', category: 'project', count: 0 },
        { name: 'E-commerce', category: 'project', count: 0 },
        { name: '소셜미디어', category: 'project', count: 0 },
        
        // 분야
        { name: '핀테크', category: 'domain', count: 0 },
        { name: '헬스케어', category: 'domain', count: 0 },
        { name: '교육', category: 'domain', count: 0 },
        { name: '게임', category: 'domain', count: 0 },
        { name: '커머스', category: 'domain', count: 0 },
        { name: '생산성', category: 'domain', count: 0 },
        { name: '엔터테인먼트', category: 'domain', count: 0 },
        
        // 상태
        { name: '기획중', category: 'status', count: 0 },
        { name: '개발중', category: 'status', count: 0 },
        { name: '완료', category: 'status', count: 0 },
        { name: '런칭', category: 'status', count: 0 },
        { name: 'MVP', category: 'status', count: 0 },
        { name: '베타', category: 'status', count: 0 }
      ];

      return NextResponse.json(createSuccessResponse({
        tags: predefinedTags.slice(0, limit)
      }));
    }

  } catch (error) {
    console.error('Error fetching tags:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to fetch tags', 
      500
    ), { status: 500 });
  }
}

// POST /api/community/tags - 새 태그 생성 (사용자가 커스텀 태그 추가 시)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category = 'custom' } = body;

    if (!name || typeof name !== 'string') {
      throw ErrorFactory.badRequest('Tag name is required and must be a string');
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2 || trimmedName.length > 20) {
      throw ErrorFactory.badRequest('Tag name must be between 2 and 20 characters');
    }

    // 특수 문자 제한 (한글, 영문, 숫자, 하이픈, 슬래시만 허용)
    const validTagRegex = /^[가-힣a-zA-Z0-9\-\/\s]+$/;
    if (!validTagRegex.test(trimmedName)) {
      throw ErrorFactory.badRequest('Tag name contains invalid characters');
    }

    return NextResponse.json(createSuccessResponse({
      tag: {
        name: trimmedName,
        category,
        count: 0
      },
      message: 'Tag validated successfully'
    }), { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to create tag', 
      500
    ), { status: 500 });
  }
}

// Helper function to categorize tags
function getTagCategory(tagName: string): string {
  const techTags = ['React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'JavaScript', 'AI/ML', 'GPT', 'Vue', 'Angular', 'PHP', 'Java', 'C++', 'Swift', 'Kotlin'];
  const projectTags = ['SaaS', '모바일앱', '웹사이트', 'API', '대시보드', 'E-commerce', '소셜미디어'];
  const domainTags = ['핀테크', '헬스케어', '교육', '게임', '커머스', '생산성', '엔터테인먼트'];
  const statusTags = ['기획중', '개발중', '완료', '런칭', 'MVP', '베타'];

  if (techTags.includes(tagName)) return 'tech';
  if (projectTags.includes(tagName)) return 'project';
  if (domainTags.includes(tagName)) return 'domain';
  if (statusTags.includes(tagName)) return 'status';
  
  return 'custom';
}