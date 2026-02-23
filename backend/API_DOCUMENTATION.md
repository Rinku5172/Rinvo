# RocketPDF PDF Conversion API Documentation

## 🚀 Overview

Complete REST API for PDF manipulation and conversion built with FastAPI. Supports PDF to image conversion, text extraction with OCR, image to PDF conversion, compression, merging, splitting, rotation, and watermarking.

**Base URL**: `http://localhost:8000` (development) or your deployed URL

**Interactive Documentation**: Visit `/docs` for Swagger UI or `/redoc` for ReDoc

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Examples](#examples)

---

## 🏁 Getting Started

### Installation

```bash
# Clone repository
cd backend

# Install dependencies
pip install -r requirements.txt

# Install system dependencies (Ubuntu/Debian)
sudo apt-get install poppler-utils tesseract-ocr

# Run server
python api_server.py
```

### Docker Deployment

```bash
# Build image
docker build -t rocketpdf-api .

# Run container
docker run -p 8000:8000 rocketpdf-api
```

---

## 🔐 Authentication

Currently, the API is open and does not require authentication. For production deployment, consider adding API key authentication.

---

## 📡 Endpoints

### 1. Health Check

**GET** `/api/health`

Check API status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T22:00:00",
  "upload_dir": "/tmp/rocketpdf_uploads",
  "max_file_size_mb": 50
}
```

---

### 2. PDF to Images

**POST** `/api/pdf-to-images`

Convert PDF pages to individual images.

**Parameters:**
- `file` (file, required): PDF file
- `format` (string, optional): Output format - `png` or `jpg` (default: `png`)
- `dpi` (integer, optional): Image quality (default: `200`)

**Response:** ZIP file containing all page images

**Example (cURL):**
```bash
curl -X POST http://localhost:8000/api/pdf-to-images \
  -F "file=@document.pdf" \
  -F "format=png" \
  -F "dpi=300" \
  -o images.zip
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('format', 'png');
formData.append('dpi', '200');

