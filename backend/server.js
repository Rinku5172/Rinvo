const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const muhammara = require('muhammara');
const { spawn } = require('child_process');
const crypto = require('crypto');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const officegen = require('officegen');

// Load environment variables from .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// PDF.co API Key - from environment variable
const PDFCO_API_KEY = process.env.PDFCO_API_KEY || ''; // Provide via .env file

// Python Backend Configuration
const PYTHON_PORT = process.env.PYTHON_PORT || 8000;
const PYTHON_HOST = process.env.PYTHON_HOST || '127.0.0.1';
const PYTHON_SCRIPT = process.env.PYTHON_SCRIPT || 'api_server.py';

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(os.tmpdir(), 'rocketpdf_uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Multer config with error handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedFilename}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        // Allow PDFs and images
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }
    }
});

// ===== Python Backend Integration =====
let pythonProcess = null;
let pythonRetryCount = 0;
const MAX_RETRIES = 5;

function startPythonServer() {
    const commands = ['python3', 'python', 'py'];
    let commandIdx = 0;

    function attemptStart() {
        if (commandIdx >= commands.length) {
            console.error('❌ Failed to start Python server: No python command found in system.');

            if (pythonRetryCount < MAX_RETRIES) {
                pythonRetryCount++;
                console.log(`🔄 Retry attempt ${pythonRetryCount}/${MAX_RETRIES} in 30 seconds...`);
                setTimeout(() => {
                    commandIdx = 0;
                    attemptStart();
                }, 30000);
            }
            return;
        }

        const cmd = commands[commandIdx];
        console.log(`🚀 Attempting to start Python AI Server using '${cmd}' on port ${PYTHON_PORT}...`);

        // Check if script exists
        const scriptPath = path.join(process.cwd(), PYTHON_SCRIPT);
        if (!fs.existsSync(scriptPath)) {
            console.warn(`⚠️ Warning: ${PYTHON_SCRIPT} not found in current directory. Creating placeholder...`);
            // Create a simple placeholder if file doesn't exist
            const placeholderContent = `
from fastapi import FastAPI
app = FastAPI()
@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Python AI Server Placeholder"}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=${PYTHON_PORT})
            `;
            fs.writeFileSync(scriptPath, placeholderContent);
            console.log(`✅ Created placeholder ${PYTHON_SCRIPT}`);
        }

        pythonProcess = spawn(cmd, [PYTHON_SCRIPT], {
            env: {
                ...process.env,
                PORT: PYTHON_PORT.toString(),
                PYTHONUNBUFFERED: '1'
            },
            stdio: ['ignore', 'pipe', 'pipe']
        });

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) console.log(`[Python]: ${output}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error && !error.includes('Warning')) {
                console.error(`[Python-Error]: ${error}`);
            }
        });

        pythonProcess.on('error', (err) => {
            console.warn(`⚠️ Command '${cmd}' failed to spawn: ${err.message}`);
            commandIdx++;
            setTimeout(attemptStart, 1000);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                console.log(`🐍 Python process exited with code ${code}.`);

                if (pythonRetryCount < MAX_RETRIES) {
                    pythonRetryCount++;
                    console.log(`🔄 Restarting Python server (attempt ${pythonRetryCount}/${MAX_RETRIES})...`);
                    setTimeout(() => {
                        commandIdx = 0;
                        attemptStart();
                    }, 5000);
                } else {
                    console.log('❌ Max retries reached. Python server will not be restarted.');
                }
            }
        });
    }

    attemptStart();
}

// Start Python server
startPythonServer();

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.kill();
    }
    // Cleanup uploads
    try {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            fs.unlinkSync(filePath);
        });
        console.log('🧹 Cleaned up uploads directory');
    } catch (e) {
        console.error('Cleanup error:', e.message);
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    if (pythonProcess && !pythonProcess.killed) pythonProcess.kill();
    process.exit(0);
});

// ===== Helper Functions =====

// Upload file to PDF.co and return URL
async function uploadToPDFCo(filePath) {
    if (!PDFCO_API_KEY) {
        throw new Error('PDF.co API key not configured');
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const resp = await axios.post('https://api.pdf.co/v1/file/upload', form, {
        headers: {
            ...form.getHeaders(),
            'x-api-key': PDFCO_API_KEY
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    if (!resp.data || !resp.data.url) {
        throw new Error('PDF.co upload failed: ' + (resp.data.error || 'Unknown error'));
    }
    return resp.data.url;
}

// Download remote file to local path
async function downloadFile(url, outPath) {
    const resp = await axios.get(url, {
        responseType: 'stream',
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outPath);
        resp.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Generic helper to convert via PDF.co
async function convertViaPdfCo(convertEndpoint, uploadedUrl) {
    if (!PDFCO_API_KEY) {
        throw new Error('PDF.co API key not configured');
    }

    const resp = await axios.post(convertEndpoint,
        { url: uploadedUrl, async: false },
        {
            headers: { 'x-api-key': PDFCO_API_KEY },
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    );

    if (!resp.data || !resp.data.url) {
        throw new Error('PDF.co conversion failed: ' + (resp.data.error || 'Unknown error'));
    }
    return resp.data.url;
}

// Safe file cleanup
function safeCleanup(filePath, delayMs = 60000) {
    if (!filePath || !fs.existsSync(filePath)) return;

    setTimeout(() => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            // Ignore cleanup errors
        }
    }, delayMs);
}

// Check if Python service is available
async function isPythonServiceAvailable() {
    if (!pythonProcess || pythonProcess.killed) return false;

    try {
        const resp = await axios.get(`http://${PYTHON_HOST}:${PYTHON_PORT}/api/health`, {
            timeout: 3000
        });
        return resp.status === 200;
    } catch (e) {
        return false;
    }
}

