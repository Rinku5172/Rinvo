/**
 * RocketPDF API Integration
 * Universal API connector for all PDF tools
 */

const ROCKETPDF_API = {
    // Environment-aware API URLs
    baseURL: '', // Empty means use the same domain/port as the frontend
    activeURL: '',
    isProduction: window.location.protocol === 'https:' && !window.location.hostname.includes('localhost'),

    // API Endpoints mapping
    endpoints: {
        'pdf-to-word': '/api/pdf-to-word',
        'word-to-pdf': '/api/word-to-pdf',
        'pdf-to-excel': '/api/pdf-to-excel',
        'excel-to-pdf': '/api/excel-to-pdf',
        'pdf-to-powerpoint': '/api/pdf-to-ppt',
        'powerpoint-to-pdf': '/api/ppt-to-pdf',
        'pdf-to-image': '/api/pdf-to-images',
        'image-to-pdf': '/api/images-to-pdf',
        'compress-pdf': '/api/compress-pdf',
        'merge-pdf': '/api/merge-pdfs',
        'split-pdf': '/api/split-pdf',
        'rotate-pdf': '/api/rotate-pdf',
        'extract-pages': '/api/split-pdf',
        'watermark-pdf': '/api/watermark-pdf',
        'lock-pdf': '/api/lock-pdf',
        'add-page-numbers': '/api/add-page-numbers'
    },

    /**
     * Check if API is available
     */
    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${this.baseURL}/api/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                this.activeURL = this.baseURL;
                console.log('✅ Connected to Unified API');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ API Health check failed:', error.message);
        }

        console.log('📁 API backend unavailable - some features may be limited');
        return false;
    },

    /**
     * Handle the full API processing flow including UI updates
     */
    async handleAPIProcessing(toolName, fileInputId, options = {}) {
        const fileInput = document.getElementById(fileInputId);
        if (!fileInput || !fileInput.files[0]) {
            alert('Please select a file first.');
            return;
        }

        // Check health if not checked recently
        if (this.activeURL === null) {
            await this.checkHealth();
        }

        const files = Array.from(fileInput.files);
        // We always try the API if we aren't sure, or if health check succeeded
        const isAPIAvailable = true;

        // Show processing state
        if (typeof toolFeatures !== 'undefined') {
            toolFeatures.setProcessing(true);
            toolFeatures.updateProgress(0, 'Initialize processing...');
        }

        let resultBlob = null;
        let filename = 'processed_file';

        try {
            if (isAPIAvailable) {
                // ===== USE REAL API =====
                console.log(`🚀 Sending request to ${this.activeURL}${this.endpoints[toolName]}`);

                const formData = new FormData();
                // Use 'file' for single file endpoints, 'files' for multi-file endpoints
                if (toolName === 'pdf-to-word' || toolName === 'word-to-pdf' || toolName === 'pdf-to-excel' || toolName === 'excel-to-pdf' || toolName === 'pdf-to-powerpoint') {
                    formData.append('file', files[0]);
                } else {
                    files.forEach(file => formData.append('files', file));
                }

                // Add options
                Object.keys(options).forEach(key => {
                    formData.append(key, options[key]);
                });

                // Simulate upload progress
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 5;
                    if (progress > 90) clearInterval(interval);
                    if (typeof toolFeatures !== 'undefined') {
                        toolFeatures.updateProgress(progress, 'Uploading and processing...');
                    }
                }, 500);

                const response = await fetch(`${this.activeURL}${this.endpoints[toolName]}`, {
                    method: 'POST',
                    body: formData
                });

                clearInterval(interval);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                resultBlob = await response.blob();

                // Try to get filename from headers
                const contentDisp = response.headers.get('Content-Disposition');
                if (contentDisp && contentDisp.includes('filename=')) {
                    filename = contentDisp.split('filename=')[1].replace(/['"]/g, '');
                } else {
                    filename = `processed_${files[0].name}`;
                    // Adjust extension based on tool
                    if (toolName.includes('to-pdf')) filename = filename.replace(/\.[^/.]+$/, ".pdf");
                    if (toolName.includes('to-word')) filename = filename.replace(/\.[^/.]+$/, ".docx");
                    if (toolName.includes('to-excel')) filename = filename.replace(/\.[^/.]+$/, ".xlsx");
                    if (toolName.includes('to-image')) filename = filename.replace(/\.[^/.]+$/, ".zip");
                }

            } else {
                // ===== USE DEMO MODE =====
                console.log('Using Demo Generator...');

                // Simulate realistic processing time (5-10 seconds)
                const processingTime = 5000 + Math.random() * 5000;
                const steps = 12;
                const stepTime = processingTime / steps;

                const messages = [
                    'Analyzing file structure...',
                    'Reading document content...',
                    'Identifying text and images...',
                    'Optimizing layout...',
                    'Converting pages...',
                    'Formatting output...',
                    'Checking quality...',
                    'Applying changes...',
                    'Finalizing document...',
                    'Compressing result...',
                    'Preparing download...',
                    'Done!'
                ];

                for (let i = 0; i < steps; i++) {
                    await new Promise(resolve => setTimeout(resolve, stepTime));
                    const progress = 10 + ((i + 1) * 7); // 10 to 94
                    const message = messages[i];

                    if (typeof toolFeatures !== 'undefined') {
                        toolFeatures.updateProgress(progress, message);
                    }
                }

                // Generate demo file using DemoFileGenerator
                if (typeof DemoFileGenerator !== 'undefined') {
                    const result = await DemoFileGenerator.processFile(toolName, files[0], options);
                    resultBlob = result.blob;
                    filename = result.filename;
                } else {
                    // Fallback
                    resultBlob = new Blob(['Demo content'], { type: 'text/plain' });
                    filename = 'demo_result.txt';
                }
            }

            // Download Logic
            if (typeof toolFeatures !== 'undefined') {
                toolFeatures.updateProgress(100, 'Download ready!');
                toolFeatures.downloadFile(resultBlob, filename);
                toolFeatures.setProcessing(false);

                // Show success notification
                if (isAPIAvailable) {
                    ROCKETPDF_API.showNotification('File successfully processed via API!', 'success');
                } else {
                    ROCKETPDF_API.showNotification('File processed (Demo Mode)', 'info');
                }
            }

        } catch (error) {
            console.error('Processing error:', error);
            if (typeof toolFeatures !== 'undefined') {
                toolFeatures.setProcessing(false);
            }
            ROCKETPDF_API.showNotification(`Error: ${error.message}`, 'error');
        }
    },

    /**
     * Show a notification toast
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} fade-in`;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '10000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';

        // Colors
        if (type === 'success') notification.style.background = '#10b981';
        else if (type === 'error') notification.style.background = '#ef4444';
        else notification.style.background = '#3b82f6';

        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s ease';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Only check health once on load
    await ROCKETPDF_API.checkHealth();

    // Override the process button if it exists and hasn't been handled by tool-features.js yet
    // Note: tool-features.js usually handles the UI, but we hook into it via handleAPIProcessing
});
