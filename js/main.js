/**
 * RocketPDF - Smart Online PDF Tools
 * Complete Fixed Version - Main JavaScript functionality
 */

// ==================== GLOBAL VARIABLES ====================
const RocketPDF = {
    config: {
        apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:8002/api' : '/api',
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ],
        debug: true
    },
    currentFile: null,
    currentTool: null,
    animations: {
        observer: null,
        gsapLoaded: false
    }
};

// ==================== UTILITY FUNCTIONS ====================

// Console logger with debug flag
function log(message, type = 'log', data = null) {
    if (!RocketPDF.config.debug) return;
    
    const prefix = '🚀 RocketPDF:';
    if (type === 'error') {
        console.error(prefix, message, data || '');
    } else if (type === 'warn') {
        console.warn(prefix, message, data || '');
    } else {
        console.log(prefix, message, data || '');
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Mobile detection
function isMobile() {
    return window.innerWidth <= 768;
}

// Read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ==================== MODAL FUNCTIONS ====================

window.showSuccessModal = function(title, message, downloadUrl, downloadFilename) {
    // Remove existing modal if any
    const existingModal = document.getElementById('successModalOverlay');
    if (existingModal) existingModal.remove();

    const fileTypeIcon = downloadFilename.endsWith('.pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-word text-blue-500';

    const modalHtml = `
        <div class="modal-overlay active" id="successModalOverlay">
            <div class="success-modal-card animate-scale-in">
                <div class="modal-close" onclick="closeSuccessModal()">
                    <i class="fas fa-times"></i>
                </div>

                <div class="success-header mb-6">
                    <div class="success-checkmark mb-4">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 class="modal-title text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">${title}</h2>
                    <p class="modal-message text-gray-500">${message}</p>
                </div>

                <!-- File Preview Card -->
                <div class="file-preview-card bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex items-center shadow-sm">
                    <div class="preview-icon w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mr-4">
                        <i class="fas ${fileTypeIcon} text-2xl"></i>
                    </div>
                    <div class="preview-info text-left flex-1 overflow-hidden">
                        <h4 class="font-semibold text-gray-800 truncate">${downloadFilename}</h4>
                        <p class="text-xs text-green-600 font-medium">Ready to download</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="modal-actions flex gap-3">
                    <a href="${downloadUrl}" download="${downloadFilename}" class="btn-download flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-3 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center group">
                        <i class="fas fa-download mr-2 group-hover:animate-bounce"></i> Download
                    </a>
                    <button onclick="closeSuccessModal()" class="btn-secondary flex-1 bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all text-center">
                        Convert Again
                    </button>
                </div>

                <div class="mt-4 text-xs text-gray-400">
                    Files are automatically deleted after 1 hour
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    log('Success modal shown', 'log', { title, downloadFilename });
};

window.closeSuccessModal = function() {
    const modal = document.getElementById('successModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icons based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info} notification-icon"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            min-width: 300px;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border-left: 4px solid;
        }
        
        .notification.success .notification-content {
            border-left-color: #10b981;
        }
        
        .notification.error .notification-content {
            border-left-color: #ef4444;
        }
        
        .notification.warning .notification-content {
            border-left-color: #f59e0b;
        }
        
        .notification.info .notification-content {
            border-left-color: #3b82f6;
        }
        
        .notification-icon {
            font-size: 1.5rem;
        }
        
        .notification.success .notification-icon {
            color: #10b981;
        }
        
        .notification.error .notification-icon {
            color: #ef4444;
        }
        
        .notification.warning .notification-icon {
            color: #f59e0b;
        }
        
        .notification.info .notification-icon {
            color: #3b82f6;
        }
        
        .notification-message {
            flex: 1;
            font-size: 0.95rem;
            font-weight: 500;
            color: #1e293b;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            font-size: 1rem;
            transition: color 0.2s;
        }
        
        .notification-close:hover {
            color: #64748b;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
    
    log('Notification shown', 'log', { message, type });
}

// ==================== ERROR HANDLING ====================

function showError(area, message) {
    // Remove existing error
    const existingError = area.parentElement?.querySelector('.alert-error');
    if (existingError) existingError.remove();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error mt-2';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle mr-2"></i>
        ${message}
    `;

    // Insert after the upload area
    if (area.parentElement) {
        area.parentElement.insertBefore(errorDiv, area.nextSibling);
    } else {
        area.appendChild(errorDiv);
    }

    // Disable action button
    const actionBtn = document.querySelector('.action-btn');
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        actionBtn.classList.remove('hover:opacity-90');
    }
    
    log('Error shown', 'error', message);
}

// ==================== ANIMATION FUNCTIONS ====================

function initGSAPAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        log('GSAP not loaded, using basic animations', 'warn');
        RocketPDF.animations.gsapLoaded = false;
        initBasicAnimations();
        return;
    }

    try {
        // Register ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        RocketPDF.animations.gsapLoaded = true;
        log('GSAP animations initialized');

        // Animate hero section
        gsap.from('.hero > *', {
            duration: 1,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power2.out'
        });

        // Animate tool cards on scroll
        gsap.from('.tool-card', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.tools-grid',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate trust items
        gsap.from('.trust-item', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.trust-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate counters
        gsap.to('.counter', {
            innerHTML: function(index, target) {
                const targetValue = target.getAttribute('data-target') || target.textContent;
                return parseInt(targetValue) || 0;
            },
            duration: 2,
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: '.stats-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            ease: 'power1.inOut'
        });

        // Button hover effects
        gsap.utils.toArray('.btn-primary, .btn-secondary, .tool-card').forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, { scale: 1.05, duration: 0.2 });
            });
            button.addEventListener('mouseleave', () => {
                gsap.to(button, { scale: 1, duration: 0.2 });
            });
        });

    } catch (error) {
        log('GSAP initialization error', 'error', error);
        initBasicAnimations();
    }
}