const response = await fetch('http://localhost:8000/api/pdf-to-images', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
// Download or process the ZIP file
```

---

### 3. PDF to Text

**POST** `/api/pdf-to-text`

Extract text from PDF with optional OCR support.

**Parameters:**
- `file` (file, required): PDF file
- `use_ocr` (boolean, optional): Enable OCR for scanned PDFs (default: `false`)

**Response:**
```json
{
  "filename": "document.pdf",
  "total_pages": 5,
  "pages": [
    {
      "page": 1,
      "text": "Extracted text from page 1..."
    }
  ],
  "full_text": "Complete extracted text..."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/pdf-to-text \
  -F "file=@document.pdf" \
  -F "use_ocr=true"
```

---

### 4. Images to PDF

**POST** `/api/images-to-pdf`

Convert multiple images into a single PDF.

**Parameters:**
- `files` (files, required): Multiple image files
- `page_size` (string, optional): `A4` or `Letter` (default: `A4`)

**Response:** PDF file

**Example:**
```bash
curl -X POST http://localhost:8000/api/images-to-pdf \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "files=@image3.jpg" \
  -F "page_size=A4" \
  -o combined.pdf
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
imageFiles.forEach(file => {
  formData.append('files', file);
});
formData.append('page_size', 'A4');

const response = await fetch('http://localhost:8000/api/images-to-pdf', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
```

---

### 5. Compress PDF

**POST** `/api/compress-pdf`

Reduce PDF file size while maintaining quality.

**Parameters:**
- `file` (file, required): PDF file
- `quality` (string, optional): `low`, `medium`, or `high` (default: `medium`)

**Response:** Compressed PDF with headers showing compression stats

**Response Headers:**
- `X-Original-Size`: Original file size in bytes
- `X-Compressed-Size`: Compressed file size in bytes
- `X-Reduction-Percent`: Percentage reduction

**Example:**
```bash
curl -X POST http://localhost:8000/api/compress-pdf \
  -F "file=@large.pdf" \
  -F "quality=medium" \
  -o compressed.pdf -v
```

---

### 6. Merge PDFs

**POST** `/api/merge-pdfs`

Combine multiple PDF files into one.

**Parameters:**
- `files` (files, required): Multiple PDF files

**Response:** Merged PDF file

**Example:**
```bash
curl -X POST http://localhost:8000/api/merge-pdfs \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf" \
  -F "files=@file3.pdf" \
  -o merged.pdf
```

---

### 7. Split PDF

**POST** `/api/split-pdf`

Extract specific pages or split PDF into multiple files.

**Parameters:**
- `file` (file, required): PDF file
- `pages` (string, required): Page ranges (e.g., `1-3,5,7-9`)

**Response:** ZIP file with extracted pages

**Example:**
```bash
curl -X POST http://localhost:8000/api/split-pdf \
  -F "file=@document.pdf" \
  -F "pages=1-3,5,7-9" \
  -o split_pages.zip
```

---

### 8. Rotate PDF

**POST** `/api/rotate-pdf`

Rotate PDF pages by specified angle.

**Parameters:**
- `file` (file, required): PDF file
- `rotation` (integer, optional): Rotation angle - `90`, `180`, or `270` (default: `90`)
- `pages` (string, optional): Pages to rotate - `all` or `1,3,5` (default: `all`)

**Response:** Rotated PDF file

**Example:**
```bash
curl -X POST http://localhost:8000/api/rotate-pdf \
  -F "file=@document.pdf" \
  -F "rotation=90" \
  -F "pages=all" \
  -o rotated.pdf
```

---

### 9. Watermark PDF

**POST** `/api/watermark-pdf`

Add text watermark to PDF pages.

**Parameters:**
- `file` (file, required): PDF file
- `watermark_text` (string, required): Watermark text
- `opacity` (float, optional): Opacity 0.0 to 1.0 (default: `0.3`)
- `position` (string, optional): `center` or `diagonal` (default: `center`)

**Response:** Watermarked PDF file

**Example:**
```bash
curl -X POST http://localhost:8000/api/watermark-pdf \
  -F "file=@document.pdf" \
  -F "watermark_text=CONFIDENTIAL" \
  -F "opacity=0.3" \
  -F "position=diagonal" \
  -o watermarked.pdf
```

---

## ⚠️ Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input (e.g., invalid PDF, missing parameters)
- `500 Internal Server Error`: Server error during processing

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## 🔄 Rate Limits

Currently no rate limits are enforced. For production deployment, consider implementing rate limiting using middleware.

---

## 💡 Usage Examples

### Complete Workflow Example

```javascript
// 1. Convert PDF to images
async function convertPdfToImages(pdfFile) {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('format', 'png');
  formData.append('dpi', '300');
  
  const response = await fetch('http://localhost:8000/api/pdf-to-images', {
    method: 'POST',
    body: formData
  });
  
  return await response.blob();
}

// 2. Extract text with OCR
async function extractText(pdfFile) {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('use_ocr', 'true');
  
  const response = await fetch('http://localhost:8000/api/pdf-to-text', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// 3. Compress PDF
async function compressPdf(pdfFile, quality = 'medium') {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('quality', quality);
  
  const response = await fetch('http://localhost:8000/api/compress-pdf', {
    method: 'POST',
    body: formData
  });
  
  // Get compression stats from headers
  const originalSize = response.headers.get('X-Original-Size');
  const compressedSize = response.headers.get('X-Compressed-Size');
  const reduction = response.headers.get('X-Reduction-Percent');
  
  console.log(`Reduced by ${reduction}%`);
  
  return await response.blob();
}

// 4. Merge multiple PDFs
async function mergePdfs(pdfFiles) {
  const formData = new FormData();
  pdfFiles.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('http://localhost:8000/api/merge-pdfs', {
    method: 'POST',
    body: formData
  });
  
  return await response.blob();
}
```

---

## 🚀 Deployment

### Environment Variables

- `PORT`: Server port (default: 8000)
- `MAX_FILE_SIZE`: Maximum upload size in bytes (default: 52428800)
- `UPLOAD_DIR`: Temporary file directory (default: /tmp/rocketpdf_uploads)

### Production Considerations

1. **Add Authentication**: Implement API key or JWT authentication
2. **Rate Limiting**: Use middleware to prevent abuse
3. **CORS**: Configure allowed origins for your frontend domain
4. **File Cleanup**: Automatic cleanup runs every hour
5. **Monitoring**: Add logging and monitoring tools
6. **HTTPS**: Always use HTTPS in production

---

## 📞 Support

For issues or questions:
- GitHub: [Your Repository]
- Email: support@RocketPDF.com
- Documentation: https://RocketPDF.web.app/docs

---

## 📄 License

MIT License - See LICENSE file for details
