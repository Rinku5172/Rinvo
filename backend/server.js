const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// PDF.co API Key - Get your free API key from https://pdf.co
const PDFCO_API_KEY = process.env.PDFCO_API_KEY || 'yarmy653@gmail.com_hCxwjzQTIn6SzE7wWo7PIRciF7XmhFkazNdDFCAsTaigy1FpKmd8cxRcTIC0zy1j';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper function to upload file to PDF.co
async function uploadToPDFCo(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post('https://api.pdf.co/v1/file/upload', formData, {
        headers: {
            ...formData.getHeaders(),
            'x-api-key': PDFCO_API_KEY
        }
    });

    return response.data.url;
}

// Helper function to download file
async function downloadFile(url, outputPath) {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Cleanup helper
const cleanupFile = (filePath) => {
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }, 60000);
};

// ===== PDF TO WORD =====
app.post('/api/pdf-to-word', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);

        // Convert PDF to DOCX using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/doc', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.docx`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.docx', (err) => {
            cleanupFile(pdfPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('PDF to Word error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// ===== WORD TO PDF =====
app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const wordPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(wordPath);

        // Convert DOCX to PDF using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/doc', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.pdf', (err) => {
            cleanupFile(wordPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('Word to PDF error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// ===== PDF TO EXCEL =====
app.post('/api/pdf-to-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);

        // Convert PDF to Excel using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/xls', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.xlsx`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.xlsx', (err) => {
            cleanupFile(pdfPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('PDF to Excel error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// ===== EXCEL TO PDF =====
app.post('/api/excel-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const excelPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(excelPath);

        // Convert Excel to PDF using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/xls', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.pdf', (err) => {
            cleanupFile(excelPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('Excel to PDF error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// ===== PDF TO POWERPOINT =====
app.post('/api/pdf-to-ppt', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pdfPath);

        // Convert PDF to PowerPoint using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/pptx', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.pptx`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.pptx', (err) => {
            cleanupFile(pdfPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('PDF to PPT error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// ===== POWERPOINT TO PDF =====
app.post('/api/ppt-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pptPath = req.file.path;
        const uploadedUrl = await uploadToPDFCo(pptPath);

        // Convert PowerPoint to PDF using PDF.co
        const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/pptx', {
            url: uploadedUrl,
            async: false
        }, {
            headers: { 'x-api-key': PDFCO_API_KEY }
        });

        const outputPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(response.data.url, outputPath);

        res.download(outputPath, 'converted.pdf', (err) => {
            cleanupFile(pptPath);
            cleanupFile(outputPath);
        });

    } catch (error) {
        console.error('PPT to PDF error:', error.message);
        res.status(500).json({ error: 'Conversion failed: ' + error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'RINVO Backend Server with PDF.co API',
        apiKeyConfigured: PDFCO_API_KEY !== 'YOUR_API_KEY_HERE'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RINVO Backend Server running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🔑 PDF.co API Key: ${PDFCO_API_KEY === 'YOUR_API_KEY_HERE' ? '❌ NOT CONFIGURED' : '✅ Configured'}`);
    console.log(`\n📖 Get your free PDF.co API key: https://pdf.co`);
});

// Cleanup old files on startup
const cleanupOldFiles = () => {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;
        if (age > 3600000) {
            fs.unlinkSync(filePath);
        }
    });
};

cleanupOldFiles();
setInterval(cleanupOldFiles, 3600000);
