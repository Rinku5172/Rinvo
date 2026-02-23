"""
RocketPDF PDF Conversion API - COMPLETE FIXED VERSION
Complete REST API for PDF manipulation and conversion
Built with FastAPI for high performance and automatic documentation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional, Dict, Any
import os
import shutil
import tempfile
from pathlib import Path
import asyncio
from datetime import datetime, timedelta
import logging
import json
import io
import hashlib
import secrets

# PDF Processing Libraries
import sys
from pathlib import Path

# Add current directory to path so we can import sibling modules
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir))

# Try importing required libraries with proper error handling
HAS_PYMUPDF = False
HAS_PDF2IMAGE = False
HAS_PDF_EDITOR = False
HAS_REMBG = False
HAS_OPENCV = False
HAS_TESSERACT = False

# PyMuPDF for PDF manipulation
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
    logger_pdf = logging.getLogger(__name__)
    logger_pdf.info("PyMuPDF loaded successfully")
except ImportError as e:
    print(f"Warning: PyMuPDF not installed. PDF features will be disabled. Error: {e}")

# pdf2image for PDF to image conversion
try:
    from pdf2image import convert_from_path
    HAS_PDF2IMAGE = True
except ImportError as e:
    print(f"Warning: pdf2image not installed. PDF to Image features will be disabled. Error: {e}")

# PIL for image processing
try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError as e:
    print(f"Warning: PIL not installed. Image features will be disabled. Error: {e}")
    HAS_PIL = False

# rembg for background removal
try:
    import rembg
    HAS_REMBG = True
except ImportError as e:
    print(f"Warning: rembg not installed. Background removal will be disabled. Error: {e}")

# OpenCV for advanced image processing
try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError as e:
    print(f"Warning: OpenCV not installed. Advanced image features will be disabled. Error: {e}")

# pytesseract for OCR
try:
    import pytesseract
    HAS_TESSERACT = True
except ImportError as e:
    print(f"Warning: pytesseract not installed. OCR features will be disabled. Error: {e}")

# reportlab for PDF generation
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.utils import ImageReader
    HAS_REPORTLAB = True
except ImportError as e:
    print(f"Warning: reportlab not installed. PDF generation features will be disabled. Error: {e}")
    HAS_REPORTLAB = False

# Configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize AI Session for rembg (if available)
session = None
if HAS_REMBG:
    try:
        model_name = "isnet-general-use"
        session = rembg.new_session(model_name)
        logger.info(f"AI Model '{model_name}' initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize rembg session: {e}")

# Try to import PDF Editor
try:
    # Check if pdf_editor.py exists
    pdf_editor_path = current_dir / "pdf_editor.py"
    if pdf_editor_path.exists():
        sys.path.append(str(current_dir))
        from pdf_editor import PDFEditor
        pdf_editor = PDFEditor()
        HAS_PDF_EDITOR = True
        logger.info("PDF Editor loaded successfully")
    else:
        logger.warning(f"pdf_editor.py not found at {pdf_editor_path}")
        pdf_editor = None
except ImportError as e:
    logger.warning(f"PDF Editor not loaded: {e}")
    pdf_editor = None

app = FastAPI(
    title="RocketPDF PDF Conversion API",
    description="Complete PDF manipulation and conversion API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
UPLOAD_DIR = Path(tempfile.gettempdir()) / "rocketpdf_uploads"
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

# Cleanup old files on startup
def cleanup_old_files():
    """Remove files older than 1 hour"""
    try:
        now = datetime.now()
        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.is_file():
                file_age = now - datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_age > timedelta(hours=1):
                    file_path.unlink()
                    logger.info(f"Cleaned up old file: {file_path.name}")
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

# Helper Functions
async def save_upload_file(upload_file: UploadFile) -> Path:
    """Save uploaded file to temporary directory"""
    try:
        # Generate unique filename
        timestamp = datetime.now().timestamp()
        random_str = secrets.token_hex(8)
        safe_filename = f"{timestamp}_{random_str}_{upload_file.filename}"
        file_path = UPLOAD_DIR / safe_filename
        
        # Save file
        content = await upload_file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE/1024/1024}MB")
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"File saved: {file_path}")
        return file_path
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File save error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        await upload_file.close()

def validate_pdf(file_path: Path) -> bool:
    """Validate if file is a valid PDF"""
    if not HAS_PYMUPDF:
        # Basic validation: check file extension and magic bytes
        if file_path.suffix.lower() != '.pdf':
            return False
        with open(file_path, 'rb') as f:
            header = f.read(5)
            return header == b'%PDF-'
        
    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        doc.close()
        return page_count > 0
    except Exception as e:
        logger.error(f"PDF validation error: {e}")
        return False

# Data Models
from pydantic import BaseModel, Field

class TextExtractionRequest(BaseModel):
    file_id: str
    page: int = Field(..., ge=1, description="Page number (1-indexed)")

class TextEditRequest(BaseModel):
    file_id: str
    page: int = Field(..., ge=1, description="Page number (1-indexed)")
    modifications: List[dict]  # {bbox, text, style}

class PageModifications(BaseModel):
    page: int = Field(..., ge=1, description="Page number (1-indexed)")
    modifications: List[dict]

class BulkTextEditRequest(BaseModel):
    file_id: str
    changes: List[PageModifications]

class AddPageRequest(BaseModel):
    file_id: str

# ===== API ENDPOINTS =====

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RocketPDF PDF Conversion API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "running",
        "features": {
            "pdf_tools": HAS_PYMUPDF,
            "pdf_to_image": HAS_PDF2IMAGE,
            "background_remover": HAS_REMBG,
            "image_processing": HAS_PIL,
            "ocr": HAS_TESSERACT,
            "pdf_editor": HAS_PDF_EDITOR
        }
    }

@app.get("/api")
async def api_root():
    """API root endpoint"""
    return await root()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "OK",
        "modules": {
            "pymupdf": HAS_PYMUPDF,
            "pdf2image": HAS_PDF2IMAGE,
            "rembg": HAS_REMBG,
            "pil": HAS_PIL,
            "tesseract": HAS_TESSERACT,
            "pdf_editor": HAS_PDF_EDITOR
        }
    }

@app.post("/api/pdf-to-images")
async def pdf_to_images(
    file: UploadFile = File(...),
    format: str = Form("png"),
    dpi: int = Form(200)
):
    """
    Convert PDF pages to images
    
    Parameters:
    - file: PDF file to convert
    - format: Output format (png or jpg)
    - dpi: Image quality (default: 200)
    
    Returns: ZIP file containing all page images
    """
    if not HAS_PDF2IMAGE:
        raise HTTPException(
            status_code=501, 
            detail="PDF to image conversion is not available. Please install pdf2image library."
        )
    
    file_path = None
    output_dir = None
    
    try:
        # Save uploaded file
        file_path = await save_upload_file(file)
        
        # Validate PDF
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file")
        
        # Create output directory
        output_dir = UPLOAD_DIR / f"images_{datetime.now().timestamp()}"
        output_dir.mkdir(exist_ok=True)
        
        # Convert PDF to images
        images = convert_from_path(
            str(file_path),
            dpi=dpi,
            fmt=format.lower()
        )
        
        # Save images
        image_files = []
        for i, image in enumerate(images, 1):
            img_path = output_dir / f"page_{i}.{format.lower()}"
            image.save(str(img_path), format.upper())
            image_files.append(img_path)
        
        # Create ZIP file
        zip_path = UPLOAD_DIR / f"pdf_images_{datetime.now().timestamp()}"
        shutil.make_archive(str(zip_path), 'zip', output_dir)
        zip_file = Path(str(zip_path) + '.zip')
        
        return FileResponse(
            path=str(zip_file),
            filename=f"{Path(file.filename).stem}_images.zip",
            media_type="application/zip"
        )
        
    except Exception as e:
        logger.error(f"PDF to images error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Cleanup
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass
        if output_dir and output_dir.exists():
            try:
                shutil.rmtree(output_dir)
            except:
                pass

@app.post("/api/pdf-to-text")
async def pdf_to_text(
    file: UploadFile = File(...),
    use_ocr: bool = Form(False)
):
    """
    Extract text from PDF
    
    Parameters:
    - file: PDF file
    - use_ocr: Use OCR for scanned PDFs (default: False)
    
    Returns: JSON with extracted text
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF text extraction is not available. Please install PyMuPDF."
        )
    
    file_path = None
    
    try:
        file_path = await save_upload_file(file)
        
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        doc = fitz.open(file_path)
        text_content = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            # If no text and OCR enabled, use OCR
            if not text.strip() and use_ocr and HAS_TESSERACT:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img)
            
            text_content.append({
                "page": page_num + 1,
                "text": text
            })
        
        doc.close()
        
        return JSONResponse({
            "filename": file.filename,
            "total_pages": len(text_content),
            "pages": text_content,
            "full_text": "\n\n".join([p["text"] for p in text_content])
        })
        
    except Exception as e:
        logger.error(f"PDF to text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass

@app.post("/api/images-to-pdf")
async def images_to_pdf(
    files: List[UploadFile] = File(...),
    page_size: str = Form("A4")
):
    """
    Convert multiple images to a single PDF
    
    Parameters:
    - files: List of image files
    - page_size: PDF page size (A4 or Letter)
    
    Returns: PDF file
    """
    if not HAS_REPORTLAB:
        raise HTTPException(
            status_code=501,
            detail="PDF generation is not available. Please install reportlab."
        )
    
    image_paths = []
    output_path = None
    
    try:
        # Save all uploaded images
        for file in files:
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"Invalid image file: {file.filename}")
            image_paths.append(await save_upload_file(file))
        
        # Create PDF
        output_path = UPLOAD_DIR / f"images_to_pdf_{datetime.now().timestamp()}.pdf"
        
        # Determine page size
        ps = A4 if page_size.upper() == "A4" else letter
        
        c = canvas.Canvas(str(output_path), pagesize=ps)
        page_width, page_height = ps
        
        for img_path in image_paths:
            img = Image.open(img_path)
            
            # Calculate scaling to fit page
            img_width, img_height = img.size
            scale = min(page_width / img_width, page_height / img_height)
            
            new_width = img_width * scale
            new_height = img_height * scale
            
            # Center image on page
            x = (page_width - new_width) / 2
            y = (page_height - new_height) / 2
            
            c.drawImage(str(img_path), x, y, width=new_width, height=new_height)
            c.showPage()
        
        c.save()
        
        return FileResponse(
            path=str(output_path),
            filename="images_combined.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        logger.error(f"Images to PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        for img_path in image_paths:
            if img_path.exists():
                try:
                    img_path.unlink()
                except:
                    pass

@app.post("/api/compress-pdf")
async def compress_pdf(
    file: UploadFile = File(...),
    quality: str = Form("medium")
):
    """
    Compress PDF file
    
    Parameters:
    - file: PDF file
    - quality: Compression quality (low, medium, high)
    
    Returns: Compressed PDF
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF compression is not available. Please install PyMuPDF."
        )
    
    file_path = None
    output_path = None
    
    try:
        file_path = await save_upload_file(file)
        
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        doc = fitz.open(file_path)
        output_path = UPLOAD_DIR / f"compressed_{datetime.now().timestamp()}.pdf"
        
        # Compression settings based on quality
        quality_settings = {
            "low": {"garbage": 4, "deflate": True, "clean": True},
            "medium": {"garbage": 3, "deflate": True, "clean": True},
            "high": {"garbage": 2, "deflate": True, "clean": True}
        }
        
        settings = quality_settings.get(quality, quality_settings["medium"])
        
        # Save with compression
        doc.save(
            str(output_path),
            garbage=settings["garbage"],
            deflate=settings["deflate"],
            clean=settings["clean"]
        )
        doc.close()
        
        # Get file sizes
        original_size = file_path.stat().st_size
        compressed_size = output_path.stat().st_size
        reduction = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
        
        response = FileResponse(
            path=str(output_path),
            filename=f"compressed_{file.filename}",
            media_type="application/pdf"
        )
        
        # Add headers with file info
        response.headers["X-Original-Size"] = str(original_size)
        response.headers["X-Compressed-Size"] = str(compressed_size)
        response.headers["X-Reduction-Percent"] = f"{reduction:.2f}"
        
        return response
        
    except Exception as e:
        logger.error(f"Compress PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass

@app.post("/api/merge-pdfs")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    """
    Merge multiple PDF files into one
    
    Parameters:
    - files: List of PDF files to merge
    
    Returns: Merged PDF
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF merging is not available. Please install PyMuPDF."
        )
    
    file_paths = []
    output_path = None
    
    try:
        # Save all uploaded PDFs
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"Invalid PDF file: {file.filename}")
            path = await save_upload_file(file)
            if not validate_pdf(path):
                raise HTTPException(status_code=400, detail=f"Invalid or corrupted PDF: {file.filename}")
            file_paths.append(path)
        
        # Create merged PDF
        output_path = UPLOAD_DIR / f"merged_{datetime.now().timestamp()}.pdf"
        merged_doc = fitz.open()
        
        for pdf_path in file_paths:
            doc = fitz.open(pdf_path)
            merged_doc.insert_pdf(doc)
            doc.close()
        
        merged_doc.save(str(output_path))
        merged_doc.close()
        
        return FileResponse(
            path=str(output_path),
            filename="merged.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        logger.error(f"Merge PDFs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        for path in file_paths:
            if path.exists():
                try:
                    path.unlink()
                except:
                    pass

@app.post("/api/split-pdf")
async def split_pdf(
    file: UploadFile = File(...),
    pages: str = Form(...)
):
    """
    Split PDF or extract specific pages
    
    Parameters:
    - file: PDF file
    - pages: Page ranges (e.g., "1-3,5,7-9")
    
    Returns: ZIP with split PDFs
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF splitting is not available. Please install PyMuPDF."
        )
    
    file_path = None
    output_dir = None
    
    try:
        file_path = await save_upload_file(file)
        
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        doc = fitz.open(file_path)
        output_dir = UPLOAD_DIR / f"split_{datetime.now().timestamp()}"
        output_dir.mkdir(exist_ok=True)
        
        # Parse page ranges
        page_list = []
        for part in pages.split(','):
            part = part.strip()
            if '-' in part:
                start, end = map(int, part.split('-'))
                page_list.extend(range(start - 1, end))
            else:
                page_list.append(int(part) - 1)
        
        # Create individual PDFs
        for i, page_num in enumerate(page_list, 1):
            if 0 <= page_num < len(doc):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                new_doc.save(str(output_dir / f"page_{i}.pdf"))
                new_doc.close()
        
        doc.close()
        
        # Create ZIP
        zip_path = UPLOAD_DIR / f"split_pdf_{datetime.now().timestamp()}"
        shutil.make_archive(str(zip_path), 'zip', output_dir)
        zip_file = Path(str(zip_path) + '.zip')
        
        return FileResponse(
            path=str(zip_file),
            filename="split_pages.zip",
            media_type="application/zip"
        )
        
    except Exception as e:
        logger.error(f"Split PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass
        if output_dir and output_dir.exists():
            try:
                shutil.rmtree(output_dir)
            except:
                pass

@app.post("/api/rotate-pdf")
async def rotate_pdf(
    file: UploadFile = File(...),
    rotation: int = Form(90),
    pages: str = Form("all")
):
    """
    Rotate PDF pages
    
    Parameters:
    - file: PDF file
    - rotation: Rotation angle (90, 180, 270)
    - pages: Pages to rotate ("all" or "1,3,5")
    
    Returns: Rotated PDF
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF rotation is not available. Please install PyMuPDF."
        )
    
    file_path = None
    output_path = None
    
    try:
        file_path = await save_upload_file(file)
        
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        doc = fitz.open(file_path)
        output_path = UPLOAD_DIR / f"rotated_{datetime.now().timestamp()}.pdf"
        
        # Determine which pages to rotate
        if pages.lower() == "all":
            page_list = range(len(doc))
        else:
            page_list = [int(p.strip()) - 1 for p in pages.split(',')]
        
        # Rotate pages
        for page_num in page_list:
            if 0 <= page_num < len(doc):
                page = doc[page_num]
                page.set_rotation(rotation)
        
        doc.save(str(output_path))
        doc.close()
        
        return FileResponse(
            path=str(output_path),
            filename=f"rotated_{file.filename}",
            media_type="application/pdf"
        )
        
    except Exception as e:
        logger.error(f"Rotate PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass

@app.post("/api/watermark-pdf")
async def watermark_pdf(
    file: UploadFile = File(...),
    watermark_text: str = Form(...),
    opacity: float = Form(0.3),
    position: str = Form("center")
):
    """
    Add text watermark to PDF
    
    Parameters:
    - file: PDF file
    - watermark_text: Text to use as watermark
    - opacity: Watermark opacity (0.0 to 1.0)
    - position: Watermark position (center, diagonal)
    
    Returns: Watermarked PDF
    """
    if not HAS_PYMUPDF:
        raise HTTPException(
            status_code=501,
            detail="PDF watermarking is not available. Please install PyMuPDF."
        )
    
    file_path = None
    output_path = None
    
    try:
        file_path = await save_upload_file(file)
        
        if not validate_pdf(file_path):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        
        doc = fitz.open(file_path)
        output_path = UPLOAD_DIR / f"watermarked_{datetime.now().timestamp()}.pdf"
        
        # Normalize opacity
        opacity = max(0.0, min(1.0, opacity))
        
        for page in doc:
            rect = page.rect
            
            # Position calculation
            if position == "diagonal":
                point = fitz.Point(rect.width / 4, rect.height / 2)
                rotation = 45
            else:  # center
                point = fitz.Point(rect.width / 2, rect.height / 2)
                rotation = 0
            
            # Add watermark
            page.insert_text(
                point,
                watermark_text,
                fontsize=50,
                color=(0.5, 0.5, 0.5),
                opacity=opacity,
                rotate=rotation
            )
        
        doc.save(str(output_path))
        doc.close()
        
        return FileResponse(
            path=str(output_path),
            filename=f"watermarked_{file.filename}",
            media_type="application/pdf"
        )
        
    except Exception as e:
        logger.error(f"Watermark PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass

@app.post("/api/remove-background")
async def remove_background(
    file: UploadFile = File(...)
):
    """
    Remove background from an image using rembg
    
    Parameters:
    - file: Image file (JPG, PNG, etc.)
    
    Returns: PNG image with transparent background
    """
    if not HAS_REMBG:
        raise HTTPException(
            status_code=501,
            detail="Background removal is not available. Please install rembg."
        )
    
    try:
        # Read file content
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        # Open with PIL to validate
        try:
            input_image = Image.open(io.BytesIO(contents))
            input_image.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupt image file")

        # Re-open (verify() closes the stream)
        input_image = Image.open(io.BytesIO(contents)).convert("RGBA")

        # Remove background
        if session:
            output_image = rembg.remove(input_image, session=session)
        else:
            output_image = rembg.remove(input_image)

        # Encode result as PNG
        buf = io.BytesIO()
        output_image.save(buf, format="PNG")
        png_bytes = buf.getvalue()

        logger.info(f"Background removed from '{file.filename}'")
        return Response(content=png_bytes, media_type="image/png")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Background removal error: {e}")
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")

# ==================== IMAGE RESIZER ENDPOINTS ====================

@app.post("/api/image/resize")
async def image_resize(
    file: UploadFile = File(...),
    width: int = Form(0),
    height: int = Form(0),
    mode: str = Form("dimensions"),   # dimensions | percentage
    scale: float = Form(100.0),       # for percentage mode
    format: str = Form("jpeg"),       # jpeg | png | webp | gif | bmp
    quality: int = Form(85),          # 1-100 for lossy formats
    lock_ratio: bool = Form(True),
):
    """
    Resize an image using Pillow
    
    Parameters:
    - file: Image file
    - width: Target width (for dimensions mode)
    - height: Target height (for dimensions mode)
    - mode: resize mode (dimensions or percentage)
    - scale: Scale percentage (for percentage mode)
    - format: Output format
    - quality: Output quality (1-100)
    - lock_ratio: Maintain aspect ratio
    
    Returns: Resized image
    """
    if not HAS_PIL:
        raise HTTPException(
            status_code=501,
            detail="Image processing is not available. Please install Pillow."
        )
    
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = bg

        orig_w, orig_h = img.size

        # Calculate target size
        if mode == "percentage":
            factor = scale / 100.0
            new_w = max(1, int(orig_w * factor))
            new_h = max(1, int(orig_h * factor))
        else:  # dimensions
            new_w = width if width > 0 else orig_w
            new_h = height if height > 0 else orig_h
            
            if lock_ratio:
                if width > 0 and height == 0:
                    # Calculate height to maintain aspect ratio
                    ratio = width / orig_w
                    new_h = max(1, int(orig_h * ratio))
                elif height > 0 and width == 0:
                    # Calculate width to maintain aspect ratio
                    ratio = height / orig_h
                    new_w = max(1, int(orig_w * ratio))
                elif width > 0 and height > 0:
                    # Both dimensions specified, choose the one that fits
                    ratio_w = width / orig_w
                    ratio_h = height / orig_h
                    ratio = min(ratio_w, ratio_h)
                    new_w = max(1, int(orig_w * ratio))
                    new_h = max(1, int(orig_h * ratio))

        # Limit maximum size (8K)
        new_w = min(new_w, 7680)
        new_h = min(new_h, 4320)

        # Resize
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Save to memory
        buf = io.BytesIO()
        fmt_upper = format.upper()
        
        save_params = {}
        if fmt_upper in ('JPEG', 'JPG'):
            save_params = {'format': 'JPEG', 'quality': quality, 'optimize': True}
        elif fmt_upper == 'PNG':
            save_params = {'format': 'PNG', 'optimize': True}
        elif fmt_upper == 'WEBP':
            save_params = {'format': 'WEBP', 'quality': quality}
        elif fmt_upper == 'GIF':
            save_params = {'format': 'GIF'}
        elif fmt_upper == 'BMP':
            save_params = {'format': 'BMP'}
        else:
            save_params = {'format': 'JPEG', 'quality': quality}
        
        img.save(buf, **save_params)

        # Determine media type
        media_type = {
            'JPEG': 'image/jpeg',
            'JPG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp',
            'GIF': 'image/gif',
            'BMP': 'image/bmp'
        }.get(fmt_upper, 'image/jpeg')

        response = Response(content=buf.getvalue(), media_type=media_type)
        response.headers["X-Original-Width"] = str(orig_w)
        response.headers["X-Original-Height"] = str(orig_h)
        response.headers["X-New-Width"] = str(new_w)
        response.headers["X-New-Height"] = str(new_h)
        
        return response
        
    except Exception as e:
        logger.error(f"Image resize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

@app.post("/api/image/process")
async def image_process(
    file: UploadFile = File(...),
    format: str = Form("jpeg"),
    quality: int = Form(85),
    # Adjustments
    brightness: float = Form(1.0),    # 0.0–2.0
    contrast: float = Form(1.0),      # 0.0–2.0
    saturation: float = Form(1.0),    # 0.0–2.0
    sharpness: float = Form(1.0),     # 0.0–2.0
    blur: float = Form(0.0),          # 0–20 radius
    # Rotation / flip
    rotation: int = Form(0),          # 0, 90, 180, 270, -90
    flip_h: bool = Form(False),
    flip_v: bool = Form(False),
    # Filter
    filter_name: str = Form("none"),  # none|grayscale|sepia|invert|vintage
):
    """
    Apply adjustments and filters to an image using Pillow
    """
    if not HAS_PIL:
        raise HTTPException(
            status_code=501,
            detail="Image processing is not available. Please install Pillow."
        )
    
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        orig_mode = img.mode

        # Rotation
        if rotation != 0:
            img = img.rotate(-rotation, expand=True)

        # Flip
        if flip_h:
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if flip_v:
            img = img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

        # Convert to RGB for processing
        work = img.convert("RGB")

        # Brightness
        if brightness != 1.0:
            enhancer = ImageEnhance.Brightness(work)
            work = enhancer.enhance(brightness)
            
        # Contrast
        if contrast != 1.0:
            enhancer = ImageEnhance.Contrast(work)
            work = enhancer.enhance(contrast)
            
        # Saturation / Color
        if saturation != 1.0:
            enhancer = ImageEnhance.Color(work)
            work = enhancer.enhance(saturation)
            
        # Sharpness
        if sharpness != 1.0:
            enhancer = ImageEnhance.Sharpness(work)
            work = enhancer.enhance(sharpness)
            
        # Blur
        if blur > 0:
            work = work.filter(ImageFilter.GaussianBlur(radius=blur))

        # Named filters
        if filter_name == "grayscale":
            work = work.convert("L").convert("RGB")
        elif filter_name == "sepia":
            # Simple sepia filter
            pixels = list(work.getdata())
            new_pixels = []
            for r, g, b in pixels:
                tr = int(min(255, r * 0.393 + g * 0.769 + b * 0.189))
                tg = int(min(255, r * 0.349 + g * 0.686 + b * 0.168))
                tb = int(min(255, r * 0.272 + g * 0.534 + b * 0.131))
                new_pixels.append((tr, tg, tb))
            work = Image.new("RGB", work.size)
            work.putdata(new_pixels)
        elif filter_name == "invert":
            import PIL.ImageOps
            work = PIL.ImageOps.invert(work)
        elif filter_name == "vintage":
            # Simple vintage filter
            pixels = list(work.getdata())
            new_pixels = []
            for r, g, b in pixels:
                tr = int(min(255, r * 0.567 + g * 0.558 + b * 0.558))
                tg = int(min(255, r * 0.449 + g * 0.476 + b * 0.458))
                tb = int(min(255, r * 0.349 + g * 0.386 + b * 0.358))
                new_pixels.append((tr, tg, tb))
            work = Image.new("RGB", work.size)
            work.putdata(new_pixels)

        # Save
        buf = io.BytesIO()
        fmt_upper = format.upper()
        
        save_params = {}
        if fmt_upper in ('JPEG', 'JPG'):
            save_params = {'format': 'JPEG', 'quality': quality, 'optimize': True}
        elif fmt_upper == 'PNG':
            save_params = {'format': 'PNG', 'optimize': True}
        elif fmt_upper == 'WEBP':
            save_params = {'format': 'WEBP', 'quality': quality}
        elif fmt_upper == 'GIF':
            work = work.convert("P", palette=Image.Palette.ADAPTIVE)
            save_params = {'format': 'GIF'}
        elif fmt_upper == 'BMP':
            save_params = {'format': 'BMP'}
        else:
            save_params = {'format': 'JPEG', 'quality': quality}
        
        work.save(buf, **save_params)

        media_type = {
            'JPEG': 'image/jpeg',
            'JPG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp',
            'GIF': 'image/gif',
            'BMP': 'image/bmp'
        }.get(fmt_upper, 'image/jpeg')
        
        return Response(content=buf.getvalue(), media_type=media_type)

    except Exception as e:
        logger.error(f"Image process error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()


@app.post("/api/image/watermark")
async def image_watermark(
    file: UploadFile = File(...),
    format: str = Form("jpeg"),
    quality: int = Form(85),
    text: str = Form(""),
    font_size: int = Form(48),
    color: str = Form("#ffffff"),
    opacity: float = Form(0.5),       # 0.0–1.0
    position: str = Form("center"),   # tl|tr|center|bl|br
):
    """
    Apply a text watermark to an image using Pillow
    """
    if not HAS_PIL:
        raise HTTPException(
            status_code=501,
            detail="Image watermarking is not available. Please install Pillow."
        )
    
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGBA")

        # Create transparent overlay for the watermark
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Parse color (#rrggbb or #rgb)
        hex_c = color.lstrip("#")
        if len(hex_c) == 3:
            hex_c = "".join(c * 2 for c in hex_c)
        r, g, b = int(hex_c[0:2], 16), int(hex_c[2:4], 16), int(hex_c[4:6], 16)
        alpha = int(opacity * 255)

        # Try to load a font; fall back to default
        try:
            # Try common font paths
            font_paths = [
                "arial.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/System/Library/Fonts/Helvetica.ttc",
                "C:\\Windows\\Fonts\\Arial.ttf"
            ]
            font = None
            for font_path in font_paths:
                try:
                    font = ImageFont.truetype(font_path, font_size)
                    break
                except:
                    continue
            if font is None:
                font = ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()

        # Measure text
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        iw, ih = img.size
        pad = 20

        # Position mapping
        positions = {
            "tl": (pad, pad),
            "tr": (iw - tw - pad, pad),
            "center": ((iw - tw) // 2, (ih - th) // 2),
            "bl": (pad, ih - th - pad),
            "br": (iw - tw - pad, ih - th - pad),
        }
        x, y = positions.get(position, positions["center"])

        draw.text((x, y), text, font=font, fill=(r, g, b, alpha))

        # Composite
        result = Image.alpha_composite(img, overlay)

        # Save
        buf = io.BytesIO()
        fmt_upper = format.upper()
        
        if fmt_upper in ('JPEG', 'JPG', 'BMP'):
            result = result.convert("RGB")
            if fmt_upper in ('JPEG', 'JPG'):
                result.save(buf, format="JPEG", quality=quality, optimize=True)
            else:
                result.save(buf, format="BMP")
        elif fmt_upper == 'WEBP':
            result.save(buf, format="WEBP", quality=quality)
        elif fmt_upper == 'GIF':
            result.convert("P", palette=Image.Palette.ADAPTIVE).save(buf, format="GIF")
        else:  # PNG
            result.save(buf, format="PNG", optimize=True)

        media_type = {
            'JPEG': 'image/jpeg',
            'JPG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp',
            'GIF': 'image/gif',
            'BMP': 'image/bmp'
        }.get(fmt_upper, 'image/png')
        
        return Response(content=buf.getvalue(), media_type=media_type)

    except Exception as e:
        logger.error(f"Image watermark error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await file.close()

# ===== PDF EDITOR API ENDPOINTS =====

@app.post("/api/pdf/upload-session")
async def upload_session(file: UploadFile = File(...)):
    """Upload PDF for session-based editing"""
    try:
        file_path = await save_upload_file(file)
        return {
            "file_id": file_path.name,
            "message": "Upload successful",
            "expires_in": "1 hour"
        }
    except Exception as e:
        logger.error(f"Upload session error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/extract-text-styles")
async def extract_text_styles(request: TextExtractionRequest):
    """Extract text with style info from uploaded file"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
        
    file_path = UPLOAD_DIR / request.file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    try:
        # Extract text with styles (0-indexed page internally)
        data = pdf_editor.extract_text_with_styles(str(file_path), request.page - 1)
        return {
            "page": request.page,
            "text_data": data,
            "total_elements": len(data) if data else 0
        }
    except Exception as e:
        logger.error(f"Extract styles error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/edit-text")
async def edit_text_session(request: TextEditRequest):
    """Apply edits to PDF and return new file ID/URL"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / request.file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    try:
        # Apply modifications (0-indexed page internally)
        new_pdf_bytes = pdf_editor.modify_text(str(file_path), request.page - 1, request.modifications)
        
        # Save new file
        new_filename = f"edited_{datetime.now().timestamp()}_{request.file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
            
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": "Edit applied successfully"
        }
    except Exception as e:
        logger.error(f"Edit text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/edit-document-session")
async def edit_document_session(request: BulkTextEditRequest):
    """Apply edits to multiple pages of PDF and return new file ID/URL"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / request.file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    try:
        # Convert page numbers to 0-indexed
        pages_mods = {}
        for change in request.changes:
            page_idx = change.page - 1
            pages_mods[page_idx] = change.modifications
            
        # Apply modifications
        new_pdf_bytes = pdf_editor.modify_pages(str(file_path), pages_mods)
        
        # Save new file
        new_filename = f"edited_{datetime.now().timestamp()}_{request.file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
            
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": f"Edits applied to {len(pages_mods)} page(s)"
        }
    except Exception as e:
        logger.error(f"Edit document error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf/add-page")
async def add_page_endpoint(request: AddPageRequest):
    """Add a blank page to the PDF"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
        
    file_path = UPLOAD_DIR / request.file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
        
    try:
        new_pdf_bytes = pdf_editor.add_page(str(file_path))
        
        # Save new file
        new_filename = f"added_page_{datetime.now().timestamp()}_{request.file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
            
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": "Page added successfully"
        }
    except Exception as e:
        logger.error(f"Add page error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===== PDF EDITOR COMPREHENSIVE ENDPOINTS =====

@app.post("/api/pdf-editor/upload")
async def upload_pdf_for_editing(file: UploadFile = File(...)):
    """Upload PDF for comprehensive editing session"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    try:
        file_path = await save_upload_file(file)
        
        # Get page count
        page_count = 1
        if HAS_PYMUPDF:
            try:
                doc = fitz.open(file_path)
                page_count = len(doc)
                doc.close()
            except:
                pass
        
        return {
            "file_id": file_path.name,
            "message": "PDF uploaded successfully for editing",
            "total_pages": page_count,
            "expires_in": "1 hour"
        }
    except Exception as e:
        logger.error(f"Upload for editing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/extract-page-content")
async def extract_page_content(
    file_id: str = Form(...),
    page_number: int = Form(...)
):
    """Extract detailed content from a specific page"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        # Extract text with styles
        text_data = pdf_editor.extract_text_with_styles(str(file_path), page_number - 1)
        
        return {
            "page_number": page_number,
            "text_elements": text_data,
            "element_count": len(text_data) if text_data else 0,
            "message": "Page content extracted successfully"
        }
    except Exception as e:
        logger.error(f"Extract page content error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/modify-page")
async def modify_page_content(
    file_id: str = Form(...),
    page_number: int = Form(...),
    modifications: str = Form(...)  # JSON string
):
    """Apply modifications to a specific page"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        modifications_data = json.loads(modifications)
        
        # Apply modifications
        new_pdf_bytes = pdf_editor.modify_text(str(file_path), page_number - 1, modifications_data)
        
        # Save new file
        new_filename = f"modified_{datetime.now().timestamp()}_{file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
        
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": f"Page {page_number} modified successfully"
        }
    except Exception as e:
        logger.error(f"Modify page error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/add-text")
async def add_text_to_pdf(
    file_id: str = Form(...),
    page_number: int = Form(...),
    text: str = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    font_size: int = Form(12),
    font_name: str = Form("Helvetica"),
    color: str = Form("#000000")
):
    """Add text to PDF at specific position"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        # Parse color
        if color.startswith('#'):
            hex_c = color.lstrip("#")
            if len(hex_c) == 3:
                hex_c = "".join(c * 2 for c in hex_c)
            r, g, b = int(hex_c[0:2], 16), int(hex_c[2:4], 16), int(hex_c[4:6], 16)
            color_rgb = (r, g, b)
        else:
            color_rgb = (0, 0, 0)
        
        # Create text modification
        modifications = [{
            "type": "text",
            "text": text,
            "x": x,
            "y": y,
            "font_size": font_size,
            "font_name": font_name,
            "color": color_rgb
        }]
        
        # Apply modification
        new_pdf_bytes = pdf_editor.modify_text(str(file_path), page_number - 1, modifications)
        
        # Save new file
        new_filename = f"text_added_{datetime.now().timestamp()}_{file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
        
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": "Text added successfully"
        }
    except Exception as e:
        logger.error(f"Add text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/add-shape")
async def add_shape_to_pdf(
    file_id: str = Form(...),
    page_number: int = Form(...),
    shape_type: str = Form(...),  # rectangle, circle, line
    x1: float = Form(...),
    y1: float = Form(...),
    x2: float = Form(...),
    y2: float = Form(...),
    stroke_color: str = Form("#000000"),
    fill_color: str = Form("transparent"),
    stroke_width: int = Form(2)
):
    """Add shape to PDF"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        # Parse colors
        def parse_color(color_str):
            if color_str == "transparent":
                return None
            if color_str.startswith('#'):
                hex_c = color_str.lstrip("#")
                if len(hex_c) == 3:
                    hex_c = "".join(c * 2 for c in hex_c)
                return tuple(int(hex_c[i:i+2], 16) for i in (0, 2, 4))
            return (0, 0, 0)
        
        stroke_rgb = parse_color(stroke_color)
        fill_rgb = parse_color(fill_color)
        
        # Create shape modification
        modifications = [{
            "type": "shape",
            "shape_type": shape_type,
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "stroke_color": stroke_rgb,
            "fill_color": fill_rgb,
            "stroke_width": stroke_width
        }]
        
        # Apply modification
        new_pdf_bytes = pdf_editor.modify_text(str(file_path), page_number - 1, modifications)
        
        # Save new file
        new_filename = f"shape_added_{datetime.now().timestamp()}_{file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
        
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": f"{shape_type.capitalize()} added successfully"
        }
    except Exception as e:
        logger.error(f"Add shape error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/whiteout")
async def whiteout_area(
    file_id: str = Form(...),
    page_number: int = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    width: float = Form(...),
    height: float = Form(...)
):
    """Whiteout/cover area in PDF"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        # Create white rectangle to cover content
        modifications = [{
            "type": "shape",
            "shape_type": "rectangle",
            "x1": x,
            "y1": y,
            "x2": x + width,
            "y2": y + height,
            "fill_color": (255, 255, 255),
            "stroke_color": (255, 255, 255),
            "stroke_width": 1
        }]
        
        # Apply modification
        new_pdf_bytes = pdf_editor.modify_text(str(file_path), page_number - 1, modifications)
        
        # Save new file
        new_filename = f"whiteout_{datetime.now().timestamp()}_{file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
        
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": "Area whiteouted successfully"
        }
    except Exception as e:
        logger.error(f"Whiteout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pdf-editor/merge-edits")
async def merge_multiple_edits(
    file_id: str = Form(...),
    page_modifications: str = Form(...)  # JSON string of {page_num: [modifications]}
):
    """Apply multiple page modifications and return final PDF"""
    if not HAS_PDF_EDITOR or not pdf_editor:
        raise HTTPException(status_code=501, detail="PDF Editor not available")
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired")
    
    try:
        modifications_dict = json.loads(page_modifications)
        
        # Convert to 0-indexed page numbers
        pages_mods = {}
        for page_str, mods in modifications_dict.items():
            page_num = int(page_str) - 1
            pages_mods[page_num] = mods
        
        # Apply all modifications
        new_pdf_bytes = pdf_editor.modify_pages(str(file_path), pages_mods)
        
        # Save new file
        new_filename = f"edited_{datetime.now().timestamp()}_{file_id}"
        new_path = UPLOAD_DIR / new_filename
        
        with open(new_path, "wb") as f:
            f.write(new_pdf_bytes)
        
        return {
            "file_id": new_filename,
            "download_url": f"/api/pdf/download/{new_filename}",
            "message": f"All edits applied to {len(pages_mods)} page(s)"
        }
    except Exception as e:
        logger.error(f"Merge edits error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pdf/download/{file_id}")
async def download_file(file_id: str):
    """Download file by ID"""
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type
    ext = file_path.suffix.lower()
    media_type = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.zip': 'application/zip'
    }.get(ext, 'application/octet-stream')
    
    return FileResponse(
        path=str(file_path),
        filename=f"download_{file_id}",
        media_type=media_type
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run cleanup on startup"""
    cleanup_old_files()
    logger.info("RocketPDF PDF API started successfully")

# Scheduled cleanup task
@app.on_event("startup")
async def schedule_cleanup():
    """Schedule periodic cleanup"""
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(3600)  # 1 hour
            cleanup_old_files()
            logger.info("Periodic cleanup completed")
    
    asyncio.create_task(periodic_cleanup())

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    cleanup_old_files()
    logger.info("RocketPDF PDF API shutting down")

# Mount root directory for index.html and other assets (css, js, etc)
# This acts as a catch-all for static files in root, so it must be last
try:
    app.mount("/", StaticFiles(directory=".", html=True), name="root")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

if __name__ == "__main__":
    import uvicorn
    # Use Railway/System port
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting RocketPDF API server on {host}:{port}")
    logger.info(f"Documentation available at http://{host}:{port}/docs")
    
    uvicorn.run(
        "main:app",  # Assuming this file is named main.py
        host=host,
        port=port,
        log_level="info",
        reload=False  # Set to True for development
    )