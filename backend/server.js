const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Load environment variables from .env (optional)
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PDF.co API Key - set via environment variable or .env
const PDFCO_API_KEY = process.env.PDFCO_API_KEY || '';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join('/tmp', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// Upload file to PDF.co and return URL
async function uploadToPDFCo(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const resp = await axios.post('https://api.pdf.co/v1/file/upload', form, {
        headers: { ...form.getHeaders(), 'x-api-key': PDFCO_API_KEY }
    });

    if (!resp.data || !resp.data.url) throw new Error('PDF.co upload failed');
    return resp.data.url;
}

// Download remote file to local path
async function downloadFile(url, outPath) {
    const resp = await axios.get(url, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outPath);
        resp.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Remove a file after short delay
function cleanupFile(filePath, delayMs = 60_000) {
    setTimeout(() => { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }, delayMs);
}

// Generic helper to convert via PDF.co
async function convertViaPdfCo(convertEndpoint, uploadedUrl) {
    const resp = await axios.post(convertEndpoint, { url: uploadedUrl, async: false }, { headers: { 'x-api-key': PDFCO_API_KEY } });
    if (!resp.data || !resp.data.url) throw new Error('PDF.co conversion failed');
    return resp.data.url;
}

// ===== Endpoints =====
app.post('/api/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/doc', uploadedUrl);

        const outPath = path.join(uploadsDir, `converted-${Date.now()}.docx`);
        await downloadFile(resultUrl, outPath);
        res.download(outPath, 'converted.docx', (err) => { cleanupFile(pdfPath); cleanupFile(outPath); });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const wordPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(wordPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/from/doc', uploadedUrl);

        const outPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(resultUrl, outPath);
        res.download(outPath, 'converted.pdf', (err) => { cleanupFile(wordPath); cleanupFile(outPath); });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/pdf-to-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/xls', uploadedUrl);

        const outPath = path.join(uploadsDir, `converted-${Date.now()}.xlsx`);
        await downloadFile(resultUrl, outPath);
        res.download(outPath, 'converted.xlsx', (err) => { cleanupFile(pdfPath); cleanupFile(outPath); });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/excel-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const excelPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(excelPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/from/xls', uploadedUrl);

        const outPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(resultUrl, outPath);
        res.download(outPath, 'converted.pdf', (err) => { cleanupFile(excelPath); cleanupFile(outPath); });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/pdf-to-ppt', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/pptx', uploadedUrl);

        const outPath = path.join(uploadsDir, `converted-${Date.now()}.pptx`);
        await downloadFile(resultUrl, outPath);
        res.download(outPath, 'converted.pptx', (err) => { cleanupFile(pdfPath); cleanupFile(outPath); });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('RINVO Backend is running on Railway!');
});

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', apiKeyConfigured: !!PDFCO_API_KEY });
});

// Start
app.listen(PORT, () => {
    console.log(`RINVO backend running on port ${PORT}`);
    console.log(`Uploads: ${uploadsDir}`);
    console.log(`PDF.co key configured: ${PDFCO_API_KEY ? 'yes' : 'no'}`);
});

// Cleanup old files hourly
function cleanupOldFiles() {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    files.forEach(file => {
        const p = path.join(uploadsDir, file);
        try {
            const stats = fs.statSync(p);
            if (now - stats.mtimeMs > 3600000) fs.unlinkSync(p);
        } catch (e) {}
    });
}

cleanupOldFiles();
setInterval(cleanupOldFiles, 3600000);