// Generic proxy for Python services
async function proxyToPython(endpoint, req, res, options = {}) {
    let filePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        filePath = req.file.path;

        // Check if Python service is available
        const pythonAvailable = await isPythonServiceAvailable();
        if (!pythonAvailable) {
            safeCleanup(filePath);
            return res.status(503).json({
                error: 'AI Service Unavailable',
                message: 'The AI processing service is currently starting up. Please try again in a moment.'
            });
        }

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Forward all body fields
        Object.entries(req.body).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
                form.append(k, v.toString());
            }
        });

        const timeout = options.timeout || 120000; // Default 2 minutes
        const resp = await axios.post(`http://${PYTHON_HOST}:${PYTHON_PORT}${endpoint}`, form, {
            headers: { ...form.getHeaders() },
            responseType: 'arraybuffer',
            timeout: timeout,
            maxContentLength: 100 * 1024 * 1024, // 100MB
            maxBodyLength: 100 * 1024 * 1024
        });

        const contentType = resp.headers['content-type'] || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');

        // Forward dimension headers if present
        ['x-original-width', 'x-original-height', 'x-new-width', 'x-new-height'].forEach(h => {
            if (resp.headers[h]) {
                const formattedHeader = h.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('-');
                res.set(formattedHeader, resp.headers[h]);
            }
        });

        res.send(Buffer.from(resp.data));
        safeCleanup(filePath);

    } catch (e) {
        console.error(`[Proxy] ${endpoint} error:`, e.message);

        let errorMessage = 'Image processing failed';
        let statusCode = 502;

        if (e.code === 'ECONNREFUSED') {
            errorMessage = 'AI service is not running';
            statusCode = 503;
        } else if (e.response) {
            errorMessage = `Python error: ${e.response.status}`;
            try {
                const errorData = JSON.parse(e.response.data.toString());
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch {
                // Not JSON, ignore
            }
        }

        res.status(statusCode).json({
            error: 'Processing Error',
            detail: errorMessage,
            message: 'Please try again later.'
        });

        if (filePath) safeCleanup(filePath);
    }
}

// ===== Local PDF Processing Functions (Fallback) =====

async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (e) {
        console.error('PDF text extraction error:', e);
        return null;
    }
}

async function wordToPDFLocal(wordPath, outputPath) {
    try {
        // Read Word file
        const result = await mammoth.convertToHtml({ path: wordPath });
        const html = result.value;

        // Create PDF using pdf-lib (simplified)
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Simple HTML to text conversion
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        // Split text into lines
        const fontSize = 12;
        const lines = [];
        let currentLine = '';
        const words = text.split(' ');

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (testWidth < width - 100) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);

        // Draw text
        let y = height - 50;
        for (const line of lines) {
            page.drawText(line, {
                x: 50,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0)
            });
            y -= fontSize + 5;
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        return true;
    } catch (e) {
        console.error('Word to PDF local conversion error:', e);
        return false;
    }
}

// ===== Health Check Endpoints =====

