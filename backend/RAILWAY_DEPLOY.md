# Railway Deployment Guide for RINVO Backend

## Quick Deploy to Railway

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser. Sign in with:
- GitHub
- Google
- Or Email

### Step 3: Initialize Project

```bash
cd backend
railway init
```

Choose:
- Create new project: Yes
- Project name: rinvo-backend

### Step 4: Add Environment Variable

```bash
railway variables set PDFCO_API_KEY=yarmy653@gmail.com_hCxwjzQTIn6SzE7wWo7PIRciF7XmhFkazNdDFCAsTaigy1FpKmd8cxRcTIC0zy1j
```

### Step 5: Deploy

```bash
railway up
```

### Step 6: Get Your URL

```bash
railway domain
```

This will give you a URL like: `https://rinvo-backend.up.railway.app`

### Step 7: Test Your Backend

Visit: `https://your-url.railway.app/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "RINVO Backend Server with PDF.co API",
  "apiKeyConfigured": true
}
```

## Alternative: Deploy via Railway Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your repository
6. Add environment variable:
   - Key: `PDFCO_API_KEY`
   - Value: `yarmy653@gmail.com_hCxwjzQTIn6SzE7wWo7PIRciF7XmhFkazNdDFCAsTaigy1FpKmd8cxRcTIC0zy1j`
7. Deploy!

## After Deployment

### Update Frontend Files

Replace `http://localhost:3000` with your Railway URL in these files:

1. `tools/pdf-to-word.html` (line 125)
2. `tools/word-to-pdf.html` (line 125)
3. `tools/pdf-to-excel.html` (line 125)
4. `tools/excel-to-pdf.html` (line 125)
5. `tools/pdf-to-powerpoint.html` (line 125)
6. `tools/powerpoint-to-pdf.html` (line 125)

Example:
```javascript
// Before
const response = await fetch('http://localhost:3000/api/pdf-to-word', {

// After
const response = await fetch('https://rinvo-backend.up.railway.app/api/pdf-to-word', {
```

### Redeploy Frontend

```bash
firebase deploy --only hosting --project portfolio-5aafe
```

## Railway Free Tier

- $5 free credit per month
- 500 hours of usage
- Perfect for this project
- No credit card required initially

## Troubleshooting

### Check Logs
```bash
railway logs
```

### Check Status
```bash
railway status
```

### Restart Service
```bash
railway restart
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
