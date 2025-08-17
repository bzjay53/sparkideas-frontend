"""
PRD Generation API Endpoints
Complete PRD generation with templates and Mermaid diagrams
"""

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import structlog
import time

from app.services.prd_generator import get_prd_generator, PRDDocument
from app.services.prd_templates import get_template_manager, TemplateType
from app.services.prd_export import get_export_service, ExportFormat, ExportOptions

logger = structlog.get_logger()
router = APIRouter()

class PRDGenerationRequest(BaseModel):
    """Request model for PRD generation"""
    business_idea: Dict[str, Any] = Field(..., description="Business idea data")
    options: Optional[Dict[str, Any]] = Field(default={}, description="Generation options")
    
class TemplateListResponse(BaseModel):
    """Response model for template listing"""
    templates: List[Dict[str, Any]]
    total_count: int
    
class PRDGenerationResponse(BaseModel):
    """Response model for PRD generation"""
    prd_id: str
    title: str
    sections: List[str]
    diagrams_count: int
    generation_time: float
    template_used: Optional[str] = None
    estimated_dev_time: str

class ExportRequest(BaseModel):
    """Request model for PRD export"""
    prd_id: str = Field(..., description="PRD document ID")
    format: str = Field(..., description="Export format (pdf, markdown, html)")
    options: Optional[Dict[str, Any]] = Field(default={}, description="Export options")

class ExportResponse(BaseModel):
    """Response model for PRD export"""
    export_id: str
    filename: str
    file_size: int
    format: str
    download_url: str
    expires_at: str

@router.post("/generate", response_model=PRDGenerationResponse)
async def generate_prd(
    request: PRDGenerationRequest,
    background_tasks: BackgroundTasks
) -> PRDGenerationResponse:
    """
    Generate complete PRD document with Mermaid diagrams
    
    **Features:**
    - 🎯 Automatic template selection based on business idea
    - 📊 Mermaid diagram generation (flowchart, ERD, architecture)
    - 📝 Professional PRD content with industry standards
    - ⚡ Vercel-optimized performance (< 2 minutes generation)
    """
    
    try:
        logger.info("PRD generation requested", 
                   business_title=request.business_idea.get("title", "Unknown"))
        
        # Get PRD generator
        prd_generator = get_prd_generator()
        
        # Generate PRD document
        prd_document = await prd_generator.generate_complete_prd(
            business_idea=request.business_idea,
            options=request.options
        )
        
        # Extract template info if available
        template_used = request.options.get("template_id")
        if not template_used:
            # Get auto-selected template
            template_manager = get_template_manager()
            recommendations = template_manager.get_template_recommendations(request.business_idea)
            template_used = recommendations[0] if recommendations else "standard_business_v1"
        
        # Prepare response
        response = PRDGenerationResponse(
            prd_id=prd_document.id,
            title=prd_document.title,
            sections=["executive_summary", "features", "technical_requirements", "timeline", "success_metrics"],
            diagrams_count=len(prd_document.diagrams),
            generation_time=2.3,  # TODO: Track actual generation time
            template_used=template_used,
            estimated_dev_time=prd_document.estimated_dev_time
        )
        
        # Store PRD in background (could save to database)
        background_tasks.add_task(_store_prd_document, prd_document)
        
        logger.info("PRD generated successfully", 
                   prd_id=prd_document.id,
                   diagrams_count=len(prd_document.diagrams))
        
        return response
        
    except Exception as e:
        logger.error("PRD generation failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"PRD generation failed: {str(e)}"
        )

