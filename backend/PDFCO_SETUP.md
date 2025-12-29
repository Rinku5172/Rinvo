# PDF.co API Setup Guide

## Get Your Free API Key

1. **Visit PDF.co**
   - Go to https://pdf.co
   - Click "Sign Up" or "Get API Key"

2. **Create Account**
   - Sign up with your email
   - Verify your email address

3. **Get API Key**
   - Login to your dashboard
   - Navigate to "API Keys" section
   - Copy your API key

4. **Free Tier Limits**
   - 100 API calls per month
   - No credit card required
   - Perfect for testing

## Configure Backend

### Windows:
```cmd
set PDFCO_API_KEY=your_api_key_here
cd backend
npm start
```

### Linux/Mac:
```bash
export PDFCO_API_KEY=your_api_key_here
cd backend
npm start
```

### Or edit server.js directly:
Replace line 14:
```javascript
const PDFCO_API_KEY = process.env.PDFCO_API_KEY || 'paste_your_api_key_here';
```

## Test the API

Visit: http://localhost:3000/api/health

Should show:
```json
{
  "status": "OK",
  "message": "RINVO Backend Server with PDF.co API",
  "apiKeyConfigured": true
}
```

## Supported Conversions

✅ PDF to Word (.docx)
✅ Word to PDF
✅ PDF to Excel (.xlsx)
✅ Excel to PDF
✅ PDF to PowerPoint (.pptx)
✅ PowerPoint to PDF

All conversions are high-quality and production-ready!
