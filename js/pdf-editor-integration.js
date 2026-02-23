/**
 * Universal PDF Editor Integration - COMPLETE FIXED VERSION
 * Adds PDF editing capabilities to any tool page
 */

class PDFEditorIntegration {
    constructor() {
        this.editorUrl = '../tools/pdf-editor.html';
        this.apiBaseUrl = this.getApiBaseUrl();
        this.currentFile = null;
        this.fileId = null;
        this.editButtons = [];
        this.modal = null;
        this.iframe = null;
        this.isInitialized = false;
    }

    // Get API base URL based on environment
    getApiBaseUrl() {
        // Check if we're in production or development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8002/api';
        } else {
            // Production - use relative URL or configured API
            return '/api';
        }
    }

    // Initialize the editor integration
    init() {
        if (this.isInitialized) return;
        
        console.log('📝 Initializing PDF Editor Integration...');
        this.addEditButton();
        this.addEditorModal();
        this.setupEventListeners();
        this.checkForExistingPDF();
        
        this.isInitialized = true;
        console.log('✅ PDF Editor Integration initialized');
    }

    // Check for existing PDF in the page
    checkForExistingPDF() {
        // Look for file input with PDF already selected
        const fileInputs = document.querySelectorAll('input[type="file"][accept*="pdf"]');
        fileInputs.forEach(input => {
            if (input.files && input.files.length > 0) {
                const file = input.files[0];
                if (file.type === 'application/pdf') {
                    this.handlePDFUpload(file);
                }
            }
        });
    }

    // Add edit button to existing tool interface
    addEditButton() {
        // Look for existing upload areas with multiple selectors
        const selectors = [
            '.upload-area', '.upload-box', '.drop-zone',
            '.file-upload-area', '.pdf-upload-area',
            '.upload-container', '.file-input-container'
        ];
        
        let uploadAreas = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                uploadAreas = [...uploadAreas, ...elements];
            }
        });

        // If no upload areas found, look for file inputs
        if (uploadAreas.length === 0) {
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                const container = input.closest('div') || input.parentElement;
                if (container && !uploadAreas.includes(container)) {
                    uploadAreas.push(container);
                }
            });
        }
        
        uploadAreas.forEach(uploadArea => {
            // Check if button already exists
            if (uploadArea.querySelector('.pdf-edit-btn')) return;

            // Create edit button
            const editButton = document.createElement('button');
            editButton.className = 'btn-secondary pdf-edit-btn';
            editButton.innerHTML = '<i class="fas fa-edit"></i> <span>Edit PDF</span>';
            editButton.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                display: none;
                transition: all 0.3s ease;
                align-items: center;
                gap: 0.5rem;
                font-size: 1rem;
                box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
            `;
            editButton.title = 'Open PDF Editor to edit this document';

            // Add hover effect
            editButton.addEventListener('mouseenter', () => {
                editButton.style.transform = 'translateY(-2px)';
                editButton.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
            });

            editButton.addEventListener('mouseleave', () => {
                editButton.style.transform = 'translateY(0)';
                editButton.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.25)';
            });

            // Add event listener
            editButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openEditor();
            });

            uploadArea.appendChild(editButton);
            this.editButtons.push(editButton);
        });
    }

    // Add editor modal/dialog
    addEditorModal() {
        // Check if modal already exists
        if (document.getElementById('pdf-editor-modal')) return;

        this.modal = document.createElement('div');
        this.modal.id = 'pdf-editor-modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 999999;
            display: none;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            width: 95%;
            height: 95%;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        `;

        this.iframe = document.createElement('iframe');
        this.iframe.id = 'pdf-editor-iframe';
        this.iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        `;
        this.iframe.src = this.editorUrl;
        this.iframe.allow = 'clipboard-read; clipboard-write';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            cursor: pointer;
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.1)';
            closeBtn.style.background = '#dc2626';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
            closeBtn.style.background = '#ef4444';
        });

        closeBtn.onclick = () => this.closeEditor();

        modalContent.appendChild(this.iframe);
        modalContent.appendChild(closeBtn);
        this.modal.appendChild(modalContent);
        document.body.appendChild(this.modal);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.closeEditor();
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for file upload events
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                const files = e.target.files;
                if (files.length > 0) {
                    const file = files[0];
                    if (file.type === 'application/pdf') {
                        this.handlePDFUpload(file);
                    }
                }
            }
        });

        // Listen for drag and drop events
        document.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf') {
                    this.handlePDFUpload(file);
                }
            }
        });

        // Listen for editor messages
        window.addEventListener('message', (event) => {
            // Security check - only accept messages from our editor
            if (event.origin !== window.location.origin) return;

            if (event.data && event.data.type) {
                switch(event.data.type) {
                    case 'PDF_EDIT_COMPLETE':
                        this.handleEditComplete(event.data);
                        break;
                    case 'PDF_EDIT_CANCELLED':
                        this.handleEditCancelled();
                        break;
                    case 'PDF_EDIT_READY':
                        this.sendFileToEditor();
                        break;
                }
            }
        });

        // Listen for file input click to show edit button
        document.addEventListener('click', (e) => {
            if (e.target.matches('input[type="file"]')) {
                // Will be handled by change event
            }
        });
    }

    // Send current file to editor
    sendFileToEditor() {
        if (this.fileId && this.iframe && this.iframe.contentWindow) {
            this.iframe.contentWindow.postMessage({
                type: 'LOAD_PDF',
                fileId: this.fileId,
                fileName: this.currentFile ? this.currentFile.name : 'document.pdf'
            }, window.location.origin);
        }
    }

    // Handle PDF file upload
    handlePDFUpload(file) {
        this.currentFile = file;
        
        // Show edit button for PDF files
        this.editButtons.forEach(btn => {
            btn.style.display = 'inline-flex';
            
            // Update button text with filename
            const span = btn.querySelector('span');
            if (span) {
                span.textContent = `Edit "${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}"`;
            }
        });

        // Auto-upload to get file ID for editing
        this.uploadForEditing(file).catch(error => {
            console.error('Upload for editing failed:', error);
            // Still allow opening editor even if upload fails - will use client-side
            this.showNotification('Upload failed, but you can still edit client-side', 'warning');
        });
    }

    // Upload PDF for editing session
    async uploadForEditing(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Show uploading indicator
        this.editButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Uploading...</span>';
            btn.disabled = true;
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${this.apiBaseUrl}/pdf-editor/upload`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                this.fileId = data.file_id;
                console.log('✅ PDF uploaded for editing:', data);
                
                // Restore button
                this.editButtons.forEach(btn => {
                    btn.innerHTML = '<i class="fas fa-edit"></i> <span>Edit PDF</span>';
                    btn.disabled = false;
                });
                
                this.showNotification('PDF ready for editing!', 'success');
            } else {
                throw new Error(`Upload failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Upload for editing failed:', error);
            
            // Restore button
            this.editButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-edit"></i> <span>Edit PDF (Offline)</span>';
                btn.disabled = false;
            });
            
            // Use client-side editing as fallback
            this.showNotification('Using client-side PDF editor (offline mode)', 'info');
            
            // For client-side, we'll use the file directly
            this.fileId = 'client-side';
        }
    }

    // Open the PDF editor
    openEditor() {
        if (!this.currentFile) {
            this.showNotification('Please upload a PDF file first', 'warning');
            return;
        }

        if (!this.modal || !this.iframe) {
            this.addEditorModal();
        }

        // Reset iframe
        this.iframe.src = this.editorUrl;
        
        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // If we have a file ID, wait for editor to be ready
        if (this.fileId) {
            // Send file data to editor
            setTimeout(() => {
                this.sendFileToEditor();
            }, 1000);
        }
    }

    // Close the editor
    closeEditor() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Clear iframe src to stop any ongoing processes
            setTimeout(() => {
                if (this.iframe) {
                    this.iframe.src = 'about:blank';
                }
            }, 100);
        }
    }

    // Handle edit completion
    handleEditComplete(data) {
        console.log('✅ PDF edit completed:', data);
        
        // Show success message
        this.showNotification('PDF edited successfully!', 'success');
        
        // Close editor
        this.closeEditor();
        
        // If we have download URL, offer download
        if (data.download_url) {
            setTimeout(() => {
                if (confirm('Download the edited PDF?')) {
                    this.downloadFile(data.download_url);
                }
            }, 500);
        }
        
        // Reload the current page to show updated file? Optional
        // window.location.reload();
    }

    // Handle edit cancelled
    handleEditCancelled() {
        console.log('PDF edit cancelled');
        this.closeEditor();
        this.showNotification('Editing cancelled', 'info');
    }

    // Download file
    async downloadFile(downloadUrl) {
        try {
            this.showNotification('Downloading...', 'info');
            
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentFile ? `edited_${this.currentFile.name}` : 'edited-document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('Download complete!', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('Download failed: ' + error.message, 'error');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.pdf-editor-notification');
        if (existing) {
            document.body.removeChild(existing);
        }

        const notification = document.createElement('div');
        notification.className = `pdf-editor-notification ${type}`;
        
        const icon = document.createElement('i');
        icon.className = this.getNotificationIcon(type);
        
        const text = document.createElement('span');
        text.textContent = message;
        
        notification.appendChild(icon);
        notification.appendChild(text);
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000001;
            transform: translateX(400px);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.95rem;
            max-width: 350px;
            background: ${this.getNotificationColor(type)};
            border-left: 5px solid ${this.getNotificationBorder(type)};
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }

    getNotificationColor(type) {
        switch(type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#3b82f6';
        }
    }

    getNotificationBorder(type) {
        switch(type) {
            case 'success': return '#059669';
            case 'error': return '#dc2626';
            case 'warning': return '#d97706';
            default: return '#2563eb';
        }
    }

    // Add editing capabilities to specific tools
    integrateWithTool(toolName) {
        console.log(`🔧 Integrating with tool: ${toolName}`);
        
        switch(toolName) {
            case 'compress-pdf':
                this.addEditBeforeCompress();
                break;
            case 'watermark-pdf':
                this.addEditBeforeWatermark();
                break;
            case 'merge-pdf':
                this.addEditToIndividualFiles();
                break;
            default:
                // Generic integration
                this.addGenericEditButton();
        }
    }

    // Add edit option before compression
    addEditBeforeCompress() {
        const compressButton = document.querySelector('button[type="submit"], .compress-btn, .btn-primary');
        if (compressButton) {
            const editFirstOption = document.createElement('div');
            editFirstOption.style.cssText = `
                margin: 1rem 0;
                padding: 1rem;
                background: linear-gradient(135deg, #f8fafc, #eef2ff);
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            `;
            editFirstOption.innerHTML = `
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                    <input type="checkbox" id="editBeforeCompress" style="width: 18px; height: 18px; accent-color: #667eea;">
                    <span style="color: #1e293b; font-weight: 500;">Edit PDF before compressing (opens professional editor)</span>
                </label>
            `;
            
            const checkbox = editFirstOption.querySelector('#editBeforeCompress');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked && this.currentFile) {
                    this.openEditor();
                }
            });
            
            compressButton.parentNode.insertBefore(editFirstOption, compressButton);
        }
    }

    // Add edit option before watermarking
    addEditBeforeWatermark() {
        const watermarkButton = document.querySelector('.apply-watermark-btn, button[type="submit"], .btn-primary');
        if (watermarkButton) {
            const editOption = document.createElement('button');
            editOption.className = 'btn-secondary';
            editOption.innerHTML = '<i class="fas fa-edit"></i> Edit PDF Before Watermarking';
            editOption.style.cssText = `
                margin-right: 1rem;
                padding: 0.75rem 1.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            `;
            
            editOption.addEventListener('mouseenter', () => {
                editOption.style.transform = 'translateY(-2px)';
                editOption.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
            });

            editOption.addEventListener('mouseleave', () => {
                editOption.style.transform = 'translateY(0)';
                editOption.style.boxShadow = 'none';
            });

            editOption.onclick = (e) => {
                e.preventDefault();
                this.openEditor();
            };
            
            watermarkButton.parentNode.insertBefore(editOption, watermarkButton);
        }
    }

    // Add edit option to individual files in merge
    addEditToIndividualFiles() {
        const fileInputs = document.querySelectorAll('input[type="file"][multiple]');
        fileInputs.forEach((input, index) => {
            const container = document.createElement('div');
            container.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            `;
            
            input.parentNode.insertBefore(container, input.nextSibling);
            container.appendChild(input);
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-small pdf-edit-file-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.style.cssText = `
                padding: 0.5rem 1rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                transition: all 0.2s ease;
                white-space: nowrap;
            `;
            
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.background = '#764ba2';
                editBtn.style.transform = 'translateY(-1px)';
            });

            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.background = '#667eea';
                editBtn.style.transform = 'translateY(0)';
            });

            editBtn.onclick = (e) => {
                e.preventDefault();
                if (input.files.length > 0) {
                    const file = input.files[0];
                    if (file.type === 'application/pdf') {
                        this.handlePDFUpload(file);
                        this.openEditor();
                    } else {
                        this.showNotification('Please select a PDF file first', 'warning');
                    }
                } else {
                    this.showNotification('Please select a PDF file first', 'warning');
                }
            };
            
            container.appendChild(editBtn);
        });
    }

    // Generic edit button for any tool
    addGenericEditButton() {
        const submitButtons = document.querySelectorAll('button[type="submit"], .btn-primary, .btn-main');
        submitButtons.forEach(button => {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-secondary';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit PDF First';
            editBtn.style.cssText = `
                margin-right: 1rem;
                padding: 0.75rem 1.5rem;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            `;
            
            editBtn.addEventListener('mouseenter', () => {
                editBtn.style.transform = 'translateY(-2px)';
                editBtn.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.4)';
            });

            editBtn.addEventListener('mouseleave', () => {
                editBtn.style.transform = 'translateY(0)';
                editBtn.style.boxShadow = 'none';
            });

            editBtn.onclick = (e) => {
                e.preventDefault();
                this.openEditor();
            };
            
            button.parentNode.insertBefore(editBtn, button);
        });
    }

    // Reset the integration (useful for SPA navigation)
    reset() {
        this.currentFile = null;
        this.fileId = null;
        this.editButtons = [];
        
        // Remove modal
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
            this.modal = null;
            this.iframe = null;
        }
        
        // Re-initialize
        this.isInitialized = false;
        this.init();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        try {
            const pdfEditor = new PDFEditorIntegration();
            pdfEditor.init();
            
            // Store in window for global access
            window.pdfEditor = pdfEditor;
            
            // Auto-integrate based on current page
            const currentPage = window.location.pathname;
            if (currentPage.includes('compress-pdf')) {
                pdfEditor.integrateWithTool('compress-pdf');
            } else if (currentPage.includes('watermark-pdf')) {
                pdfEditor.integrateWithTool('watermark-pdf');
            } else if (currentPage.includes('merge-pdf')) {
                pdfEditor.integrateWithTool('merge-pdf');
            } else if (currentPage.includes('split-pdf')) {
                pdfEditor.integrateWithTool('split-pdf');
            } else if (currentPage.includes('rotate-pdf')) {
                pdfEditor.integrateWithTool('rotate-pdf');
            }
            
            console.log('📚 PDF Editor Integration ready');
        } catch (error) {
            console.error('Failed to initialize PDF Editor Integration:', error);
        }
    }, 500);
});

// Handle page navigation for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Page changed, reset integration
        if (window.pdfEditor) {
            setTimeout(() => {
                window.pdfEditor.reset();
            }, 500);
        }
    }
}).observe(document, { subtree: true, childList: true });

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFEditorIntegration;
} else {
    window.PDFEditorIntegration = PDFEditorIntegration;
}