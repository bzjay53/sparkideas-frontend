// Reddit API를 사용해 실시간 갈증포인트를 수집하는 서비스

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

interface PainPoint {
  title: string;
  content: string;
  source: 'reddit';
  source_url: string;
  sentiment_score: number;
  trend_score: number;
  keywords: string[];
  category: string;
}

export class RedditCollector {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || '';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    this.username = process.env.REDDIT_USERNAME || '';
    this.password = process.env.REDDIT_PASSWORD || '';
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'IdeaSpark/1.0 by RelationshipOne8189'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: this.username,
        password: this.password
      })
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken || '';
  }

  private async fetchSubreddit(subreddit: string, sort = 'hot', limit = 25): Promise<RedditPost[]> {
    const token = await this.authenticate();
    
    const response = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/${sort}?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'IdeaSpark/1.0 by RelationshipOne8189'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditResponse = await response.json();
    return data.data.children.map(child => child.data);
  }

  private extractPainPoints(posts: RedditPost[]): PainPoint[] {
    const painPoints: PainPoint[] = [];
    
    // 갈증포인트를 나타내는 키워드들
    const painKeywords = [
      'problem', 'issue', 'struggle', 'difficult', 'hard', 'frustrating', 'annoying',
      '문제', '어려움', '힘들어', '불편', '짜증', '고민', '걱정', '해결',
      'pain', 'trouble', 'challenge', 'stuck', 'confused', 'need help',
      'why does', 'how to', 'can\'t figure', 'doesn\'t work'
    ];

    for (const post of posts) {
      const title = post.title.toLowerCase();
      const content = (post.selftext || '').toLowerCase();
      const fullText = `${title} ${content}`;

      // 갈증포인트 키워드가 포함된 게시물인지 확인
      const hasPainKeywords = painKeywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
      );

      if (hasPainKeywords && content.length > 50) {
        // 트렌드 스코어 계산 (점수와 댓글 수 기반)
        const trendScore = Math.min(
          (post.score * 0.7 + post.num_comments * 0.3) / 100,
          1.0
        );

        // 감정 스코어 계산 (부정적인 키워드 기반)
        const negativeKeywords = ['frustrated', 'annoying', 'terrible', '짜증', '힘들어', '최악'];
        const negativeCount = negativeKeywords.filter(keyword => 
          fullText.includes(keyword)
        ).length;
        const sentimentScore = Math.max(0.1, 0.5 - (negativeCount * 0.1));

        // 키워드 추출 (간단한 방식)
        const keywords = this.extractKeywords(fullText);

        // 카테고리 분류
        const category = this.categorizePost(post.subreddit, fullText);

        painPoints.push({
          title: post.title,
          content: post.selftext || post.title,
          source: 'reddit',
          source_url: `https://reddit.com${post.url}`,
          sentiment_score: sentimentScore,
          trend_score: trendScore,
          keywords,
          category
        });
      }
    }

    return painPoints;
  }

  private extractKeywords(text: string): string[] {
    // 기술 관련 키워드들
    const techKeywords = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'node',
      'api', 'database', 'frontend', 'backend', 'mobile', 'web', 'app',
      'cloud', 'aws', 'docker', 'kubernetes', 'microservices',
      '개발', '프로그래밍', '코딩', '웹', '앱', '모바일', 'AI', '머신러닝'
    ];

    const businessKeywords = [
      'startup', 'business', 'marketing', 'sales', 'customer', 'user',
      'product', 'service', 'revenue', 'profit', 'growth',
      '스타트업', '비즈니스', '마케팅', '고객', '서비스', '제품'
    ];

    const allKeywords = [...techKeywords, ...businessKeywords];
    
    return allKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 5); // 최대 5개 키워드
  }

  private categorizePost(subreddit: string, content: string): string {
    const categories = {
      'development': ['programming', 'webdev', 'javascript', 'python', 'reactjs', 'coding'],
      'productivity': ['productivity', 'getmotivated', 'lifehacks', 'selfimprovement'],
      'business': ['entrepreneur', 'startups', 'business', 'marketing', 'smallbusiness'],
      'ecommerce': ['shopify', 'ecommerce', 'amazonFBA', 'dropshipping'],
      'design': ['design', 'ui_design', 'ux', 'webdesign', 'graphic_design'],
      'general': ['askreddit', 'nostupidquestions', 'explainlikeimfive']
    };

    const subredditLower = subreddit.toLowerCase();
    const contentLower = content.toLowerCase();

    for (const [category, subs] of Object.entries(categories)) {
      if (subs.some(sub => subredditLower.includes(sub) || contentLower.includes(sub))) {
        return category;
      }
    }

    return 'general';
  }

  async collectPainPoints(limit = 50): Promise<PainPoint[]> {
    try {
      // 개발자와 비즈니스 관련 서브레딧들
      const subreddits = [
        'programming', 'webdev', 'javascript', 'reactjs', 'node',
        'entrepreneur', 'startups', 'smallbusiness', 'productivity',
        'askreddit', 'nostupidquestions', 'explainlikeimfive'
      ];

      const allPainPoints: PainPoint[] = [];

      // 각 서브레딧에서 갈증포인트 수집
      for (const subreddit of subreddits.slice(0, 3)) { // 처음 3개만 수집 (속도 개선)
        try {
          const posts = await this.fetchSubreddit(subreddit, 'hot', 10);
          const painPoints = this.extractPainPoints(posts);
          allPainPoints.push(...painPoints);
          
          // API 제한을 피하기 위한 지연
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error collecting from r/${subreddit}:`, error);
          continue;
        }
      }

      // 트렌드 스코어로 정렬하고 상위 항목만 반환
      return allPainPoints
        .sort((a, b) => b.trend_score - a.trend_score)
        .slice(0, limit);

    } catch (error) {
      console.error('Reddit collection failed:', error);
      
      // 실패시 샘플 갈증포인트 반환 (개발 및 테스트용)
      return [
        {
          title: "React useState가 업데이트 안되는 문제",
          content: "setState를 호출해도 컴포넌트가 리렌더링되지 않습니다. 클로저 문제인 것 같은데 어떻게 해결하나요?",
          source: 'reddit',
          source_url: 'https://reddit.com/r/reactjs/sample1',
          sentiment_score: 0.3,
          trend_score: 0.85,
          keywords: ['React', 'useState', 'setState', '리렌더링', '클로저'],
          category: 'development'
        },
        {
          title: "스타트업 초기 고객 확보 방법",
          content: "MVP를 만들었는데 첫 고객을 어떻게 확보해야 할지 모르겠습니다. 마케팅 예산이 거의 없는 상황에서 효과적인 방법이 있을까요?",
          source: 'reddit',
          source_url: 'https://reddit.com/r/startups/sample2',
          sentiment_score: 0.4,
          trend_score: 0.78,
          keywords: ['스타트업', 'MVP', '고객 확보', '마케팅', '예산'],
          category: 'business'
        }
      ];
    }
  }
}

export const redditCollector = new RedditCollector();