function initBasicAnimations() {
    log('Using basic CSS animations');

    // Add fade-in class to elements
    document.querySelectorAll('.hero > *, .tool-card, .trust-item').forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.animationDelay = `${index * 0.1}s`;
    });

    // Simple hover effects
    document.querySelectorAll('.tool-card, .btn-primary, .btn-secondary').forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initLottieAnimations() {
    if (typeof lottie === 'undefined') {
        log('Lottie not loaded', 'warn');
        return;
    }

    try {
        const heroAnimation = document.getElementById('hero-animation');
        if (heroAnimation) {
            lottie.loadAnimation({
                container: heroAnimation,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: '/assets/lottie/hero-animation.json'
            });
        }

        const loadingAnimation = document.getElementById('loading-animation');
        if (loadingAnimation) {
            lottie.loadAnimation({
                container: loadingAnimation,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: '/assets/lottie/loading-animation.json'
            });
        }

        log('Lottie animations initialized');
    } catch (error) {
        log('Lottie initialization error', 'error', error);
    }
}

// ==================== HEADER FUNCTIONALITY ====================

function initHeader() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    // Mobile menu functionality
    if (mobileMenuBtn && mobileNavMenu && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNavMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMenu = () => {
            mobileNavMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeMobileMenuBtn) {
            closeMobileMenuBtn.addEventListener('click', closeMenu);
        }

        mobileMenuOverlay.addEventListener('click', closeMenu);

        // Close on link click
        mobileNavMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Get Started button
    const getStartedBtn = document.querySelector('.btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            const toolsSection = document.querySelector('#tools');
            if (toolsSection) {
                toolsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = '/tools/';
            }
        });
    }
    
    log('Header initialized');
}

// ==================== HERO SECTION ====================

function initHeroSection() {
    const heroElements = document.querySelectorAll('.hero > *');
    
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });

    const useToolsBtn = document.querySelector('.hero .btn-primary');
    if (useToolsBtn) {
        useToolsBtn.addEventListener('click', () => {
            window.location.href = '/tools/';
        });
    }
    
    log('Hero section initialized');
}

// ==================== TOOL CARDS ====================

function initToolCards() {
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 20px 30px -10px rgba(37, 99, 235, 0.2)';
            this.style.transition = 'all 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
        });
    });
    
    log('Tool cards initialized');
}

// ==================== TRUST SECTION ====================

