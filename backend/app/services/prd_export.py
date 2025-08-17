"""
PRD Export Service
PDF and Markdown export functionality for PRD documents
"""

import os
import io
import time
import tempfile
import markdown
from typing import Dict, Any, Optional, Union, BinaryIO
from pathlib import Path
from datetime import datetime
import structlog

# PDF generation imports
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor, black, blue, grey
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.platypus.flowables import Image, HRFlowable
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from app.services.prd_generator import PRDDocument, MermaidDiagram
from app.services.prd_templates import get_template_manager

logger = structlog.get_logger()

class ExportFormat:
    """Export format constants"""
    PDF = "pdf"
    MARKDOWN = "markdown" 
    HTML = "html"
    
class ExportOptions:
    """Export configuration options"""
    def __init__(self, 
                 include_diagrams: bool = True,
                 include_cover_page: bool = True,
                 include_table_of_contents: bool = True,
                 page_size: str = "A4",
                 font_family: str = "Helvetica",
                 theme: str = "professional"):
        self.include_diagrams = include_diagrams
        self.include_cover_page = include_cover_page
        self.include_table_of_contents = include_table_of_contents
        self.page_size = page_size
        self.font_family = font_family
        self.theme = theme

class PRDExportService:
    """Professional PRD export service with multiple formats"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="PRDExportService")
        
        # Export configuration
        self.temp_dir = Path(tempfile.gettempdir()) / "prd_exports"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Performance tracking
        self.export_stats = {
            "total_exports": 0,
            "successful_exports": 0,
            "format_counts": {
                "pdf": 0,
                "markdown": 0,
                "html": 0
            },
            "average_export_time": 0.0
        }
        
        # Style configurations
        self._setup_export_styles()
        
        self.logger.info("PRD Export Service initialized",
                        reportlab_available=REPORTLAB_AVAILABLE,
                        temp_dir=str(self.temp_dir))
    
    def _setup_export_styles(self):
        """Setup export styling configurations"""
        
        self.themes = {
            "professional": {
                "primary_color": "#2563EB",
                "secondary_color": "#64748B", 
                "accent_color": "#059669",
                "background_color": "#F8FAFC",
                "text_color": "#1E293B"
            },
            "modern": {
                "primary_color": "#7C3AED",
                "secondary_color": "#6B7280",
                "accent_color": "#EF4444", 
                "background_color": "#FFFFFF",
                "text_color": "#111827"
            },
            "corporate": {
                "primary_color": "#1F2937",
                "secondary_color": "#9CA3AF",
                "accent_color": "#F59E0B",
                "background_color": "#F9FAFB",
                "text_color": "#374151"
            }
        }
        
        # Markdown styles
        self.markdown_css = """
<style>
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #ffffff;
}

