#!/usr/bin/env python3
"""
Simple FastAPI test without Supabase dependencies
"""

from fastapi import FastAPI
import uvicorn

# Create minimal FastAPI app
app = FastAPI(
    title="IdeaSpark API Test",
    version="2.0.0"
)

@app.get("/")
async def root():
    return {"message": "IdeaSpark FastAPI Backend is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ideaSpark-backend", 
        "version": "2.0.0"
    }

if __name__ == "__main__":
    print("✅ FastAPI app created successfully!")
    print("✅ Health check endpoint: /health")
    print("✅ Root endpoint: /")
    uvicorn.run(app, host="0.0.0.0", port=8000)