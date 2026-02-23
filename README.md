# RocketPDF - Smart Online PDF Tools

![RocketPDF Logo](https://img.shields.io/badge/RocketPDF-PDF%20Tools-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo

**Frontend:** https://portfolio-5aafe.web.app

## 📋 Features

### Client-Side Tools (4) - Fully Working ✅
1. **Image to PDF** - Convert JPG, PNG to PDF
2. **Organize PDFs**: Merge, Split, Rotate, Extract Pages.
3. **Compress PDF** - Reduce PDF file size
4. **Sign PDF** - Add signature to PDF

### Backend-Powered Tools (6) - Requires Server 🔧
7. **PDF to Word** - Convert PDF to DOCX
8. **Word to PDF** - Convert DOCX to PDF
9. **PDF to Excel** - Convert PDF to XLSX
10. **Excel to PDF** - Convert XLSX to PDF
11. **PDF to PowerPoint** - Convert PDF to PPTX
12. **PowerPoint to PDF** - Convert PPTX to PDF

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Firebase Hosting
- Font Awesome Icons
- PDF.js, pdf-lib, jsPDF

### Backend
- Node.js + Express
- PDF.co API
- Multer (file uploads)
- Axios (HTTP requests)

## 📦 Installation

### Frontend Only (6 Tools)
```bash
# Clone repository
git clone https://github.com/Rinkuyadav1600/RocketPDF.git
cd RocketPDF

# Deploy to Firebase
firebase deploy --only hosting
```

### Full Setup (All 12 Tools)

#### 1. Backend Setup
```bash
cd backend
npm install
```

#### 2. Configure PDF.co API Key
Get free API key from https://pdf.co

**Option A: Environment Variable**
```bash
# Windows
set PDFCO_API_KEY=your_api_key_here

# Linux/Mac
export PDFCO_API_KEY=your_api_key_here
```

**Option B: Edit server.js**
Replace `YOUR_API_KEY_HERE` with your actual API key

#### 3. Run Backend Locally
```bash
npm start
# Server runs on http://localhost:3000
```

#### 4. Deploy Backend to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up

# Set environment variable in Railway dashboard
PDFCO_API_KEY=your_api_key_here
```

#### 5. Update Frontend
Replace `http://localhost:3000` with your Railway URL in:
- `tools/pdf-to-word.html`
- `tools/word-to-pdf.html`
- `tools/pdf-to-excel.html`
- `tools/excel-to-pdf.html`
- `tools/pdf-to-powerpoint.html`
- `tools/powerpoint-to-pdf.html`

#### 6. Deploy Frontend
```bash
firebase deploy --only hosting --project portfolio-5aafe
```

## 🌐 Deployment

### Frontend (Firebase Hosting)
- **Status:** ✅ Deployed
- **URL:** https://portfolio-5aafe.web.app
- **Console:** https://console.firebase.google.com/project/portfolio-5aafe

### Backend (Railway)
- **Status:** ⏳ Pending
- **Guide:** See `backend/RAILWAY_DEPLOY.md`

## 📁 Project Structure

```
RocketPDF/
├── index.html              # Main landing page
├── 404.html                # Custom error page
├── css/
│   └── style.css          # Premium styling
├── js/
│   ├── main.js            # Main functionality
│   ├── config.js          # API configuration
│   └── api-config.js      # Centralized API config
├── tools/                 # All 12 PDF tools
│   ├── image-to-pdf.html
│   ├── merge-pdf.html
│   ├── split-pdf.html
│   ├── compress-pdf.html
│   ├── pdf-editor.html
│   ├── sign-pdf.html
│   ├── pdf-to-word.html
│   ├── word-to-pdf.html
│   ├── pdf-to-excel.html
│   ├── excel-to-pdf.html
│   ├── pdf-to-powerpoint.html
│   └── powerpoint-to-pdf.html
├── backend/               # Express server
│   ├── server.js
│   ├── package.json
│   ├── README.md
│   └── RAILWAY_DEPLOY.md
└── firebase.json          # Firebase config
```

## 🔑 API Keys

### PDF.co API
- **Free Tier:** 100 calls/month
- **Sign up:** https://pdf.co
- **Documentation:** https://apidocs.pdf.co

### Firebase
- **Project:** portfolio-5aafe
- **Hosting:** Enabled
- **Analytics:** Enabled

## CI / Deployment (GitHub + Firebase)

1. Push this repo to GitHub (create repo and set `main` branch):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/RocketPDF.git
git push -u origin main
```

2. Generate a CI token locally and add as GitHub secret named `FIREBASE_TOKEN`:

```bash
npx firebase-tools login:ci
# copy the token and add it to GitHub -> Settings -> Secrets -> FIREBASE_TOKEN
```

3. On push to `main`, GitHub Actions will deploy the site to Firebase Hosting (project `portfolio-5aafe`).

4. Manual deploy (local):

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only hosting --project portfolio-5aafe
```

Security: never commit `.env` or service-account JSON files. Use GitHub Secrets for CI.

## 📱 Social Media

- **Instagram:** [@rinku__y7275](https://www.instagram.com/rinku__y7275)
- **LinkedIn:** [Rinku Yadav](https://www.linkedin.com/in/rinku-yadav-6ba755330)
- **Facebook:** [Profile](https://www.facebook.com/share/1BduDXvL6n/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- PDF.co for conversion API
- Firebase for hosting
- Font Awesome for icons
- pdf-lib, jsPDF for client-side PDF operations

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/Rinkuyadav1600/RocketPDF/issues
- Email: yarmy653@gmail.com

---

Made with ❤️ by Rinku Yadav