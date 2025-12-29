# 🚀 Railway Deployment - Step by Step Guide

## Method 1: Deploy via Railway Dashboard (Recommended)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Sign up with GitHub (recommended) or Google

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. If not connected, click "Configure GitHub App"
4. Authorize Railway to access your repositories

### Step 3: Push Code to GitHub (If not already)

```bash
cd C:\Users\Admin\OneDrive\Pictures\Desktop\Rinvo\backend

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Backend for RINVO PDF tools"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/rinvo-backend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy on Railway
1. In Railway dashboard, select your repository
2. Railway will auto-detect Node.js
3. Click "Deploy"

### Step 5: Add Environment Variable
1. In Railway project, go to "Variables" tab
2. Click "New Variable"
3. Add:
   - **Variable:** `PDFCO_API_KEY`
   - **Value:** `yarmy653@gmail.com_hCxwjzQTIn6SzE7wWo7PIRciF7XmhFkazNdDFCAsTaigy1FpKmd8cxRcTIC0zy1j`
4. Click "Add"

### Step 6: Generate Domain
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. You'll get a URL like: `https://rinvo-backend-production.up.railway.app`

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

---

## Method 2: Deploy Without GitHub

### Option A: Use Railway CLI (Alternative)

If CLI doesn't work, try:
```bash
railway login --browserless
```

Then follow the token instructions.

### Option B: Deploy via Railway Template

1. Create a `railway.toml` file in backend folder:
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

2. Zip the backend folder
3. Upload to Railway via dashboard

---

## After Deployment: Update Frontend

### Get Your Railway URL
Example: `https://rinvo-backend-production.up.railway.app`

### Update These Files:

Replace `http://localhost:3000` with your Railway URL in:

1. **tools/pdf-to-word.html** (line ~125)
2. **tools/word-to-pdf.html** (line ~125)
3. **tools/pdf-to-excel.html** (line ~125)
4. **tools/excel-to-pdf.html** (line ~125)
5. **tools/pdf-to-powerpoint.html** (line ~125)
6. **tools/powerpoint-to-pdf.html** (line ~125)

**Find:**
```javascript
const response = await fetch('http://localhost:3000/api/pdf-to-word', {
```

**Replace with:**
```javascript
const response = await fetch('https://YOUR-RAILWAY-URL.railway.app/api/pdf-to-word', {
```

### Redeploy Frontend
```bash
firebase deploy --only hosting --project portfolio-5aafe
```

---

## Troubleshooting

### Issue: Build Failed
- Check logs in Railway dashboard
- Ensure `package.json` has all dependencies
- Verify Node.js version (18+)

### Issue: App Crashes
- Check environment variables are set
- View logs in Railway dashboard
- Ensure PORT is not hardcoded (Railway assigns it)

### Issue: 503 Error
- Wait a few minutes for deployment
- Check if service is running in Railway dashboard
- Restart the service

---

## Railway Free Tier

✅ $5 free credit per month
✅ 500 hours of usage
✅ Enough for this project
✅ No credit card required initially

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Get Railway URL
3. ✅ Update 6 frontend tool files
4. ✅ Redeploy to Firebase
5. ✅ Test all tools

**After this, all 12 tools will work perfectly!** 🎉
