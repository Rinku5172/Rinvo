# RocketPDF - Smart Online PDF & Image Tools

RocketPDF is a premium, unified document processing suite. It combines the speed of client-side processing with the power of Python-based AI tools, all managed through a single Node.js backend.

## 🚀 Unified Performance
- **Single Port Access**: The entire application (Frontend, Backend, and AI Services) runs on a single port (**3001**).
- **Automated Service Management**: Node.js automatically starts and manages the Python background processes.
- **Modern UI**: Full dark mode support, glassmorphism design, and smooth GSAP animations.

## 📋 Features (All Integrated ✅)
1.  **PDF Manipulation**: Merge, Split, Rotate, Compress, Unlock, Lock, Reverse, PDF Metadata, PDF Flatten.
2.  **PDF Conversion**: PDF to Word, Word to PDF, PDF to Excel, Excel to PDF, PDF to PPT, PPT to PDF.
3.  **Image Processing**: Background Remover (AI), Smart Image Resizer, Image to PDF, PDF to Image.
4.  **Generation**: QR Code Generator, Barcode Generator.
5.  **Bonus**: PDF OCR, PDF to Text, PDF Repair, PDF Editor.

## 🛠️ Tech Stack
- **Web Server**: Node.js + Express
- **AI Processing**: Python 3 (FastAPI, PyMuPDF, Rembg, Pillow)
- **Frontend**: HTML5, Vanilla CSS (Premium), JavaScript (ES6+)
- **Animations**: GSAP, AOS, Splitting.js
- **PDF Libraries**: PDF.js, pdf-lib, jsPDF, PDF.co API

## 📦 Quick Start

### 1. Prerequisites
- Node.js (v16+)
- Python 3.9+

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/Rinku5172/Rinvo.git
cd Rinvo

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 3. Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
PDFCO_API_KEY=your_key_here
```

### 4. Run
```bash
npm start
```
Access the application at: `http://localhost:3001`

##  Deployment
The project is configured for easy deployment to **Railway** or **Heroku** using the included `Procfile`.

## 🤝 Socials & Support
- **Developer**: Rinku Yadav
- **GitHub**: [Rinku5172](https://github.com/Rinku5172)
- **Email**: yarmy653@gmail.com

---
Made with ❤️ by Rinku Yadav