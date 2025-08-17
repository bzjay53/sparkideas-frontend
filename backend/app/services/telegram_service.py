"""
Telegram Service
Daily digest and notification management
"""

import asyncio
from datetime import datetime
from typing import List, Dict, Any
import structlog
from telegram import Bot
from telegram.error import TelegramError

from app.config.settings import settings
from app.services.database import DatabaseService

logger = structlog.get_logger()

class TelegramService:
    """Telegram bot service for daily digests and notifications"""
    
    def __init__(self):
        self.bot = Bot(token=settings.telegram_bot_token)
        self.chat_id = settings.telegram_chat_id
    
    @classmethod
    async def prepare_daily_digest(cls) -> Dict[str, Any]:
        """Prepare daily digest of top business ideas"""
        try:
            # Get top 5 business ideas
            ideas = await DatabaseService.get_telegram_worthy_ideas(5)
            
            if not ideas:
                return {
                    "ideas": [],
                    "total_count": 0,
                    "avg_confidence": 0,
                    "generated_at": datetime.utcnow(),
                    "digest_text": "오늘은 새로운 비즈니스 아이디어가 생성되지 않았습니다."
                }
            
            # Calculate average confidence
            avg_confidence = sum(idea['confidence_score'] for idea in ideas) / len(ideas)
            
            # Generate digest text
            digest_text = cls._format_digest_message(ideas, avg_confidence)
            
            return {
                "ideas": ideas,
                "total_count": len(ideas),
                "avg_confidence": avg_confidence,
                "generated_at": datetime.utcnow(),
                "digest_text": digest_text
            }
        except Exception as e:
            logger.error("Failed to prepare daily digest", error=str(e))
            raise
    
    @classmethod
    def _format_digest_message(cls, ideas: List[Dict[str, Any]], avg_confidence: float) -> str:
        """Format telegram message for daily digest"""
        
        date_str = datetime.now().strftime("%Y년 %m월 %d일")
        
        message = f"""🚀 IdeaSpark 일일 비즈니스 아이디어 리포트
📅 {date_str}

💡 오늘의 TOP {len(ideas)}개 아이디어 (평균 신뢰도: {avg_confidence:.1f}%)

"""
        
        for i, idea in enumerate(ideas, 1):
            difficulty_stars = "⭐" * idea['implementation_difficulty']
            confidence_emoji = "🔥" if idea['confidence_score'] >= 90 else "💪" if idea['confidence_score'] >= 80 else "👍"
            
            message += f"""
{i}. {confidence_emoji} {idea['title']}
   📊 신뢰도: {idea['confidence_score']:.1f}%
   🎯 시장: {idea['target_market'][:50]}{'...' if len(idea['target_market']) > 50 else ''}
   💰 수익모델: {idea['revenue_model'][:50]}{'...' if len(idea['revenue_model']) > 50 else ''}
   🔧 난이도: {difficulty_stars} ({idea['implementation_difficulty']}/5)
   
   📝 {idea['description'][:100]}{'...' if len(idea['description']) > 100 else ''}
   
   ═══════════════════════════════
"""
        
        message += f"""
📈 오늘의 인사이트:
• 총 {len(ideas)}개의 고품질 아이디어 발굴
• 평균 성공 확신도 {avg_confidence:.1f}%
• 가장 유망한 분야: {ideas[0]['target_market'] if ideas else 'N/A'}

🔥 가장 주목할 아이디어: {ideas[0]['title'] if ideas else 'N/A'}

───────────────────────────────
🤖 IdeaSpark v2.0 AI가 실시간 갈증포인트를 분석하여 생성한 비즈니스 아이디어입니다.
💌 매일 오전 9시 새로운 기회를 발견해보세요!
"""
        
        return message
    
    @classmethod
    async def send_daily_digest(cls):
        """Send daily digest via telegram"""
        try:
            service = cls()
            digest = await cls.prepare_daily_digest()
            
            if digest['total_count'] == 0:
                # Send "no ideas today" message
                await service.bot.send_message(
                    chat_id=service.chat_id,
                    text=f"""📅 {datetime.now().strftime('%Y년 %m월 %d일')} IdeaSpark 일일 리포트

아직 분석 중입니다... 🔍
새로운 갈증포인트를 수집하고 AI가 분석하는 중이에요.
더 나은 아이디어로 내일 찾아뵙겠습니다! 

🤖 IdeaSpark v2.0""",
                    parse_mode='HTML'
                )
                
                # Log the message
                await DatabaseService.log_telegram_message({
                    'chat_id': service.chat_id,
                    'message_type': 'daily_digest',
                    'business_idea_ids': [],
                    'message_content': 'No ideas available today',
                    'success': True,
                    'error_message': None
                })
                
                logger.info("Empty daily digest sent successfully")
                return
            
            # Send full digest
            await service.bot.send_message(
                chat_id=service.chat_id,
                text=digest['digest_text'],
                parse_mode='HTML'
            )
            
            # Log successful delivery
            await DatabaseService.log_telegram_message({
                'chat_id': service.chat_id,
                'message_type': 'daily_digest',
                'business_idea_ids': [idea['id'] for idea in digest['ideas']],
                'message_content': digest['digest_text'][:500],  # Truncate for storage
                'success': True,
                'error_message': None
            })
            
            logger.info("Daily digest sent successfully", 
                       ideas_count=digest['total_count'],
                       avg_confidence=digest['avg_confidence'])
            
        except TelegramError as e:
            logger.error("Telegram API error", error=str(e))
            
            # Log failed delivery
            await DatabaseService.log_telegram_message({
                'chat_id': settings.telegram_chat_id,
                'message_type': 'daily_digest',
                'business_idea_ids': [],
                'message_content': 'Failed to send',
                'success': False,
                'error_message': str(e)
            })
            raise
            
        except Exception as e:
            logger.error("Failed to send daily digest", error=str(e))
            raise
    
    @classmethod
    async def send_instant_idea_alert(cls, idea: Dict[str, Any]):
        """Send instant alert for high-confidence ideas"""
        try:
            if idea['confidence_score'] < 95:  # Only send for very high confidence
                return
            
            service = cls()
            
            alert_message = f"""🔥 긴급! 초고신뢰도 비즈니스 아이디어 발견!

💡 {idea['title']}
📊 신뢰도: {idea['confidence_score']:.1f}% (95%+ 등급)

🎯 타겟: {idea['target_market']}
💰 수익: {idea['revenue_model']}
🔧 난이도: {"⭐" * idea['implementation_difficulty']} ({idea['implementation_difficulty']}/5)

📝 {idea['description'][:200]}{'...' if len(idea['description']) > 200 else ''}

⚡ 이런 기회는 놓치지 마세요!

🤖 IdeaSpark v2.0 AI가 실시간으로 발견했습니다."""
            
            await service.bot.send_message(
                chat_id=service.chat_id,
                text=alert_message,
                parse_mode='HTML'
            )
            
            # Log the alert
            await DatabaseService.log_telegram_message({
                'chat_id': service.chat_id,
                'message_type': 'alert',
                'business_idea_ids': [idea['id']],
                'message_content': alert_message[:500],
                'success': True,
                'error_message': None
            })
            
            logger.info("Instant idea alert sent", 
                       idea_id=idea['id'],
                       confidence=idea['confidence_score'])
            
        except Exception as e:
            logger.error("Failed to send instant idea alert", 
                        idea_id=idea.get('id'),
                        error=str(e))
    
    @classmethod
    async def send_test_message(cls) -> bool:
        """Send test message to verify bot functionality"""
        try:
            service = cls()
            
            test_message = f"""🧪 IdeaSpark 테스트 메시지

🤖 봇이 정상 작동 중입니다!
📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

✅ 텔레그램 연결 확인됨
🚀 IdeaSpark v2.0 준비 완료!"""
            
            await service.bot.send_message(
                chat_id=service.chat_id,
                text=test_message
            )
            
            logger.info("Test message sent successfully")
            return True
            
        except Exception as e:
            logger.error("Failed to send test message", error=str(e))
            return False