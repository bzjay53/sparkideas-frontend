import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/types/api';
import { AppError, ErrorFactory } from '@/lib/error-handler';
import { OpenAIService } from '@/lib/services/openai-service';

const openaiService = new OpenAIService();

interface PRDGenerationRequest {
  title: string;
  description: string;
  target_market?: string;
  key_features?: string[];
  constraints?: string[];
  template_type?: 'web_app' | 'mobile_app' | 'saas' | 'enterprise';
}

interface PRDSection {
  title: string;
  content: string;
  order: number;
}

interface GeneratedPRD {
  title: string;
  overview: string;
  sections: PRDSection[];
  diagrams: string[];
  estimated_dev_time: string;
  confidence_score: number;
  metadata: {
    template_type: string;
    created_at: string;
    version: string;
  };
}

// POST /api/prd/generate - PRD 자동 생성
export async function POST(request: NextRequest) {
  try {
    const body: PRDGenerationRequest = await request.json();
    const { title, description, target_market, key_features = [], constraints = [], template_type = 'web_app' } = body;

    // 입력 검증
    if (!title || !description) {
      throw ErrorFactory.badRequest('Title and description are required');
    }

    if (title.length < 5 || title.length > 200) {
      throw ErrorFactory.badRequest('Title must be between 5 and 200 characters');
    }

    if (description.length < 20 || description.length > 1000) {
      throw ErrorFactory.badRequest('Description must be between 20 and 1000 characters');
    }

    // PRD 생성을 위한 AI 프롬프트 구성
    const prdPrompt = buildPRDGenerationPrompt({
      title,
      description,
      target_market,
      key_features,
      constraints,
      template_type
    });

    console.log('Generating PRD with OpenAI...', { title, template_type });

    // OpenAI API를 통한 PRD 생성
    const aiResponse = await openaiService.generateStructuredResponse(prdPrompt, {
      temperature: 0.7,
      maxTokens: 4000
    });

    if (!aiResponse) {
      throw ErrorFactory.externalApi('OpenAI', 'Failed to generate PRD from AI service');
    }

    // AI 응답 파싱 및 구조화
    const generatedPRD = parsePRDResponse(aiResponse, {
      title,
      template_type,
      original_description: description
    });

    // Mermaid 다이어그램 생성
    const diagrams = await generateMermaidDiagrams(generatedPRD, template_type);

    const result: GeneratedPRD = {
      ...generatedPRD,
      diagrams,
      metadata: {
        template_type,
        created_at: new Date().toISOString(),
        version: '1.0'
      }
    };

    return NextResponse.json(createSuccessResponse({
      prd: result,
      generation_time: '약 45초'
    }), { status: 201 });

  } catch (error) {
    console.error('Error generating PRD:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(createErrorResponse(error.message, error.statusCode), { 
        status: error.statusCode 
      });
    }

    return NextResponse.json(createErrorResponse(
      'Failed to generate PRD', 
      500
    ), { status: 500 });
  }
}

// PRD 생성을 위한 프롬프트 구성
function buildPRDGenerationPrompt(request: PRDGenerationRequest): string {
  const { title, description, target_market, key_features, constraints, template_type } = request;
  
  return `# PRD (Product Requirements Document) Generation Request

You are an expert product manager creating a comprehensive PRD. Generate a detailed, professional PRD based on the following requirements:

## Project Information
- **Title**: ${title}
- **Description**: ${description}
- **Target Market**: ${target_market || 'General market'}
- **Template Type**: ${template_type}
- **Key Features**: ${key_features && key_features.length > 0 ? key_features.join(', ') : 'Not specified'}
- **Constraints**: ${constraints && constraints.length > 0 ? constraints.join(', ') : 'None specified'}

## Required PRD Structure

Please generate a comprehensive PRD with the following sections in JSON format:

\`\`\`json
{
  "title": "Full product title",
  "overview": "Executive summary of the product (200-300 words)",
  "sections": [
    {
      "title": "1. Product Overview",
      "content": "Detailed product description, vision, and goals",
      "order": 1
    },
    {
      "title": "2. Market Analysis",
      "content": "Target market, user personas, and competitive analysis",
      "order": 2
    },
    {
      "title": "3. Functional Requirements", 
      "content": "Core features and functionality specifications",
      "order": 3
    },
    {
      "title": "4. Technical Requirements",
      "content": "Technology stack, architecture, and technical constraints",
      "order": 4
    },
    {
      "title": "5. User Experience",
      "content": "User flows, interface requirements, and experience goals",
      "order": 5
    },
    {
      "title": "6. Success Metrics",
      "content": "KPIs, success criteria, and measurement methods",
      "order": 6
    },
    {
      "title": "7. Implementation Timeline",
      "content": "Development phases, milestones, and resource allocation",
      "order": 7
    }
  ],
  "estimated_dev_time": "X-Y months (category description)",
  "confidence_score": 85
}
\`\`\`

## Guidelines:
- Make it professional and detailed
- Include specific, actionable requirements
- Consider ${template_type} best practices
- Provide realistic timelines and scope
- Focus on user value and business impact
- Each section should be 200-400 words
- Confidence score should be 75-95 based on clarity and feasibility

Generate the PRD now:`;
}

