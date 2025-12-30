# RINVO Backend Server with PDF.co API

Backend server for RINVO PDF conversion tools using PDF.co API.

## Features

- PDF to Word conversion
- Word to PDF conversion
- PDF to Excel conversion
- Excel to PDF conversion
- PDF to PowerPoint conversion
- PowerPoint to PDF conversion

## Setup

### 1. Get PDF.co API Key

1. Visit https://pdf.co
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 100 API calls per month

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure API Key

**Option A: Environment Variable (Recommended)**
```bash
# Windows
set PDFCO_API_KEY=your_api_key_here

# Linux/Mac
export PDFCO_API_KEY=your_api_key_here
```

**Option B: Edit server.js**
Replace `YOUR_API_KEY_HERE` with your actual API key in `server.js`:
```javascript
const PDFCO_API_KEY = process.env.PDFCO_API_KEY || 'your_actual_api_key';
```

### 4. Run Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

All endpoints accept `multipart/form-data` with a `file` field.

### PDF to Word
```
POST /api/pdf-to-word
```

### Word to PDF
```
POST /api/word-to-pdf
```

### PDF to Excel
```
POST /api/pdf-to-excel
```

### Excel to PDF
```
POST /api/excel-to-pdf
```

### PDF to PowerPoint
```
POST /api/pdf-to-ppt
```

### PowerPoint to PDF
```
POST /api/ppt-to-pdf
```

### Health Check
```
GET /api/health
```

## PDF.co API Features

- High-quality conversions
- Fast processing
- Supports multiple formats
- Free tier available
- No credit card required for trial

## Deployment

### Heroku
```bash
heroku create rinvo-backend
heroku config:set PDFCO_API_KEY=your_api_key
git push heroku main
```

### Railway
```bash
railway init
railway add
railway up
# Set PDFCO_API_KEY in Railway dashboard
```

### Notes

- This project loads environment variables from a local `.env` file when present (using `dotenv`).
- For local development, copy `.env.example` to `.env` and add your `PDFCO_API_KEY`.
- Do NOT commit `.env` to public repositories if using a real API key.
### Render
1. Connect GitHub repository
2. Set environment variable: `PDFCO_API_KEY`
3. Deploy

## Environment Variables

- `PORT` - Server port (default: 3000)
- `PDFCO_API_KEY` - Your PDF.co API key (required)

## File Limits

- Maximum file size: 50MB
- Files are automatically deleted after 1 minute
- Old files (>1 hour) are cleaned up hourly

## Error Handling

The API returns JSON error responses:
```json
{
  "error": "Error message here"
}
```

## Security

- CORS enabled for all origins (configure for production)
- Files stored temporarily
- Automatic cleanup
- API key required for PDF.co

## Support

- PDF.co Documentation: https://apidocs.pdf.co
- PDF.co Support: https://pdf.co/support