app.get('/api/health', (req, res) => {
    const pythonStatus = pythonProcess && !pythonProcess.killed ? 'running' : 'stopped';
    res.json({
        status: 'ok',
        server: 'RocketPDF Node Backend',
        timestamp: new Date().toISOString(),
        python: pythonStatus,
        apiKeyConfigured: !!PDFCO_API_KEY,
        uploadsDir: uploadsDir
    });
});

app.get('/api/bg-health', async (req, res) => {
    try {
        const pythonAvailable = await isPythonServiceAvailable();
        if (pythonAvailable) {
            const resp = await axios.get(`http://${PYTHON_HOST}:${PYTHON_PORT}/api/health`, { timeout: 5000 });
            res.json({
                status: 'ok',
                python: resp.data,
                processRunning: pythonProcess && !pythonProcess.killed
            });
        } else {
            res.status(503).json({
                status: 'unavailable',
                message: 'Python service not available',
                processRunning: pythonProcess && !pythonProcess.killed
            });
        }
    } catch (e) {
        res.status(503).json({
            status: 'unavailable',
            error: e.message,
            processRunning: pythonProcess && !pythonProcess.killed
        });
    }
});

// ===== PDF Conversion Endpoints =====

app.post('/api/pdf-to-word', upload.single('file'), async (req, res) => {
    let pdfPath = null;
    let outPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        pdfPath = req.file.path;

        if (!PDFCO_API_KEY) {
            safeCleanup(pdfPath);
            return res.status(503).json({
                error: 'PDF.co API key not configured',
                message: 'Backend API is not available. Please use client-side conversion.'
            });
        }

        console.log('Uploading to PDF.co...');
        const uploadedUrl = await uploadToPDFCo(pdfPath);
        console.log('Uploaded URL:', uploadedUrl);

        console.log('Converting to Word...');
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/docx', uploadedUrl);
        console.log('Result URL:', resultUrl);

        outPath = path.join(uploadsDir, `converted-${Date.now()}.docx`);
        await downloadFile(resultUrl, outPath);

        console.log('Conversion complete, sending file...');
        res.download(outPath, 'converted.docx', (err) => {
            safeCleanup(pdfPath);
            safeCleanup(outPath);
        });
    } catch (e) {
        console.error('PDF to Word conversion error:', e);
        if (pdfPath) safeCleanup(pdfPath);
        if (outPath) safeCleanup(outPath);

        // Try fallback
        res.status(500).json({
            error: e.message,
            fallback: 'Try using client-side conversion'
        });
    }
});