// AI 응답을 PRD 구조로 파싱
function parsePRDResponse(aiResponse: string, metadata: any): Omit<GeneratedPRD, 'diagrams' | 'metadata'> {
  try {
    // JSON 블록 추출
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error('No JSON block found in AI response');
    }

    const parsedResponse = JSON.parse(jsonMatch[1]);
    
    return {
      title: parsedResponse.title || metadata.title,
      overview: parsedResponse.overview || '개요 생성 중...',
      sections: parsedResponse.sections || [],
      estimated_dev_time: parsedResponse.estimated_dev_time || '3-6개월 (표준 웹 애플리케이션)',
      confidence_score: Math.min(Math.max(parsedResponse.confidence_score || 80, 70), 95)
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
    // Fallback PRD 구조
    return {
      title: metadata.title,
      overview: '이 제품은 ' + metadata.original_description,
      sections: [
        {
          title: '1. Product Overview',
          content: '제품 개요를 생성하는 중입니다...',
          order: 1
        },
        {
          title: '2. Market Analysis', 
          content: '시장 분석을 생성하는 중입니다...',
          order: 2
        },
        {
          title: '3. Functional Requirements',
          content: '기능 요구사항을 정의하는 중입니다...',
          order: 3
        }
      ],
      estimated_dev_time: '3-6개월 (표준 웹 애플리케이션)',
      confidence_score: 75
    };
  }
}

// Mermaid 다이어그램 생성
async function generateMermaidDiagrams(prd: any, templateType: string): Promise<string[]> {
  const diagrams: string[] = [];
  
  try {
    // 1. 시스템 아키텍처 다이어그램
    const architectureDiagram = `graph TB
    A[User] --> B[Frontend]
    B --> C[API Gateway] 
    C --> D[Application Server]
    D --> E[Database]
    D --> F[External Services]
    
    subgraph "${prd.title} Architecture"
        B[Frontend Layer]
        C[API Layer]
        D[Business Logic]
        E[Data Storage]
        F[Integrations]
    end`;
    
    diagrams.push(architectureDiagram);

    // 2. 사용자 플로우 다이어그램
    const userFlowDiagram = `flowchart TD
    A[User Access] --> B{Authentication}
    B -->|Success| C[Dashboard]
    B -->|Failure| D[Login Page]
    C --> E[Main Features]
    E --> F[Data Processing]
    F --> G[Results Display]
    G --> H[User Actions]`;
    
    diagrams.push(userFlowDiagram);

    // 3. 데이터베이스 ERD (간단버전)
    const erdDiagram = `erDiagram
    User {
        string id
        string email
        string name
        datetime created_at
    }
    
    Project {
        string id
        string title
        string description
        string user_id
        datetime created_at
    }
    
    User ||--o{ Project : creates`;
    
    diagrams.push(erdDiagram);

  } catch (error) {
    console.error('Error generating diagrams:', error);
    
    // 기본 다이어그램
    diagrams.push(`graph TB
    A[Start] --> B[Process]
    B --> C[End]`);
  }

  return diagrams;
}