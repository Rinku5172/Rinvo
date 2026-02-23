// Universal PDF Preview Modal Component
class PDFPreviewModal {
    constructor() {
        this.modal = null;
        this.pdfData = null;
        this.onDownload = null;
        this.init();
    }

    init() {
        // Create modal HTML
        const modalHTML = `
            <div class="pdf-preview-modal" id="pdfPreviewModal">
                <div class="preview-container">
                    <div class="preview-header">
                        <h3><i class="fas fa-eye"></i> Preview PDF</h3>
                        <button class="preview-close" onclick="pdfPreview.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="preview-content" id="previewContent">
                        <div class="preview-loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading preview...</p>
                        </div>
                    </div>
                    <div class="preview-footer">
                        <button class="preview-btn preview-btn-secondary" onclick="pdfPreview.close()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="preview-btn preview-btn-primary" onclick="pdfPreview.download()">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('pdfPreviewModal');

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    async show(pdfBytes, downloadCallback) {
        this.pdfData = pdfBytes;
        this.onDownload = downloadCallback;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        await this.renderPreview();
    }

    async renderPreview() {
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i><p>Rendering preview...</p></div>';

        try {
            // Load PDF with pdf.js
            const pdf = await pdfjsLib.getDocument({ data: this.pdfData }).promise;
            const numPages = pdf.numPages;
            const maxPages = Math.min(numPages, 5); // Preview first 5 pages

            let canvasHTML = '<div class="preview-canvas-container">';

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                canvasHTML += `
                    <div class="preview-page">
                        ${canvas.outerHTML}
                        <div class="preview-page-label">Page ${pageNum} of ${numPages}</div>
                    </div>
                `;
            }

            if (numPages > maxPages) {
                canvasHTML += `
                    <p style="color: #64748b; margin-top: 1rem;">
                        <i class="fas fa-info-circle"></i> Showing first ${maxPages} of ${numPages} pages
                    </p>
                `;
            }

            canvasHTML += '</div>';
            previewContent.innerHTML = canvasHTML;

        } catch (error) {
            previewContent.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Error loading preview: ${error.message}</p>
                </div>
            `;
        }
    }

    download() {
        if (this.onDownload) {
            this.onDownload();
            this.close();
        }
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.pdfData = null;
        this.onDownload = null;
    }
}

// Initialize global preview instance
let pdfPreview;
document.addEventListener('DOMContentLoaded', () => {
    pdfPreview = new PDFPreviewModal();
});