app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
    let wordPath = null;
    let outPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        wordPath = req.file.path;

        // Try PDF.co first if API key is available
        if (PDFCO_API_KEY) {
            try {
                console.log('Using PDF.co for Word to PDF conversion...');
                const uploadedUrl = await uploadToPDFCo(wordPath);
                const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/from/doc', uploadedUrl);

                outPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
                await downloadFile(resultUrl, outPath);

                return res.download(outPath, 'converted.pdf', (err) => {
                    safeCleanup(wordPath);
                    safeCleanup(outPath);
                });
            } catch (pdfCoError) {
                console.error('PDF.co conversion failed, trying local fallback:', pdfCoError.message);
                // Fall through to local conversion
            }
        }

        // Local fallback
        console.log('Using local conversion for Word to PDF...');
        outPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);

        const success = await wordToPDFLocal(wordPath, outPath);

        if (success) {
            res.download(outPath, 'converted.pdf', (err) => {
                safeCleanup(wordPath);
                safeCleanup(outPath);
            });
        } else {
            throw new Error('Local conversion failed');
        }

    } catch (e) {
        console.error('Word to PDF conversion error:', e);
        if (wordPath) safeCleanup(wordPath);
        if (outPath) safeCleanup(outPath);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/pdf-to-excel', upload.single('file'), async (req, res) => {
    let pdfPath = null;
    let outPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        pdfPath = req.file.path;

        if (!PDFCO_API_KEY) {
            safeCleanup(pdfPath);
            return res.status(503).json({ error: 'PDF.co API key not configured' });
        }

        const uploadedUrl = await uploadToPDFCo(pdfPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/xls', uploadedUrl);

        outPath = path.join(uploadsDir, `converted-${Date.now()}.xlsx`);
        await downloadFile(resultUrl, outPath);

        res.download(outPath, 'converted.xlsx', (err) => {
            safeCleanup(pdfPath);
            safeCleanup(outPath);
        });
    } catch (e) {
        console.error('PDF to Excel error:', e);
        if (pdfPath) safeCleanup(pdfPath);
        if (outPath) safeCleanup(outPath);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/excel-to-pdf', upload.single('file'), async (req, res) => {
    let excelPath = null;
    let outPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        excelPath = req.file.path;

        if (!PDFCO_API_KEY) {
            safeCleanup(excelPath);
            return res.status(503).json({ error: 'PDF.co API key not configured' });
        }

        const uploadedUrl = await uploadToPDFCo(excelPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/from/xls', uploadedUrl);

        outPath = path.join(uploadsDir, `converted-${Date.now()}.pdf`);
        await downloadFile(resultUrl, outPath);

        res.download(outPath, 'converted.pdf', (err) => {
            safeCleanup(excelPath);
            safeCleanup(outPath);
        });
    } catch (e) {
        console.error('Excel to PDF error:', e);
        if (excelPath) safeCleanup(excelPath);
        if (outPath) safeCleanup(outPath);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/pdf-to-ppt', upload.single('file'), async (req, res) => {
    let pdfPath = null;
    let outPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        pdfPath = req.file.path;

        if (!PDFCO_API_KEY) {
            safeCleanup(pdfPath);
            return res.status(503).json({ error: 'PDF.co API key not configured' });
        }

        const uploadedUrl = await uploadToPDFCo(pdfPath);
        const resultUrl = await convertViaPdfCo('https://api.pdf.co/v1/pdf/convert/to/pptx', uploadedUrl);

        outPath = path.join(uploadsDir, `converted-${Date.now()}.pptx`);
        await downloadFile(resultUrl, outPath);

        res.download(outPath, 'converted.pptx', (err) => {
            safeCleanup(pdfPath);
            safeCleanup(outPath);
        });
    } catch (e) {
        console.error('PDF to PPT error:', e);
        if (pdfPath) safeCleanup(pdfPath);
        if (outPath) safeCleanup(outPath);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/lock-pdf', upload.single('file'), async (req, res) => {
    let tempWatermarkedPath = null;
    let outPath = null;
    let pdfPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        pdfPath = req.file.path;
        const { userPass, ownerPass, permissions, watermarkText, expiryDate } = req.body;

        let perms = {};
        try {
            if (permissions) perms = JSON.parse(permissions);
        } catch (e) {
            console.error('Error parsing permissions:', e);
        }

        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Watermark
        if (watermarkText) {
            const pages = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            for (const page of pages) {
                const { width, height } = page.getSize();
                const fontSize = 50;
                const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
                page.drawText(watermarkText, {
                    x: (width / 2) - (textWidth / 2),
                    y: height / 2,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0.95, 0.25, 0.37),
                    opacity: 0.3,
                    rotate: degrees(45),
                });
            }
        }

        // Expiry date watermark
        if (expiryDate) {
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.drawText(`Expires: ${expiryDate}`, {
                    x: width - 150,
                    y: 20,
                    size: 10,
                    font,
                    color: rgb(0.8, 0, 0),
                });
            }
        }

        // Save intermediate file
        const watermarkedBytes = await pdfDoc.save();
        tempWatermarkedPath = path.join(uploadsDir, `temp-${Date.now()}.pdf`);
        fs.writeFileSync(tempWatermarkedPath, watermarkedBytes);

        // Encryption using muhammara
        outPath = path.join(uploadsDir, `locked-${Date.now()}.pdf`);

        if (userPass || ownerPass) {
            // Calculate protection flag
            let flag = 0;
            // Bit 3 (4) = Print, Bit 4 (8) = Modify, Bit 5 (16) = Copy, Bit 6 (32) = Annotate
            if (perms.printing) flag += 4;
            if (perms.modifying) flag += 8;
            if (perms.copying) flag += 16;
            if (perms.annotating) flag += 32;

            const recipe = new muhammara.Recipe(tempWatermarkedPath, outPath);
            recipe.encrypt({
                userPassword: userPass || '',
                ownerPassword: ownerPass || userPass || '',
                userProtectionFlag: flag
            });
            recipe.endPDF();
        } else {
            // If no encryption needed, just copy
            fs.copyFileSync(tempWatermarkedPath, outPath);
        }

        res.download(outPath, 'locked.pdf', (err) => {
            safeCleanup(pdfPath);
            safeCleanup(tempWatermarkedPath);
            safeCleanup(outPath);
        });

    } catch (e) {
        console.error('Lock PDF error:', e);
        if (pdfPath) safeCleanup(pdfPath);
        if (tempWatermarkedPath) safeCleanup(tempWatermarkedPath);
        if (outPath) safeCleanup(outPath);
        res.status(500).json({ error: e.message });
    }
});

