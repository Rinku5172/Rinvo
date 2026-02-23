"""
PDF Editor Module - COMPLETE FIXED VERSION
Complete PDF editing functionality using PyPDF2, pdfplumber, and ReportLab
Handles text extraction, modification, and PDF generation
"""

import os
import io
import logging
from typing import List, Dict, Tuple, Optional, Any
from pathlib import Path
import json
import base64

# PDF Processing Libraries
try:
    import PyPDF2
    from PyPDF2 import PdfReader, PdfWriter, PdfMerger
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False
    print("Warning: PyPDF2 not installed")

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("Warning: pdfplumber not installed")

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.colors import Color, black, white, red, blue, green
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    print("Warning: ReportLab not installed")

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Warning: PIL not installed")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PDFEditor:
    """
    Complete PDF Editor with text extraction, modification, and generation capabilities
    """
    
    def __init__(self):
        self.supported_fonts = {
            'Arial': 'Helvetica',
            'Times New Roman': 'Times-Roman',
            'Courier': 'Courier',
            'Helvetica': 'Helvetica',
            'Times': 'Times-Roman',
            'Courier New': 'Courier',
            'Verdana': 'Helvetica',
            'Georgia': 'Times-Roman',
            'Comic Sans MS': 'Helvetica'
        }
        
        # Register custom fonts if available
        self._register_fonts()
        logger.info("PDF Editor initialized successfully")
    
    def _register_fonts(self):
        """Register available system fonts"""
        if not HAS_REPORTLAB:
            return
            
        try:
            # Try to register common system fonts
            font_paths = [
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',  # Linux
                '/System/Library/Fonts/Arial.ttf',  # macOS
                'C:/Windows/Fonts/arial.ttf',  # Windows
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            ]
            
            for font_path in font_paths:
                if os.path.exists(font_path):
                    try:
                        pdfmetrics.registerFont(TTFont('CustomArial', font_path))
                        self.supported_fonts['Arial'] = 'CustomArial'
                        logger.info(f"Registered font: {font_path}")
                        break
                    except Exception as e:
                        logger.warning(f"Failed to register font {font_path}: {e}")
                        continue
        except Exception as e:
            logger.warning(f"Font registration failed: {e}")
    
    def extract_text_with_styles(self, pdf_path: str, page_number: int) -> List[Dict[str, Any]]:
        """
        Extract text with positioning and styling information from a PDF page
        
        Args:
            pdf_path (str): Path to the PDF file
            page_number (int): Page number (0-indexed)
            
        Returns:
            List[Dict]: List of text elements with position, size, and style info
        """
        if not HAS_PDFPLUMBER:
            logger.error("pdfplumber is required for text extraction with styles")
            return []
        
        try:
            text_data = []
            
            with pdfplumber.open(pdf_path) as pdf:
                if page_number >= len(pdf.pages):
                    raise ValueError(f"Page {page_number} does not exist")
                
                page = pdf.pages[page_number]
                
                # Extract text with detailed positioning
                words = page.extract_words(
                    keep_blank_chars=False,
                    use_text_flow=False,
                    extra_attrs=['fontname', 'size']
                )
                
                for word in words:
                    text_data.append({
                        'text': word.get('text', ''),
                        'x0': word.get('x0', 0),
                        'y0': word.get('y0', 0),
                        'x1': word.get('x1', 0),
                        'y1': word.get('y1', 0),
                        'width': word.get('x1', 0) - word.get('x0', 0),
                        'height': word.get('y1', 0) - word.get('y0', 0),
                        'size': word.get('size', 12),
                        'fontname': word.get('fontname', 'Helvetica'),
                        'color': (0, 0, 0)  # pdfplumber doesn't extract color easily
                    })
            
            logger.info(f"Extracted {len(text_data)} text elements from page {page_number + 1}")
            return text_data
            
        except Exception as e:
            logger.error(f"Error extracting text with styles: {e}")
            return []
    
    def modify_text(self, pdf_path: str, page_number: int, modifications: List[Dict]) -> bytes:
        """
        Modify text on a specific page of a PDF
        
        Args:
            pdf_path (str): Path to the PDF file
            page_number (int): Page number (0-indexed)
            modifications (List[Dict]): List of text modifications
            
        Returns:
            bytes: Modified PDF as bytes
        """
        if not HAS_PYPDF2 or not HAS_REPORTLAB:
            raise ImportError("PyPDF2 and ReportLab are required for text modification")
        
        try:
            # Read original PDF
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                writer = PdfWriter()
                
                # Copy all pages
                for i, page in enumerate(reader.pages):
                    if i == page_number:
                        # Modify this page
                        modified_page = self._create_modified_page(page, modifications, reader)
                        writer.add_page(modified_page)
                    else:
                        # Keep original page
                        writer.add_page(page)
                
                # Write to bytes
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info(f"Modified page {page_number + 1} with {len(modifications)} changes")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error modifying text: {e}")
            raise
    
    def _create_modified_page(self, original_page, modifications: List[Dict], reader) -> Any:
        """
        Create a modified page with overlays
        """
        try:
            # Get page size
            media_box = original_page.mediabox
            width = float(media_box.width)
            height = float(media_box.height)
            
            # Create overlay PDF with modifications
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=(width, height))
            
            for mod in modifications:
                self._draw_modification(can, mod)
            
            can.save()
            
            # Merge original with overlay
            packet.seek(0)
            overlay_pdf = PdfReader(packet)
            overlay_page = overlay_pdf.pages[0]
            
            original_page.merge_page(overlay_page)
            return original_page
            
        except Exception as e:
            logger.error(f"Error creating modified page: {e}")
            return original_page
    
    def _draw_modification(self, canvas_obj, mod: Dict):
        """Draw a single modification on canvas"""
        try:
            mod_type = mod.get('type', 'text')
            
            if mod_type == 'text':
                text = mod.get('text', '')
                x = mod.get('x', 100)
                y = mod.get('y', 100)
                font_size = mod.get('font_size', 12)
                font_name = mod.get('font_name', 'Helvetica')
                color = mod.get('color', (0, 0, 0))
                
                # Map font
                pdf_font = self.supported_fonts.get(font_name, 'Helvetica')
                canvas_obj.setFont(pdf_font, font_size)
                
                # Set color
                if isinstance(color, (tuple, list)) and len(color) >= 3:
                    canvas_obj.setFillColorRGB(color[0]/255, color[1]/255, color[2]/255)
                
                canvas_obj.drawString(x, y, text)
                
            elif mod_type == 'shape':
                shape_type = mod.get('shape_type', 'rectangle')
                x1 = mod.get('x1', 0)
                y1 = mod.get('y1', 0)
                x2 = mod.get('x2', 100)
                y2 = mod.get('y2', 100)
                stroke_color = mod.get('stroke_color')
                fill_color = mod.get('fill_color')
                stroke_width = mod.get('stroke_width', 1)
                
                # Set line width
                canvas_obj.setLineWidth(stroke_width)
                
                # Set colors
                if fill_color and isinstance(fill_color, (tuple, list)) and len(fill_color) >= 3:
                    canvas_obj.setFillColorRGB(fill_color[0]/255, fill_color[1]/255, fill_color[2]/255)
                else:
                    canvas_obj.setFillColorRGB(1, 1, 1)  # White fill
                
                if stroke_color and isinstance(stroke_color, (tuple, list)) and len(stroke_color) >= 3:
                    canvas_obj.setStrokeColorRGB(stroke_color[0]/255, stroke_color[1]/255, stroke_color[2]/255)
                
                # Draw shape
                if shape_type == 'rectangle':
                    canvas_obj.rect(x1, y1, x2 - x1, y2 - y1, fill=1 if fill_color else 0, stroke=1)
                elif shape_type == 'circle':
                    radius = min(abs(x2 - x1), abs(y2 - y1)) / 2
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    canvas_obj.circle(center_x, center_y, radius, fill=1 if fill_color else 0, stroke=1)
                elif shape_type == 'line':
                    canvas_obj.line(x1, y1, x2, y2)
                    
        except Exception as e:
            logger.warning(f"Error drawing modification: {e}")
    
    def modify_pages(self, pdf_path: str, page_modifications: Dict[int, List[Dict]]) -> bytes:
        """
        Modify multiple pages of a PDF
        
        Args:
            pdf_path (str): Path to the PDF file
            page_modifications (Dict[int, List[Dict]]): Modifications by page number (0-indexed)
            
        Returns:
            bytes: Modified PDF as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for PDF modification")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                writer = PdfWriter()
                
                for i, page in enumerate(reader.pages):
                    if i in page_modifications:
                        # Apply modifications to this page
                        modified_page = self._create_modified_page(page, page_modifications[i], reader)
                        writer.add_page(modified_page)
                    else:
                        # Keep original page
                        writer.add_page(page)
                
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info(f"Modified {len(page_modifications)} pages")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error modifying pages: {e}")
            raise
    
    def add_page(self, pdf_path: str, page_size: Tuple[float, float] = A4) -> bytes:
        """
        Add a blank page to a PDF
        
        Args:
            pdf_path (str): Path to the PDF file
            page_size (Tuple): Page dimensions (width, height)
            
        Returns:
            bytes: PDF with added page as bytes
        """
        if not HAS_PYPDF2 or not HAS_REPORTLAB:
            raise ImportError("PyPDF2 and ReportLab are required for adding pages")
        
        try:
            # Create new blank page
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=page_size)
            can.save()
            
            # Read the blank page
            packet.seek(0)
            blank_pdf = PdfReader(packet)
            blank_page = blank_pdf.pages[0]
            
            # Read original PDF
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                writer = PdfWriter()
                
                # Copy existing pages
                for page in reader.pages:
                    writer.add_page(page)
                
                # Add blank page
                writer.add_page(blank_page)
                
                # Write to bytes
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info(f"Added blank page to PDF (total pages: {len(reader.pages) + 1})")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error adding page: {e}")
            raise
    
    def create_text_overlay(self, page_size: Tuple[float, float], text_elements: List[Dict]) -> bytes:
        """
        Create a PDF with text elements as overlay
        
        Args:
            page_size (Tuple): Page dimensions
            text_elements (List[Dict]): Text elements to add
            
        Returns:
            bytes: PDF overlay as bytes
        """
        if not HAS_REPORTLAB:
            raise ImportError("ReportLab is required for creating text overlays")
        
        try:
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=page_size)
            
            for element in text_elements:
                self._draw_text_element(can, element)
            
            can.save()
            
            # Convert to PDF bytes
            packet.seek(0)
            pdf_reader = PdfReader(packet)
            pdf_writer = PdfWriter()
            pdf_writer.add_page(pdf_reader.pages[0])
            
            output_buffer = io.BytesIO()
            pdf_writer.write(output_buffer)
            logger.info(f"Created text overlay with {len(text_elements)} elements")
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error creating text overlay: {e}")
            raise
    
    def _draw_text_element(self, canvas_obj, element: Dict):
        """Draw a single text element on canvas"""
        try:
            text = element.get('text', '')
            x = element.get('x', 0)
            y = element.get('y', 0)
            font_size = element.get('font_size', 12)
            font_name = element.get('font_name', 'Helvetica')
            color = element.get('color', (0, 0, 0))
            
            # Set font
            pdf_font = self.supported_fonts.get(font_name, 'Helvetica')
            canvas_obj.setFont(pdf_font, font_size)
            
            # Set color
            if isinstance(color, (tuple, list)) and len(color) >= 3:
                canvas_obj.setFillColorRGB(color[0]/255, color[1]/255, color[2]/255)
            
            # Draw text
            canvas_obj.drawString(x, y, text)
            
        except Exception as e:
            logger.warning(f"Error drawing text element: {e}")
    
    def merge_pdfs(self, pdf_paths: List[str]) -> bytes:
        """
        Merge multiple PDFs into one
        
        Args:
            pdf_paths (List[str]): List of PDF file paths
            
        Returns:
            bytes: Merged PDF as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for merging PDFs")
        
        try:
            merger = PdfMerger()
            
            for pdf_path in pdf_paths:
                merger.append(pdf_path)
            
            output_buffer = io.BytesIO()
            merger.write(output_buffer)
            merger.close()
            
            logger.info(f"Merged {len(pdf_paths)} PDFs")
            return output_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error merging PDFs: {e}")
            raise
    
    def split_pdf(self, pdf_path: str, page_ranges: List[Tuple[int, int]]) -> List[bytes]:
        """
        Split PDF into multiple parts based on page ranges
        
        Args:
            pdf_path (str): Path to the PDF file
            page_ranges (List[Tuple[int, int]]): List of (start, end) page ranges (0-indexed)
            
        Returns:
            List[bytes]: List of split PDF parts as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for splitting PDFs")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                pdf_parts = []
                
                for start_page, end_page in page_ranges:
                    writer = PdfWriter()
                    
                    # Add pages in range
                    for page_num in range(start_page, min(end_page + 1, len(reader.pages))):
                        writer.add_page(reader.pages[page_num])
                    
                    # Convert to bytes
                    output_buffer = io.BytesIO()
                    writer.write(output_buffer)
                    pdf_parts.append(output_buffer.getvalue())
                
                logger.info(f"Split PDF into {len(pdf_parts)} parts")
                return pdf_parts
                
        except Exception as e:
            logger.error(f"Error splitting PDF: {e}")
            raise
    
    def add_watermark(self, pdf_path: str, watermark_text: str, 
                     position: str = 'center', opacity: float = 0.3) -> bytes:
        """
        Add text watermark to PDF
        
        Args:
            pdf_path (str): Path to the PDF file
            watermark_text (str): Watermark text
            position (str): Position ('center', 'diagonal', 'top-left', etc.)
            opacity (float): Watermark opacity (0.0 to 1.0)
            
        Returns:
            bytes: Watermarked PDF as bytes
        """
        if not HAS_PYPDF2 or not HAS_REPORTLAB:
            raise ImportError("PyPDF2 and ReportLab are required for watermarking")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                
                # Create watermark for each page
                writer = PdfWriter()
                
                for page_num, page in enumerate(reader.pages):
                    # Get page size
                    media_box = page.mediabox
                    width = float(media_box.width)
                    height = float(media_box.height)
                    
                    # Create watermark PDF
                    packet = io.BytesIO()
                    can = canvas.Canvas(packet, pagesize=(width, height))
                    
                    # Set opacity
                    can.setFillAlpha(opacity)
                    can.setFont('Helvetica', 50)
                    
                    # Position watermark
                    if position == 'diagonal':
                        can.saveState()
                        can.translate(width/2, height/2)
                        can.rotate(45)
                        can.drawCentredString(0, 0, watermark_text)
                        can.restoreState()
                    elif position == 'center':
                        can.drawCentredString(width/2, height/2, watermark_text)
                    elif position == 'top-left':
                        can.drawString(50, height - 100, watermark_text)
                    elif position == 'top-right':
                        can.drawString(width - 300, height - 100, watermark_text)
                    elif position == 'bottom-left':
                        can.drawString(50, 50, watermark_text)
                    elif position == 'bottom-right':
                        can.drawString(width - 300, 50, watermark_text)
                    
                    can.save()
                    
                    # Merge watermark with page
                    packet.seek(0)
                    watermark_pdf = PdfReader(packet)
                    watermark_page = watermark_pdf.pages[0]
                    
                    page.merge_page(watermark_page)
                    writer.add_page(page)
                
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info(f"Added watermark '{watermark_text}' to PDF")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error adding watermark: {e}")
            raise
    
    def compress_pdf(self, pdf_path: str, quality: str = 'medium') -> bytes:
        """
        Compress PDF file
        
        Args:
            pdf_path (str): Path to the PDF file
            quality (str): Compression quality ('low', 'medium', 'high')
            
        Returns:
            bytes: Compressed PDF as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for PDF compression")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                writer = PdfWriter()
                
                # Copy pages
                for page in reader.pages:
                    writer.add_page(page)
                
                # Apply compression
                output_buffer = io.BytesIO()
                
                # PyPDF2 doesn't have great compression options,
                # but we can try to compress content streams
                if hasattr(writer, 'compress'):
                    writer.compress = True
                
                writer.write(output_buffer)
                logger.info(f"Compressed PDF with quality: {quality}")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error compressing PDF: {e}")
            raise
    
    def encrypt_pdf(self, pdf_path: str, user_password: str = "", 
                   owner_password: str = "", permissions: int = -4) -> bytes:
        """
        Encrypt PDF with password protection
        
        Args:
            pdf_path (str): Path to the PDF file
            user_password (str): User password for opening
            owner_password (str): Owner password for permissions
            permissions (int): Permission flags
            
        Returns:
            bytes: Encrypted PDF as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for PDF encryption")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                writer = PdfWriter()
                
                # Copy pages
                for page in reader.pages:
                    writer.add_page(page)
                
                # Encrypt
                writer.encrypt(
                    user_password=user_password,
                    owner_password=owner_password,
                    permissions_flag=permissions
                )
                
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info("PDF encrypted successfully")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error encrypting PDF: {e}")
            raise
    
    def decrypt_pdf(self, pdf_path: str, password: str = "") -> bytes:
        """
        Decrypt password-protected PDF
        
        Args:
            pdf_path (str): Path to the PDF file
            password (str): Password to decrypt
            
        Returns:
            bytes: Decrypted PDF as bytes
        """
        if not HAS_PYPDF2:
            raise ImportError("PyPDF2 is required for PDF decryption")
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                
                # Check if encrypted
                if reader.is_encrypted:
                    reader.decrypt(password)
                
                writer = PdfWriter()
                
                # Copy pages
                for page in reader.pages:
                    writer.add_page(page)
                
                output_buffer = io.BytesIO()
                writer.write(output_buffer)
                logger.info("PDF decrypted successfully")
                return output_buffer.getvalue()
                
        except Exception as e:
            logger.error(f"Error decrypting PDF: {e}")
            raise

# Example usage and testing
if __name__ == "__main__":
    editor = PDFEditor()
    
    # Test if libraries are available
    print(f"PyPDF2 available: {HAS_PYPDF2}")
    print(f"pdfplumber available: {HAS_PDFPLUMBER}")
    print(f"ReportLab available: {HAS_REPORTLAB}")
    print(f"PIL available: {HAS_PIL}")
    
    # List supported fonts
    print(f"Supported fonts: {list(editor.supported_fonts.keys())}")
    
    # Create a test PDF if needed
    if HAS_REPORTLAB:
        test_pdf = io.BytesIO()
        c = canvas.Canvas(test_pdf, pagesize=A4)
        c.drawString(100, 500, "Test PDF for RocketPDF Editor")
        c.save()
        print("✓ Can create PDF with ReportLab")