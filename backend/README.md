# IdeaSpark Backend v2.0

FastAPI backend for the IdeaSpark real-time pain point analysis and business idea generation platform.

## 🚀 Features

- **Real-time Data Collection**: Automated collection from Reddit, Google, Naver, LinkedIn, Twitter
- **AI-Powered Analysis**: GPT-4 based pain point analysis and business idea generation
- **Automated Telegram Notifications**: Daily digest at 9:00 AM with 5 curated business proposals
- **RESTful API**: Complete API for frontend integration
- **Background Tasks**: Scheduled data collection and processing
- **Vercel Serverless Ready**: Optimized for Vercel deployment

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── main_minimal.py        # Minimal version for testing
│   ├── api/                   # API endpoints
│   │   ├── __init__.py
│   │   └── endpoints/         # API route handlers
│   ├── config/                # Configuration
│   │   ├── settings.py        # Application settings
│   │   └── __init__.py
│   └── services/              # Business logic services
│       ├── ai_analyzer.py     # GPT-4 analysis service
│       ├── data_collector.py  # Multi-platform data collection
│       ├── database.py        # Supabase database operations
│       ├── database_minimal.py # Minimal database for testing
│       ├── scheduler.py       # Background task scheduling
│       └── telegram_service.py # Telegram bot integration
├── requirements.txt           # Python dependencies
├── Dockerfile                # Docker configuration
├── vercel.json               # Vercel deployment config
├── start.py                  # Application startup script
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔧 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Development Server

```bash
# Option 1: Using the startup script
python start.py

# Option 2: Direct uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 3: Minimal version (for testing)
python app/main_minimal.py
```

### 4. Access API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

## 📡 API Endpoints

### Core Endpoints

- `GET /` - Root endpoint with service information
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation

### Pain Points API

- `GET /api/pain-points` - Get recent pain points
- `POST /api/pain-points/collect` - Trigger data collection
- `GET /api/pain-points/stats` - Get collection statistics

### Business Ideas API

- `GET /api/business-ideas` - Get generated business ideas
- `POST /api/business-ideas/generate` - Generate new ideas
- `GET /api/business-ideas/{id}` - Get specific business idea

### Analytics API

- `GET /api/analytics/overview` - Get comprehensive analytics
- `GET /api/analytics/trending-keywords` - Get trending keywords
- `GET /api/analytics/performance` - Get system performance metrics

### Telegram API

- `POST /api/telegram/send-digest` - Send daily digest immediately
- `GET /api/telegram/digest/preview` - Preview digest without sending
- `POST /api/telegram/test` - Send test message
- `GET /api/telegram/stats` - Get delivery statistics

### Community API (Planned for Epic 2)

- `GET /api/community` - Community platform status
- `GET /api/community/health` - Community service health check

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t ideaSpark-backend .
```

### Run Container

```bash
docker run -p 8000:8000 --env-file .env ideaSpark-backend
```

## ☁️ Vercel Deployment

### Prerequisites

- Vercel account
- Environment variables configured in Vercel dashboard

### Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### Environment Variables

Configure these in Vercel dashboard:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- etc. (see .env.example)

## 🔄 Background Tasks

The application includes automated background tasks:

- **Data Collection**: Every 6 hours from all sources
- **AI Analysis**: Every 2 hours for unprocessed pain points
- **Business Idea Generation**: Every 4 hours in batches
- **Telegram Digest**: Daily at 9:00 AM

## 📊 Monitoring

### Health Checks

- Application health: `GET /health`
- Database connectivity: Included in health endpoint
- External API status: Real-time monitoring

### Logging

Structured logging with `structlog`:

- Request/response logging
- Error tracking
- Performance metrics
- Business logic events

## 🛠️ Development

### Code Structure

- **Separation of Concerns**: Services, API, configuration clearly separated
- **Async/Await**: Full async support for better performance
- **Type Hints**: Complete type annotations for better development experience
- **Error Handling**: Comprehensive error handling and logging

### Testing

```bash
# Run tests (when available)
pytest

# Run with coverage
pytest --cov=app tests/
```

### Code Quality

```bash
# Format code
black app/

# Sort imports
isort app/

# Type checking
mypy app/
```

## 🔐 Security

- **JWT Authentication**: Secure API access
- **CORS Configuration**: Properly configured for frontend
- **Environment Variables**: Secure credential management
- **Input Validation**: Pydantic models for request validation
- **Rate Limiting**: Protection against abuse

## 📈 Performance

- **Async Operations**: Non-blocking I/O for better concurrency
- **Background Tasks**: CPU-intensive work moved to background
- **Caching**: Strategic caching for frequently accessed data
- **Database Optimization**: Efficient queries and indexing

## 🚨 Troubleshooting

### Common Issues

1. **Module Import Errors**: Ensure PYTHONPATH is set correctly
2. **Database Connection**: Check Supabase credentials and network
3. **API Rate Limits**: Monitor external API usage
4. **Memory Issues**: Adjust worker count for Vercel deployment

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python start.py
```

## 📝 License

MIT License - see project root for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

**Version**: 2.0.0  
**Last Updated**: 2025-08-16  
**Status**: ✅ Production Ready