@router.get("/templates", response_model=TemplateListResponse)
async def list_templates(
    template_type: Optional[str] = Query(None, description="Filter by template type")
) -> TemplateListResponse:
    """
    List available PRD templates
    
    **Template Types:**
    - `standard`: General business PRD template
    - `saas`: SaaS platform specialized template  
    - `mobile_app`: Mobile application template
    - `enterprise`: Enterprise solution template
    """
    
    try:
        template_manager = get_template_manager()
        
        # Convert string to enum if provided
        type_filter = None
        if template_type:
            try:
                type_filter = TemplateType(template_type.lower())
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid template type: {template_type}"
                )
        
        # Get templates
        templates_metadata = template_manager.list_templates(type_filter)
        
        # Convert to response format
        templates_list = []
        for metadata in templates_metadata:
            templates_list.append({
                "id": metadata.id,
                "name": metadata.name,
                "description": metadata.description,
                "type": metadata.template_type.value,
                "version": metadata.version,
                "usage_count": metadata.usage_count,
                "success_rate": metadata.success_rate,
                "supports_diagrams": metadata.supports_diagrams,
                "sections": [s.value for s in metadata.sections],
                "tags": metadata.tags
            })
        
        return TemplateListResponse(
            templates=templates_list,
            total_count=len(templates_list)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Template listing failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list templates: {str(e)}"
        )

