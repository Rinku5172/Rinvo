// Universal Tool Features - Shared Functionality for All Tools
class ToolFeatures {
    constructor(toolName) {
        this.toolName = toolName;
        this.maxFileSize = 50 * 1024 * 1024; // 50MB default
        this.supportedFormats = [];
        this.currentFile = null;
        this.processing = false;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
        this.loadUserPreferences();
    }

    // File Validation
    validateFile(file) {
        const errors = [];

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`);
        }

        // Check file format
        if (this.supportedFormats.length > 0) {
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!this.supportedFormats.includes(fileExt)) {
                errors.push(`Unsupported format. Supported: ${this.supportedFormats.join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Enhanced Drag and Drop
    setupDragAndDrop() {
        const uploadArea = document.querySelector('.upload-area');
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    }

    // File Handling
    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        const validation = this.validateFile(file);

        if (!validation.valid) {
            this.showError(validation.errors.join('<br>'));
            return;
        }

        this.currentFile = file;
        this.displayFileInfo(file);
        this.addToHistory(file);
    }

    // Display File Information
    displayFileInfo(file) {
        const fileInfoHTML = `
            <div class="file-info-card fade-in">
                <div class="file-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${this.formatFileSize(file.size)} • ${file.type || 'Unknown type'}</div>
                </div>
                <button onclick="toolFeatures.clearFile()" class="btn-icon" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        const container = document.getElementById('fileInfo') || document.querySelector('.file-info-container');
        if (container) {
            container.innerHTML = fileInfoHTML;
        }
    }

    // Progress Tracking
    updateProgress(percentage, label = 'Processing') {
        const progressContainer = document.querySelector('.progress-container');
        if (!progressContainer) {
            this.createProgressBar();
        }

        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressLabel = document.querySelector('.progress-label');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
        if (progressLabel) progressLabel.textContent = label;
    }

    createProgressBar() {
        const progressHTML = `
            <div class="progress-container fade-in">
                <div class="progress-header">
                    <span class="progress-label">Processing</span>
                    <span class="progress-percentage">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        const container = document.querySelector('.tool-main');
        if (container) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = progressHTML;
            container.appendChild(tempDiv.firstElementChild);
        }
    }

    // Error Handling
    showError(message) {
        const errorHTML = `
            <div class="alert alert-error fade-in" style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 1.5rem;"></i>
                    <div>
                        <strong style="color: #991b1b;">Error</strong>
                        <p style="color: #7f1d1d; margin: 0.25rem 0 0;">${message}</p>
                    </div>
                </div>
            </div>
        `;

        const container = document.querySelector('.tool-main');
        if (container) {
            const existingError = container.querySelector('.alert-error');
            if (existingError) existingError.remove();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = errorHTML;
            container.insertBefore(tempDiv.firstElementChild, container.firstChild);

            setTimeout(() => {
                const alert = container.querySelector('.alert-error');
                if (alert) alert.remove();
            }, 5000);
        }
    }

    showSuccess(message) {
        const successHTML = `
            <div class="alert alert-success fade-in" style="background: #d1fae5; border-left: 4px solid #10b981; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-check-circle" style="color: #10b981; font-size: 1.5rem;"></i>
                    <div>
                        <strong style="color: #065f46;">Success</strong>
                        <p style="color: #047857; margin: 0.25rem 0 0;">${message}</p>
                    </div>
                </div>
            </div>
        `;

        const container = document.querySelector('.tool-main');
        if (container) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = successHTML;
            container.insertBefore(tempDiv.firstElementChild, container.firstChild);

            setTimeout(() => {
                const alert = container.querySelector('.alert-success');
                if (alert) alert.remove();
            }, 5000);
        }
    }

    // History Integration
    addToHistory(file) {
        if (typeof historyManager !== 'undefined') {
            historyManager.addFile(file.name, this.toolName, file.size);
        }
    }

    // Quick Actions
    clearFile() {
        this.currentFile = null;
        const fileInfo = document.getElementById('fileInfo') || document.querySelector('.file-info-container');
        if (fileInfo) fileInfo.innerHTML = '';

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) progressContainer.remove();
    }

    resetTool() {
        this.clearFile();
        const options = document.querySelectorAll('.option-input, .option-select');
        options.forEach(option => {
            if (option.type === 'checkbox' || option.type === 'radio') {
                option.checked = false;
            } else {
                option.value = '';
            }
        });
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+U - Upload file
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.click();
            }

            // Ctrl+R - Reset tool
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.resetTool();
            }

            // Ctrl+D - Download (if process button exists)
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                const processBtn = document.querySelector('.btn-process');
                if (processBtn && !processBtn.disabled) {
                    processBtn.click();
                }
            }
        });
    }

    // User Preferences
    loadUserPreferences() {
        const prefs = localStorage.getItem(`${this.toolName}_preferences`);
        if (prefs) {
            const preferences = JSON.parse(prefs);
            this.applyPreferences(preferences);
        }
    }

    savePreferences(preferences) {
        localStorage.setItem(`${this.toolName}_preferences`, JSON.stringify(preferences));
    }

    applyPreferences(preferences) {
        Object.keys(preferences).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = preferences[key];
                } else {
                    element.value = preferences[key];
                }
            }
        });
    }

    // Utility Functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    }

    // Download Helper
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess(`File downloaded: ${filename}`);
        this.addToHistory({ name: filename, size: blob.size });
    }

    // Processing State Management
    setProcessing(isProcessing) {
        this.processing = isProcessing;
        const processBtn = document.querySelector('.btn-process');
        if (processBtn) {
            processBtn.disabled = isProcessing;
            if (isProcessing) {
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        }
    }
}

// Initialize global tool features
let toolFeatures;