function initTrustSection() {
    document.querySelectorAll('.trust-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.trust-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });

        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.trust-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
    
    log('Trust section initialized');
}

// ==================== FOOTER ====================

function initFooter() {
    // Footer links functionality
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    log('Footer initialized');
}

// ==================== FILE UPLOAD ====================

function initFileUploads() {
    document.querySelectorAll('.upload-area').forEach(area => {
        const fileInput = area.querySelector('input[type="file"]');
        const chooseFileBtn = area.querySelector('.choose-file-btn');

        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, () => {
                area.classList.remove('dragover');
            }, false);
        });

        area.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) {
                handleFileSelection(files[0], area);
                if (fileInput) {
                    fileInput.files = files;
                }
            }
        }, false);

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    handleFileSelection(e.target.files[0], area);
                }
            });
        }

        // Browse button click
        if (chooseFileBtn && fileInput) {
            chooseFileBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    log('File upload initialized');
}

function handleFileSelection(file, area) {
    // Validate file type
    if (!RocketPDF.config.allowedTypes.includes(file.type)) {
        showError(area, 'Invalid file type. Please upload a PDF, DOC, DOCX, JPG, or PNG file.');
        return;
    }

    // Validate file size
    if (file.size > RocketPDF.config.maxFileSize) {
        showError(area, `File too large. Maximum size is ${RocketPDF.config.maxFileSize / 1024 / 1024}MB.`);
        return;
    }

    // Store file
    RocketPDF.currentFile = file;

    // Display file info
    let fileInfo = area.querySelector('.file-info');
    if (!fileInfo) {
        fileInfo = document.createElement('div');
        fileInfo.className = 'file-info mt-2';
        area.appendChild(fileInfo);
    }

    fileInfo.innerHTML = `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="file-icon">
                <i class="fas ${file.type === 'application/pdf' ? 'fa-file-pdf text-red-500' : 'fa-file-word text-blue-500'} text-2xl"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="file-name font-semibold text-gray-800 truncate">${file.name}</div>
                <div class="file-size text-sm text-gray-600">${formatFileSize(file.size)}</div>
            </div>
            <button class="remove-file text-gray-400 hover:text-red-500 transition-colors" onclick="this.closest('.file-info').remove(); RocketPDF.currentFile = null;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Enable action button
    const actionBtn = document.querySelector('.action-btn');
    if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // Clear errors
    const errorDiv = area.parentElement?.querySelector('.alert-error');
    if (errorDiv) errorDiv.remove();
    
    log('File selected', 'log', { name: file.name, size: file.size });
}

// ==================== FORM SUBMISSIONS ====================

function initFormSubmissions() {
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Tool forms
    document.querySelectorAll('.tool-form').forEach(form => {
        form.addEventListener('submit', handleToolFormSubmit);
    });
    
    log('Form submissions initialized');
}

function handleContactFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Validate form
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || name.trim().length < 2) {
        showNotification('Please enter your name (at least 2 characters).', 'error');
        return;
    }

    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    if (!message || message.trim().length < 10) {
        showNotification('Please enter a message (at least 10 characters).', 'error');
        return;
    }

    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Message sent successfully!', 'success');
        log('Contact form submitted');
    }, 1500);
}

function handleToolFormSubmit(e) {
    e.preventDefault();

    if (!RocketPDF.currentFile) {
        showNotification('Please select a file first', 'warning');
        return;
    }

    const form = e.target;
    const actionBtn = form.querySelector('.action-btn');
    const resultArea = form.querySelector('.result-area');

    if (!actionBtn || !resultArea) return;

    // Show loading
    const originalText = actionBtn.innerHTML;
    actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    actionBtn.disabled = true;

    // Determine tool from URL
    const tool = window.location.pathname.split('/').pop().replace('.html', '');
    RocketPDF.currentTool = tool;

    // Process based on tool
    processTool(tool, RocketPDF.currentFile)
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const filename = `converted_${RocketPDF.currentFile.name.replace(/\.[^/.]+$/, '')}.${getOutputExtension(tool)}`;

            showSuccessModal(
                'Conversion Complete!',
                'Your file has been processed successfully.',
                url,
                filename
            );

            resultArea.style.display = 'block';
            const downloadBtn = resultArea.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.href = url;
                downloadBtn.download = filename;
            }

            actionBtn.innerHTML = originalText;
            actionBtn.disabled = false;
            
            log('Tool processed successfully', 'log', { tool, filename });
        })
        .catch(error => {
            showNotification('Processing failed: ' + error.message, 'error');
            actionBtn.innerHTML = originalText;
            actionBtn.disabled = false;
            log('Tool processing error', 'error', error);
        });
}

// ==================== TOOL PROCESSING ====================

async function processTool(tool, file) {
    // Client-side processing for tools
    switch(tool) {
        case 'compress-pdf':
            return await compressPDF(file);
        case 'merge-pdf':
            return await mergePDF(file);
        case 'split-pdf':
            return await splitPDF(file);
        case 'pdf-to-word':
            return await convertPDFToWord(file);
        case 'word-to-pdf':
            return await convertWordToPDF(file);
        case 'image-to-pdf':
            return await convertImageToPDF(file);
        default:
            // Try server-side processing
            return await uploadFileToServer(`/api/${tool}`, file);
    }
}

async function compressPDF(file) {
    if (typeof PDFLib === 'undefined') {
        throw new Error('PDF library not loaded');
    }

    const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function mergePDF(file) {
    // For merge, we need multiple files
    // This is simplified - in real implementation, get all files from input
    throw new Error('Merge tool requires multiple files - use the specific merge tool page');
}

async function splitPDF(file) {
    if (typeof PDFLib === 'undefined') {
        throw new Error('PDF library not loaded');
    }

    const pdfDoc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const newPdf = await PDFLib.PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    newPdf.addPage(firstPage);
    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

async function convertPDFToWord(file) {
    // Client-side PDF to Word is limited
    // Try server API first, then fallback
    try {
        return await uploadFileToServer('/api/pdf-to-word', file);
    } catch {
        // Fallback to text extraction
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            text += strings.join(' ') + '\n\n';
        }

        // Create a simple text file as fallback
        return new Blob([text], { type: 'text/plain' });
    }
}

async function convertWordToPDF(file) {
    // Try server API first
    try {
        return await uploadFileToServer('/api/word-to-pdf', file);
    } catch {
        throw new Error('Word to PDF conversion requires server API. Please try again later.');
    }
}

async function convertImageToPDF(file) {
    if (typeof jspdf === 'undefined') {
        throw new Error('jsPDF library not loaded');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const imageData = await readFileAsDataURL(file);
    const imgProps = doc.getImageProperties(imageData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    doc.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    return doc.output('blob');
}

async function uploadFileToServer(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || 'Upload failed');
    }

    return await response.blob();
}

function getOutputExtension(tool) {
    const extensions = {
        'compress-pdf': 'pdf',
        'merge-pdf': 'pdf',
        'split-pdf': 'pdf',
        'pdf-to-word': 'docx',
        'word-to-pdf': 'pdf',
        'image-to-pdf': 'pdf'
    };
    return extensions[tool] || 'pdf';
}

// ==================== SCROLL EFFECTS ====================

function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }

        lastScroll = currentScroll;
    });
}

// ==================== INITIALIZATION ====================

function initializeWebsite() {
    log('Initializing RocketPDF website...');

    // Initialize all components
    initHeader();
    initHeroSection();
    initToolCards();
    initTrustSection();
    initFooter();
    initFileUploads();
    initFormSubmissions();
    initGSAPAnimations();
    initLottieAnimations();
    initHeaderScroll();

    // Check for API health
    fetch(`${RocketPDF.config.apiUrl}/health`)
        .then(response => {
            if (response.ok) {
                log('API connection successful');
            } else {
                log('API connection failed, using client-side only', 'warn');
            }
        })
        .catch(() => {
            log('API not available, using client-side only', 'warn');
        });

    log('RocketPDF website initialized successfully!');
}

// ==================== DOM CONTENT LOADED ====================

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(initializeWebsite, 100);
});

// ==================== EXPORTS ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RocketPDF,
        showNotification,
        showSuccessModal,
        formatFileSize,
        isValidEmail,
        isMobile
    };
}

// ==================== ADDITIONAL STYLES ====================

// Add loading spinner styles
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .dragover {
        border-color: #3b82f6 !important;
        background-color: rgba(59, 130, 246, 0.05) !important;
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease-out forwards;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);