// ===== Image Processing Routes (Proxy to Python) =====

app.post('/api/remove-background', upload.single('file'), (req, res) => {
    proxyToPython('/api/remove-background', req, res, { timeout: 120000 });
});

app.post('/api/image/resize', upload.single('file'), (req, res) => {
    proxyToPython('/api/image/resize', req, res, { timeout: 60000 });
});

app.post('/api/image/process', upload.single('file'), (req, res) => {
    proxyToPython('/api/image/process', req, res, { timeout: 60000 });
});

app.post('/api/image/watermark', upload.single('file'), (req, res) => {
    proxyToPython('/api/image/watermark', req, res, { timeout: 60000 });
});

// ===== PDF Text Extraction =====

app.post('/api/pdf-to-text', upload.single('file'), async (req, res) => {
    let pdfPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        pdfPath = req.file.path;
        const text = await extractTextFromPDF(pdfPath);

        res.json({
            filename: req.file.originalname,
            text: text,
            message: 'Text extracted successfully'
        });

        safeCleanup(pdfPath);

    } catch (e) {
        console.error('PDF to text error:', e);
        if (pdfPath) safeCleanup(pdfPath);
        res.status(500).json({ error: e.message });
    }
});

// Serve static files from the project root
const projectRoot = path.join(__dirname, '..');

// Clean URLs middleware (e.g., /tools/merge-pdf -> /tools/merge-pdf.html)
app.use((req, res, next) => {
    if (req.path.includes('.') || req.path.endsWith('/')) {
        return next();
    }

    const htmlPath = path.join(projectRoot, req.path + '.html');
    if (fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
    }
    next();
});

app.use(express.static(projectRoot));

// Root route - serve index.html if exists
app.get('/', (req, res) => {
    const indexPath = path.join(projectRoot, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({
            name: 'RocketPDF Unified Backend',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                health: '/api/health',
                pdfToWord: '/api/pdf-to-word',
                wordToPdf: '/api/word-to-pdf',
                pdfToExcel: '/api/pdf-to-excel',
                excelToPdf: '/api/excel-to-pdf',
                pdfToPpt: '/api/pdf-to-ppt',
                pdfToText: '/api/pdf-to-text',
                lockPdf: '/api/lock-pdf',
                removeBackground: '/api/remove-background',
                imageResize: '/api/image/resize',
                imageProcess: '/api/image/process',
                imageWatermark: '/api/image/watermark'
            }
        });
    }
});

// ===== Error Handling Middleware =====

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Max size: 50MB' });
        }
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// ===== Start Server =====

const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     🚀 RocketPDF Backend Server Started Successfully     ║
╠══════════════════════════════════════════════════════════╣
║  Port:           ${PORT}                                         
║  Uploads:        ${uploadsDir}
║  Python Port:    ${PYTHON_PORT}
║  PDF.co API:     ${PDFCO_API_KEY ? '✅ Configured' : '❌ Not Configured'}
║  Python Server:  ${pythonProcess ? '✅ Running' : '❌ Not Started'}
╚══════════════════════════════════════════════════════════╝
    `);
});

// ===== Cleanup Old Files Periodically =====

function cleanupOldFiles() {
    try {
        const files = fs.readdirSync(uploadsDir);
        const now = Date.now();
        let cleaned = 0;

        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            try {
                const stats = fs.statSync(filePath);
                // Delete files older than 1 hour
                if (now - stats.mtimeMs > 3600000) {
                    fs.unlinkSync(filePath);
                    cleaned++;
                }
            } catch (e) {
                // Ignore errors for individual files
            }
        });

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} old files`);
        }
    } catch (e) {
        console.error('Cleanup error:', e.message);
    }
}

// Run cleanup every hour
cleanupOldFiles();
setInterval(cleanupOldFiles, 3600000);

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Trying another port...`);
        server.close();
        app.listen(0); // Let the OS assign a random port
    }
});

// Export for testing
module.exports = app;