@router.get("/templates/{template_id}")
async def get_template_details(template_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific template
    """
    
    try:
        template_manager = get_template_manager()
        template = template_manager.get_template(template_id)
        
        if not template:
            raise HTTPException(
                status_code=404,
                detail=f"Template not found: {template_id}"
            )
        
        return {
            "metadata": {
                "id": template.metadata.id,
                "name": template.metadata.name,
                "description": template.metadata.description,
                "type": template.metadata.template_type.value,
                "version": template.metadata.version,
                "author": template.metadata.author,
                "created_at": template.metadata.created_at.isoformat(),
                "updated_at": template.metadata.updated_at.isoformat(),
                "usage_count": template.metadata.usage_count,
                "success_rate": template.metadata.success_rate,
                "average_generation_time": template.metadata.average_generation_time,
                "tags": template.metadata.tags
            },
            "sections": [s.value for s in template.metadata.sections],
            "variables": [
                {
                    "name": var.name,
                    "type": var.type,
                    "description": var.description,
                    "required": var.required,
                    "default_value": var.default_value,
                    "options": var.options
                }
                for var in template.metadata.variables
            ],
            "style_config": template.style_config,
            "supports_diagrams": template.metadata.supports_diagrams,
            "requires_ai_enhancement": template.metadata.requires_ai_enhancement
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Template details retrieval failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get template details: {str(e)}"
        )

@router.get("/{prd_id}")
async def get_prd_document(prd_id: str) -> Dict[str, Any]:
    """
    Get PRD document by ID
    
    **Note**: This endpoint returns stored PRD data.
    For now, it returns a mock response as storage is not yet implemented.
    """
    
    try:
        # TODO: Implement actual PRD retrieval from database
        logger.info("PRD document requested", prd_id=prd_id)
        
        # Mock response for now
        return {
            "prd_id": prd_id,
            "title": "Sample Business Idea PRD",
            "status": "generated",
            "created_at": "2025-08-16T12:00:00Z",
            "sections": {
                "executive_summary": "이것은 샘플 PRD 문서입니다...",
                "features": ["사용자 인증", "핵심 비즈니스 로직", "대시보드"],
                "technical_requirements": {
                    "frontend": "Next.js 15 + TypeScript",
                    "backend": "FastAPI + Python",
                    "database": "PostgreSQL"
                }
            },
            "diagrams": [
                {
                    "type": "flowchart",
                    "title": "사용자 플로우",
                    "mermaid_code": "flowchart TD\\n    A[사용자] --> B[로그인]\\n    B --> C[대시보드]"
                }
            ],
            "estimated_dev_time": "3-6개월 (표준 웹 애플리케이션)",
            "template_used": "standard_business_v1"
        }
        
    except Exception as e:
        logger.error("PRD document retrieval failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve PRD document: {str(e)}"
        )

@router.get("/stats/generation")
async def get_generation_statistics() -> Dict[str, Any]:
    """
    Get PRD generation system statistics
    """
    
    try:
        prd_generator = get_prd_generator()
        template_manager = get_template_manager()
        
        # Get generator metrics
        generator_metrics = prd_generator.get_generation_metrics()
        
        # Get template manager stats
        template_stats = template_manager.get_manager_statistics()
        
        return {
            "prd_generation": generator_metrics,
            "template_system": template_stats,
            "system_status": {
                "service": "prd_generation",
                "status": "operational",
                "features": [
                    "Mermaid diagram generation",
                    "Template-based content generation",
                    "Multiple template types",
                    "Vercel-optimized performance",
                    "AI-powered content enhancement"
                ]
            }
        }
        
    except Exception as e:
        logger.error("Statistics retrieval failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )

@router.post("/templates/recommend")
async def recommend_templates(business_idea: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get template recommendations for a business idea
    """
    
    try:
        template_manager = get_template_manager()
        recommendations = template_manager.get_template_recommendations(business_idea)
        
        # Get detailed info for recommended templates
        recommended_templates = []
        for template_id in recommendations:
            template = template_manager.get_template(template_id)
            if template:
                recommended_templates.append({
                    "id": template.metadata.id,
                    "name": template.metadata.name,
                    "description": template.metadata.description,
                    "type": template.metadata.template_type.value,
                    "confidence": 0.85,  # TODO: Implement actual confidence scoring
                    "reason": "Matched business idea characteristics"
                })
        
        return {
            "business_idea": {
                "title": business_idea.get("title", "Unknown"),
                "description": business_idea.get("description", "")[:100] + "..."
            },
            "recommendations": recommended_templates,
            "total_recommendations": len(recommended_templates)
        }
        
    except Exception as e:
        logger.error("Template recommendation failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to recommend templates: {str(e)}"
        )

# Background task functions
@router.post("/{prd_id}/export", response_model=ExportResponse)
async def export_prd(
    prd_id: str,
    request: ExportRequest,
    background_tasks: BackgroundTasks
) -> ExportResponse:
    """
    Export PRD document to specified format
    
    **Supported Formats:**
    - `pdf`: Professional PDF document with styling
    - `markdown`: GitHub-flavored Markdown with Mermaid diagrams
    - `html`: Interactive HTML with embedded Mermaid rendering
    
    **Export Options:**
    - `include_diagrams`: Include Mermaid diagrams (default: true)
    - `include_cover_page`: Include cover page for PDF (default: true) 
    - `include_table_of_contents`: Include TOC (default: true)
    - `theme`: Style theme - professional, modern, corporate (default: professional)
    """
    
    try:
        logger.info("PRD export requested", 
                   prd_id=prd_id,
                   format=request.format)
        
        # TODO: Retrieve actual PRD document from database
        # For now, create a mock PRD document
        from app.services.prd_generator import PRDDocument, MermaidDiagram, DiagramType
        from datetime import datetime
        
        mock_diagram = MermaidDiagram(
            diagram_type=DiagramType.FLOWCHART,
            title="Sample Business Flow",
            description="User journey flowchart",
            mermaid_code="flowchart TD\n    A[User] --> B[Login]\n    B --> C[Dashboard]",
            complexity_score=3.5
        )
        
        mock_prd = PRDDocument(
            id=prd_id,
            title="Sample Business Idea",
            business_idea_id="sample_idea_123",
            executive_summary="This is a sample PRD for testing export functionality...",
            target_market="Small to medium businesses",
            features=[
                {
                    "name": "User Authentication",
                    "description": "Secure login and registration system",
                    "priority": "High",
                    "effort": "Medium",
                    "dependencies": []
                },
                {
                    "name": "Dashboard Analytics",
                    "description": "Real-time business metrics visualization",
                    "priority": "High", 
                    "effort": "High",
                    "dependencies": ["User Authentication"]
                }
            ],
            technical_requirements={
                "frontend": {
                    "framework": "Next.js 15 + TypeScript",
                    "styling": "Tailwind CSS",
                    "deployment": "Vercel"
                },
                "backend": {
                    "framework": "FastAPI + Python",
                    "database": "PostgreSQL",
                    "hosting": "Vercel Serverless"
                }
            },
            diagrams=[mock_diagram],
            timeline="Phase 1 (2주): 기본 구조\nPhase 2 (4주): 핵심 기능\nPhase 3 (2주): 테스트 및 배포",
            success_metrics=[
                "월간 활성 사용자 1,000명 달성",
                "사용자 리텐션 70% 이상",
                "NPS 점수 50+ 달성"
            ]
        )
        
        # Parse export options
        export_options = ExportOptions(
            include_diagrams=request.options.get("include_diagrams", True),
            include_cover_page=request.options.get("include_cover_page", True),
            include_table_of_contents=request.options.get("include_table_of_contents", True),
            theme=request.options.get("theme", "professional")
        )
        
        # Get export service and export document
        export_service = get_export_service()
        export_result = await export_service.export_prd(
            prd_document=mock_prd,
            format=request.format,
            options=export_options
        )
        
        if export_result["status"] == "error":
            raise HTTPException(
                status_code=500,
                detail=f"Export failed: {export_result['error']}"
            )
        
        # Schedule cleanup of temp file
        background_tasks.add_task(
            _cleanup_export_file, 
            export_result["file_path"], 
            24  # hours
        )
        
        # Calculate expiration time (24 hours)
        from datetime import datetime, timedelta
        expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
        
        # Generate download URL
        download_url = f"/api/v1/prd/download/{export_result['filename']}"
        
        logger.info("PRD export completed successfully",
                   prd_id=prd_id,
                   format=request.format,
                   filename=export_result["filename"],
                   file_size=export_result["file_size"])
        
        return ExportResponse(
            export_id=f"export_{prd_id}_{int(time.time())}",
            filename=export_result["filename"],
            file_size=export_result["file_size"],
            format=export_result["format"],
            download_url=download_url,
            expires_at=expires_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("PRD export failed", 
                   prd_id=prd_id,
                   format=request.format,
                   error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Export failed: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_exported_file(filename: str):
    """
    Download exported PRD file
    
    **Note**: Files are automatically cleaned up after 24 hours
    """
    
    try:
        export_service = get_export_service()
        file_path = export_service.temp_dir / filename
        
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Export file not found or expired"
            )
        
        # Determine media type based on file extension
        media_type = "application/octet-stream"
        if filename.endswith('.pdf'):
            media_type = "application/pdf"
        elif filename.endswith('.md'):
            media_type = "text/markdown"
        elif filename.endswith('.html'):
            media_type = "text/html"
        
        logger.info("PRD file download requested", filename=filename)
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type=media_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("File download failed", 
                   filename=filename,
                   error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {str(e)}"
        )

@router.get("/export/stats")
async def get_export_statistics():
    """Get PRD export service statistics"""
    
    try:
        export_service = get_export_service()
        return export_service.get_export_statistics()
        
    except Exception as e:
        logger.error("Export statistics retrieval failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve export statistics: {str(e)}"
        )

# Background task functions
async def _store_prd_document(prd_document: PRDDocument):
    """Store PRD document (background task)"""
    try:
        # TODO: Implement actual storage to database
        logger.info("PRD document stored", 
                   prd_id=prd_document.id,
                   title=prd_document.title)
    except Exception as e:
        logger.error("Failed to store PRD document", 
                   prd_id=prd_document.id,
                   error=str(e))

async def _cleanup_export_file(file_path: str, hours_delay: int):
    """Clean up export file after specified hours (background task)"""
    import asyncio
    
    try:
        # Wait for specified hours
        await asyncio.sleep(hours_delay * 3600)
        
        # Delete file if it exists
        from pathlib import Path
        path = Path(file_path)
        if path.exists():
            path.unlink()
            logger.info("Export file cleaned up", file_path=file_path)
            
    except Exception as e:
        logger.error("Failed to cleanup export file", 
                   file_path=file_path,
                   error=str(e))