h1, h2, h3, h4, h5, h6 {
    color: #2563EB;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

h1 {
    border-bottom: 3px solid #2563EB;
    padding-bottom: 0.5rem;
    font-size: 2.5rem;
}

h2 {
    border-bottom: 2px solid #E5E7EB;
    padding-bottom: 0.3rem;
    font-size: 2rem;
}

code {
    background-color: #F3F4F6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
}

pre {
    background-color: #1F2937;
    color: #F9FAFB;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
}

blockquote {
    border-left: 4px solid #2563EB;
    margin: 0;
    padding-left: 1rem;
    color: #64748B;
    font-style: italic;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

th, td {
    border: 1px solid #E5E7EB;
    padding: 0.75rem;
    text-align: left;
}

th {
    background-color: #F3F4F6;
    font-weight: 600;
    color: #374151;
}

.mermaid-diagram {
    text-align: center;
    margin: 2rem 0;
    padding: 1rem;
    background-color: #F8FAFC;
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
}

.section-divider {
    margin: 3rem 0;
    border: none;
    border-top: 2px solid #E5E7EB;
}

.metadata {
    background-color: #F0F9FF;
    border: 1px solid #0EA5E9;
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1rem 0;
}

.feature-list {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
}

.feature-card {
    border: 1px solid #E5E7EB;
    border-radius: 0.5rem;
    padding: 1rem;
    background-color: #FAFAFA;
}

@media print {
    body { font-size: 12pt; }
    h1 { page-break-before: always; }
    .no-print { display: none; }
}
</style>
"""
    
    async def export_prd(self, 
                        prd_document: PRDDocument, 
                        format: str,
                        options: Optional[ExportOptions] = None) -> Dict[str, Any]:
        """
        Export PRD document to specified format
        
        Args:
            prd_document: PRD document to export
            format: Export format (pdf, markdown, html)
            options: Export configuration options
            
        Returns:
            Dict containing export results and file info
        """
        
        start_time = time.time()
        
        try:
            # Validate format
            if format not in [ExportFormat.PDF, ExportFormat.MARKDOWN, ExportFormat.HTML]:
                raise ValueError(f"Unsupported export format: {format}")
            
            # Use default options if not provided
            if options is None:
                options = ExportOptions()
            
            self.logger.info("Starting PRD export",
                           prd_id=prd_document.id,
                           format=format,
                           include_diagrams=options.include_diagrams)
            
            # Generate export based on format
            if format == ExportFormat.PDF:
                result = await self._export_to_pdf(prd_document, options)
            elif format == ExportFormat.MARKDOWN:
                result = await self._export_to_markdown(prd_document, options)
            elif format == ExportFormat.HTML:
                result = await self._export_to_html(prd_document, options)
            
            export_time = time.time() - start_time
            
            # Update statistics
            self._update_export_stats(format, export_time, True)
            
            self.logger.info("PRD export completed successfully",
                           prd_id=prd_document.id,
                           format=format,
                           export_time=export_time,
                           file_size=result.get("file_size", 0))
            
            return {
                **result,
                "export_time": export_time,
                "status": "success"
            }
            
        except Exception as e:
            export_time = time.time() - start_time
            self._update_export_stats(format, export_time, False)
            
            self.logger.error("PRD export failed",
                            prd_id=prd_document.id,
                            format=format,
                            error=str(e))
            
            return {
                "status": "error",
                "error": str(e),
                "export_time": export_time
            }
    
    async def _export_to_pdf(self, prd_document: PRDDocument, options: ExportOptions) -> Dict[str, Any]:
        """Export PRD to PDF format"""
        
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab is required for PDF export but not installed")
        
        # Generate filename
        filename = f"PRD_{prd_document.id}_{int(time.time())}.pdf"
        file_path = self.temp_dir / filename
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(file_path),
            pagesize=A4 if options.page_size == "A4" else letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Get styles
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=HexColor(self.themes[options.theme]["primary_color"]),
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=HexColor(self.themes[options.theme]["primary_color"])
        )
        
        # Cover page
        if options.include_cover_page:
            story.append(Spacer(1, 2*inch))
            story.append(Paragraph(prd_document.title, title_style))
            story.append(Spacer(1, 0.5*inch))
            story.append(Paragraph("Product Requirements Document", styles['Heading3']))
            story.append(Spacer(1, 0.3*inch))
            
            # Metadata table
            metadata = [
                ['생성일', prd_document.generated_at.strftime('%Y-%m-%d %H:%M:%S')],
                ['문서 ID', prd_document.id],
                ['예상 개발 기간', prd_document.estimated_dev_time],
                ['다이어그램 수', str(len(prd_document.diagrams))],
                ['템플릿 버전', prd_document.template_version]
            ]
            
            metadata_table = Table(metadata, colWidths=[2*inch, 3*inch])
            metadata_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#F3F4F6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#FFFFFF')),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#E5E7EB'))
            ]))
            
            story.append(metadata_table)
            story.append(PageBreak())
        
        # Table of contents
        if options.include_table_of_contents:
            story.append(Paragraph("📋 목차", heading_style))
            toc_items = [
                "1. Executive Summary",
                "2. Target Market", 
                "3. Features & Requirements",
                "4. Technical Requirements",
                "5. Success Metrics",
                "6. Timeline",
                "7. Diagrams"
            ]
            
            for item in toc_items:
                story.append(Paragraph(item, styles['Normal']))
                story.append(Spacer(1, 6))
            
            story.append(PageBreak())
        
        # Content sections
        story.append(Paragraph("📊 Executive Summary", heading_style))
        story.append(Paragraph(prd_document.executive_summary, styles['Normal']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("🎯 Target Market", heading_style))
        story.append(Paragraph(prd_document.target_market, styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Features section
        story.append(Paragraph("🚀 Features & Requirements", heading_style))
        for i, feature in enumerate(prd_document.features, 1):
            feature_title = f"{i}. {feature.get('name', 'Feature')}"
            story.append(Paragraph(feature_title, styles['Heading3']))
            story.append(Paragraph(feature.get('description', ''), styles['Normal']))
            
            # Feature details table
            feature_details = [
                ['우선순위', feature.get('priority', 'N/A')],
                ['개발 복잡도', feature.get('effort', 'N/A')],
                ['의존성', ', '.join(feature.get('dependencies', [])) or 'None']
            ]
            
            feature_table = Table(feature_details, colWidths=[1.5*inch, 3*inch])
            feature_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), HexColor('#F9FAFB')),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#E5E7EB')),
                ('FONTSIZE', (0, 0), (-1, -1), 10)
            ]))
            
            story.append(feature_table)
            story.append(Spacer(1, 15))
        
        # Technical requirements
        story.append(Paragraph("🛠️ Technical Requirements", heading_style))
        tech_content = self._format_technical_requirements_for_pdf(prd_document.technical_requirements)
        story.append(Paragraph(tech_content, styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Success metrics
        story.append(Paragraph("📈 Success Metrics", heading_style))
        for metric in prd_document.success_metrics:
            story.append(Paragraph(f"• {metric}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Timeline
        story.append(Paragraph("📅 Development Timeline", heading_style))
        story.append(Paragraph(prd_document.timeline, styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Diagrams section
        if options.include_diagrams and prd_document.diagrams:
            story.append(PageBreak())
            story.append(Paragraph("📊 System Diagrams", heading_style))
            
            for diagram in prd_document.diagrams:
                story.append(Paragraph(diagram.title, styles['Heading3']))
                story.append(Paragraph(diagram.description, styles['Normal']))
                
                # Mermaid code block
                story.append(Paragraph("Mermaid Code:", styles['Heading4']))
                story.append(Paragraph(f"<pre>{diagram.mermaid_code}</pre>", styles['Code']))
                story.append(Spacer(1, 20))
        
        # Build PDF
        doc.build(story)
        
        # Get file info
        file_size = file_path.stat().st_size
        
        return {
            "filename": filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": "application/pdf",
            "format": ExportFormat.PDF
        }
    
    async def _export_to_markdown(self, prd_document: PRDDocument, options: ExportOptions) -> Dict[str, Any]:
        """Export PRD to Markdown format"""
        
        # Generate filename
        filename = f"PRD_{prd_document.id}_{int(time.time())}.md"
        file_path = self.temp_dir / filename
        
        # Build markdown content
        markdown_content = self._generate_markdown_content(prd_document, options)
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        file_size = file_path.stat().st_size
        
        return {
            "filename": filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": "text/markdown",
            "format": ExportFormat.MARKDOWN,
            "content": markdown_content
        }
    
    async def _export_to_html(self, prd_document: PRDDocument, options: ExportOptions) -> Dict[str, Any]:
        """Export PRD to HTML format"""
        
        # Generate filename
        filename = f"PRD_{prd_document.id}_{int(time.time())}.html"
        file_path = self.temp_dir / filename
        
        # Build markdown content first
        markdown_content = self._generate_markdown_content(prd_document, options)
        
        # Convert to HTML
        html_content = markdown.markdown(
            markdown_content,
            extensions=['tables', 'fenced_code', 'toc'],
            extension_configs={
                'toc': {
                    'title': 'Table of Contents',
                    'anchorlink': True
                }
            }
        )
        
        # Wrap in full HTML document
        full_html = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{prd_document.title} - PRD</title>
    {self.markdown_css}
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        }});
    </script>
</head>
<body>
    <div class="metadata">
        <h3>📋 문서 정보</h3>
        <p><strong>생성일:</strong> {prd_document.generated_at.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p><strong>문서 ID:</strong> {prd_document.id}</p>
        <p><strong>예상 개발 기간:</strong> {prd_document.estimated_dev_time}</p>
        <p><strong>다이어그램 수:</strong> {len(prd_document.diagrams)}</p>
    </div>
    
    {html_content}
    
    <footer style="margin-top: 3rem; padding: 2rem; background-color: #F8FAFC; border-top: 1px solid #E5E7EB; text-align: center; color: #64748B;">
        <p>Generated by IdeaSpark v2.0 PRD Export System</p>
        <p>📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </footer>
</body>
</html>
"""
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(full_html)
        
        file_size = file_path.stat().st_size
        
        return {
            "filename": filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": "text/html",
            "format": ExportFormat.HTML,
            "content": full_html
        }
    
    def _generate_markdown_content(self, prd_document: PRDDocument, options: ExportOptions) -> str:
        """Generate markdown content for PRD"""
        
        content = []
        
        # Title and metadata
        content.append(f"# {prd_document.title}")
        content.append("")
        content.append("> **Product Requirements Document**")
        content.append(f"> Generated on {prd_document.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
        content.append(f"> Document ID: `{prd_document.id}`")
        content.append(f"> Estimated Development Time: **{prd_document.estimated_dev_time}**")
        content.append("")
        
        # Table of contents
        if options.include_table_of_contents:
            content.append("## 📋 Table of Contents")
            content.append("")
            content.append("- [Executive Summary](#executive-summary)")
            content.append("- [Target Market](#target-market)")
            content.append("- [Features & Requirements](#features--requirements)")
            content.append("- [Technical Requirements](#technical-requirements)")
            content.append("- [Success Metrics](#success-metrics)")
            content.append("- [Development Timeline](#development-timeline)")
            if options.include_diagrams and prd_document.diagrams:
                content.append("- [System Diagrams](#system-diagrams)")
            content.append("")
            content.append("---")
            content.append("")
        
        # Executive Summary
        content.append("## 📊 Executive Summary")
        content.append("")
        content.append(prd_document.executive_summary)
        content.append("")
        content.append("---")
        content.append("")
        
        # Target Market
        content.append("## 🎯 Target Market")
        content.append("")
        content.append(prd_document.target_market)
        content.append("")
        content.append("---")
        content.append("")
        
        # Features
        content.append("## 🚀 Features & Requirements")
        content.append("")
        for i, feature in enumerate(prd_document.features, 1):
            content.append(f"### {i}. {feature.get('name', 'Feature')}")
            content.append("")
            content.append(feature.get('description', ''))
            content.append("")
            content.append("| Attribute | Value |")
            content.append("|-----------|--------|")
            content.append(f"| 우선순위 | {feature.get('priority', 'N/A')} |")
            content.append(f"| 개발 복잡도 | {feature.get('effort', 'N/A')} |")
            dependencies = feature.get('dependencies', [])
            deps_str = ', '.join(dependencies) if dependencies else 'None'
            content.append(f"| 의존성 | {deps_str} |")
            content.append("")
        
        content.append("---")
        content.append("")
        
        # Technical Requirements
        content.append("## 🛠️ Technical Requirements")
        content.append("")
        content.append(self._format_technical_requirements_for_markdown(prd_document.technical_requirements))
        content.append("")
        content.append("---")
        content.append("")
        
        # Success Metrics
        content.append("## 📈 Success Metrics")
        content.append("")
        for metric in prd_document.success_metrics:
            content.append(f"- {metric}")
        content.append("")
        content.append("---")
        content.append("")
        
        # Timeline
        content.append("## 📅 Development Timeline")
        content.append("")
        content.append(prd_document.timeline)
        content.append("")
        
        # Diagrams
        if options.include_diagrams and prd_document.diagrams:
            content.append("---")
            content.append("")
            content.append("## 📊 System Diagrams")
            content.append("")
            
            for diagram in prd_document.diagrams:
                content.append(f"### {diagram.title}")
                content.append("")
                content.append(diagram.description)
                content.append("")
                content.append("```mermaid")
                content.append(diagram.mermaid_code)
                content.append("```")
                content.append("")
                content.append(f"**복잡도 점수:** {diagram.complexity_score}/10")
                content.append(f"**생성 시간:** {diagram.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
                content.append("")
        
        # Footer
        content.append("---")
        content.append("")
        content.append("*Generated by IdeaSpark v2.0 PRD Export System*")
        content.append(f"*Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")
        
        return "\n".join(content)
    
    def _format_technical_requirements_for_pdf(self, tech_reqs: Dict[str, Any]) -> str:
        """Format technical requirements for PDF"""
        formatted = []
        
        for category, details in tech_reqs.items():
            formatted.append(f"<b>{category.title()}</b>")
            if isinstance(details, dict):
                for key, value in details.items():
                    formatted.append(f"  • {key}: {value}")
            elif isinstance(details, list):
                for item in details:
                    formatted.append(f"  • {item}")
            else:
                formatted.append(f"  • {details}")
            formatted.append("")
        
        return "<br/>".join(formatted)
    
    def _format_technical_requirements_for_markdown(self, tech_reqs: Dict[str, Any]) -> str:
        """Format technical requirements for Markdown"""
        formatted = []
        
        for category, details in tech_reqs.items():
            formatted.append(f"### {category.title()}")
            formatted.append("")
            
            if isinstance(details, dict):
                formatted.append("| Component | Technology |")
                formatted.append("|-----------|------------|")
                for key, value in details.items():
                    formatted.append(f"| {key.title()} | {value} |")
            elif isinstance(details, list):
                for item in details:
                    formatted.append(f"- {item}")
            else:
                formatted.append(f"- {details}")
            
            formatted.append("")
        
        return "\n".join(formatted)
    
    def _update_export_stats(self, format: str, export_time: float, success: bool):
        """Update export statistics"""
        self.export_stats["total_exports"] += 1
        
        if success:
            self.export_stats["successful_exports"] += 1
            
            # Update average export time
            current_avg = self.export_stats["average_export_time"]
            successful_count = self.export_stats["successful_exports"]
            self.export_stats["average_export_time"] = (
                (current_avg * (successful_count - 1) + export_time) / successful_count
            )
        
        # Update format counts
        if format in self.export_stats["format_counts"]:
            self.export_stats["format_counts"][format] += 1
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """Clean up temporary export files older than specified hours"""
        try:
            current_time = time.time()
            cleaned_count = 0
            
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > (max_age_hours * 3600):
                        file_path.unlink()
                        cleaned_count += 1
            
            self.logger.info("Temporary files cleaned up", 
                           cleaned_count=cleaned_count,
                           max_age_hours=max_age_hours)
            
        except Exception as e:
            self.logger.error("Failed to cleanup temporary files", error=str(e))
    
    def get_export_statistics(self) -> Dict[str, Any]:
        """Get export service statistics"""
        success_rate = 0
        if self.export_stats["total_exports"] > 0:
            success_rate = (self.export_stats["successful_exports"] / 
                          self.export_stats["total_exports"]) * 100
        
        return {
            "performance": {
                "total_exports": self.export_stats["total_exports"],
                "successful_exports": self.export_stats["successful_exports"],
                "success_rate": round(success_rate, 2),
                "average_export_time": round(self.export_stats["average_export_time"], 3)
            },
            "formats": self.export_stats["format_counts"],
            "capabilities": {
                "pdf_support": REPORTLAB_AVAILABLE,
                "markdown_support": True,
                "html_support": True,
                "mermaid_diagrams": True,
                "custom_themes": len(self.themes)
            },
            "temp_directory": str(self.temp_dir),
            "available_themes": list(self.themes.keys())
        }


# Global export service instance
_export_service = None

def get_export_service() -> PRDExportService:
    """Get global export service instance"""
    global _export_service
    if _export_service is None:
        _export_service = PRDExportService()
    return _export_service