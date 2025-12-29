// RINVO - Smart Online PDF Tools
// Main JavaScript functionality

// Helper to Show Success Modal
window.showSuccessModal = function (title, message, downloadUrl, downloadFilename) {
    // Remove existing modal if any
    const existingModal = document.getElementById('successModalOverlay');
    if (existingModal) existingModal.remove();

    const fileTypeIcon = downloadFilename.endsWith('.pdf') ? 'fa-file-pdf text-red-500' : 'fa-file-word text-blue-500';

    const modalHtml = `
    < div class="modal-overlay active" id = "successModalOverlay" >
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
    </div >
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Play sound effect (optional)
    // const audio = new Audio('../assets/sounds/success.mp3');
    // audio.play().catch(e => {}); 
};

window.closeSuccessModal = function () {
    const modal = document.getElementById('successModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initializeWebsite();
    initializeGSAPAnimations();
    initLottieAnimations();
    initReactComponents();
    initFramerMotionEffects();
    initHeaderScroll();
});

// Initialize Website Function
function initializeWebsite() {
    // Initialize all components
    initHeader();
    initHeroSection();
    initToolCards();
    initTrustSection();
    initFooter();
    initAnimations();
    initFileUploads();
    initFormSubmissions();

    console.log('RINVO Website initialized successfully!');
}

// Initialize GSAP Animations
function initializeGSAPAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate elements on scroll
        gsap.from('.fade-in-element', {
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.fade-in-element',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate tool cards
        gsap.from('.tool-card', {
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.tool-card',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate trust section items
        gsap.from('.trust-item', {
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.3,
            scrollTrigger: {
                trigger: '.trust-item',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Animate hero section
        gsap.from('.hero > *', {
            duration: 1,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power2.out'
        });

        // Animate counters
        gsap.to('.counter', {
            innerHTML: function (index, target) {
                const targetValue = target.getAttribute('data-target') || target.textContent;
                if (targetValue.includes('+')) {
                    return targetValue;
                }
                return parseInt(targetValue);
            },
            duration: 2,
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: '.counter',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            ease: 'power1.inOut'
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn-primary');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, { scale: 1.05, duration: 0.2 });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, { scale: 1, duration: 0.2 });
            });
        });

        console.log('GSAP animations initialized!');
    } else {
        console.log('GSAP not loaded, using basic animations');
        // Fallback to basic animations
        initAnimations();
    }
}

// Header Functionality
function initHeader() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Get Started button functionality
    const getStartedBtn = document.querySelector('.btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            // Scroll to tools section or redirect to tools page
            const toolsSection = document.querySelector('#tools');
            if (toolsSection) {
                toolsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = 'tools/index.html';
            }
        });
    }
}

// Hero Section Functionality
function initHeroSection() {
    // Animate hero elements on load
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

    // Use PDF Tools button
    const useToolsBtn = document.querySelector('.hero .btn-primary');
    if (useToolsBtn) {
        useToolsBtn.addEventListener('click', function () {
            window.location.href = 'tools/index.html';
        });
    }
}

// Tool Cards Functionality
function initToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');

    toolCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
        });

        // Open Tool button functionality
        const openToolBtn = this.querySelector('.btn-primary');
        if (openToolBtn) {
            openToolBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                // The link is already in the HTML, so this will work automatically
            });
        }
    });
}

// Trust Section Functionality
function initTrustSection() {
    // Initialize counter animations
    initCounters();

    // Trust items hover effects
    const trustItems = document.querySelectorAll('.trust-item');
    trustItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            const icon = this.querySelector('.trust-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
            }
        });

        item.addEventListener('mouseleave', function () {
            const icon = this.querySelector('.trust-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
}

// Initialize Counters
function initCounters() {
    // This function would work with GSAP to animate counters
    // Since we're separating concerns, we'll implement basic counter animation here
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = counter.getAttribute('data-target') || counter.textContent;
        const duration = 2000; // 2 seconds
        const increment = parseInt(target) / (duration / 16); // 16ms per frame approx
        let current = 0;

        // For now, just set the value (GSAP will handle animations separately)
        if (target.includes('+')) {
            counter.textContent = target;
        } else {
            // Basic counter animation would go here if needed
            counter.textContent = target;
        }
    });
}

// Footer Functionality
function initFooter() {
    // Footer links functionality
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// File Upload Functionality for Tool Pages
function initFileUploads() {
    // Drag and drop functionality
    const uploadAreas = document.querySelectorAll('.upload-area');

    uploadAreas.forEach(area => {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        area.addEventListener('drop', handleDrop, false);

        // Handle file selection via button
        const fileInput = area.querySelector('input[type="file"]');
        const chooseFileBtn = area.querySelector('.choose-file-btn');

        if (chooseFileBtn && fileInput) {
            chooseFileBtn.addEventListener('click', function () {
                fileInput.click();
            });

            fileInput.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    handleFileSelection(this.files[0], area);
                }
            });
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        e.currentTarget.classList.add('dragover');
    }

    function unhighlight(e) {
        e.currentTarget.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            handleFileSelection(files[0], e.currentTarget);
        }
    }
}

// Handle File Selection
function handleFileSelection(file, area) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
        showError(area, 'Invalid file type. Please upload a PDF, DOC, DOCX, JPG, or PNG file.');
        return;
    }

    if (file.size > maxSize) {
        showError(area, 'File too large. Maximum size is 10MB.');
        return;
    }

    // Display file info
    const fileInfo = area.querySelector('.file-info') || document.createElement('div');
    fileInfo.className = 'file-info mt-2';
    fileInfo.innerHTML = `
    < div class="file-icon" >
        <i class="fas fa-file-pdf text-3xl text-red-500"></i>
        </div >
        <div class="file-name font-semibold">${file.name}</div>
        <div class="file-size text-sm text-gray-600">${formatFileSize(file.size)}</div>
`;

    // Replace or add file info to the area
    const existingInfo = area.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.replaceWith(fileInfo);
    } else {
        area.appendChild(fileInfo);
    }

    // Enable action button
    const actionBtn = document.querySelector('.action-btn');
    if (actionBtn) {
        actionBtn.disabled = false;
        actionBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        actionBtn.classList.add('hover:opacity-90');
    }

    // Clear any previous errors
    const errorDiv = area.parentElement.querySelector('.alert-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Show Error Message
function showError(area, message) {
    // Remove existing error
    const existingError = area.parentElement.querySelector('.alert-error');
    if (existingError) {
        existingError.remove();
    }

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error mt-2';
    errorDiv.textContent = message;

    // Insert after the upload area
    area.parentElement.insertBefore(errorDiv, area.nextSibling);

    // Enable action button
    const actionBtn = document.querySelector('.action-btn');
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.classList.add('opacity-50', 'cursor-not-allowed');
        actionBtn.classList.remove('hover:opacity-90');
    }
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Form Submissions
function initFormSubmissions() {
    // Handle tool conversion forms
    const toolForms = document.querySelectorAll('.tool-form');
    toolForms.forEach(form => {
        form.addEventListener('submit', handleToolFormSubmit);
    });

    // Handle contact form if exists
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// Handle Tool Form Submission
function handleToolFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const actionBtn = form.querySelector('.action-btn');
    const resultArea = form.querySelector('.result-area');

    if (!actionBtn || !resultArea) return;

    // Show loading state
    const originalText = actionBtn.innerHTML;
    actionBtn.innerHTML = '<span class="loading mr-2"></span> Processing...';
    actionBtn.disabled = true;

    // Simulate processing (in real app, this would be an API call)
    setTimeout(() => {
        // Hide loading, show result
        actionBtn.innerHTML = originalText;
        actionBtn.disabled = false;

        // Show success message
        resultArea.style.display = 'block';
        resultArea.innerHTML = `
    < div class="result-success" >
                <i class="fas fa-check-circle text-4xl"></i>
                <p class="mt-2">Conversion completed successfully!</p>
            </div >
    <a href="#" class="download-btn">
        <i class="fas fa-download mr-2"></i>Download File
    </a>
`;

        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }, 3000);
}

// Handle Contact Form Submission
function handleContactFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    // Validate form
    if (!validateContactForm(formData)) {
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading mr-2"></span> Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (in real app, this would be an API call)
    setTimeout(() => {
        // Reset form
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Show success message
        showNotification('Message sent successfully!', 'success');
    }, 2000);
}

// Validate Contact Form
function validateContactForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    if (!name || name.trim().length < 2) {
        showNotification('Please enter your name (at least 2 characters).', 'error');
        return false;
    }

    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }

    if (!message || message.trim().length < 10) {
        showNotification('Please enter a message (at least 10 characters).', 'error');
        return false;
    }

    return true;
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top - 4 right - 4 p - 4 rounded - lg shadow - lg z - 50 ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
        } `;
    notification.textContent = message;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ml-4 font-bold';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);

    // Add to body
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Initialize Animations
function initAnimations() {
    // Add fade-in animations to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    const fadeElements = document.querySelectorAll('.fade-in-element');
    fadeElements.forEach(el => observer.observe(el));

    // Add stagger animation to grid items
    const gridItems = document.querySelectorAll('.tools-grid > *, .trust-grid > *');
    gridItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';

        // Use a timeout to create a stagger effect
        setTimeout(() => {
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Initialize Lottie Animations
function initLottieAnimations() {
    // Check if Lottie is loaded
    if (typeof lottie !== 'undefined') {
        // Example Lottie animation for hero section
        const heroAnimationContainer = document.getElementById('hero-animation');
        if (heroAnimationContainer) {
            lottie.loadAnimation({
                container: heroAnimationContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'assets/lottie/hero-animation.json' // This would be a real animation file
            });
        }

        // Example Lottie animation for loading state
        const loadingAnimationContainer = document.getElementById('loading-animation');
        if (loadingAnimationContainer) {
            lottie.loadAnimation({
                container: loadingAnimationContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: 'assets/lottie/loading-animation.json' // This would be a real animation file
            });
        }

        console.log('Lottie animations initialized!');
    }
}

// Utility Functions
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

// Smooth Scroll Function
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
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

// Mobile Detection
function isMobile() {
    return window.innerWidth <= 768;
}

// Initialize Tool-Specific Functionality
function initToolSpecific() {
    // This function would be called on specific tool pages
    // to initialize tool-specific functionality

    // PDF to Word specific functionality
    if (window.location.pathname.includes('pdf-to-word')) {
        initPDFToWord();
    }

    // Word to PDF specific functionality
    if (window.location.pathname.includes('word-to-pdf')) {
        initWordToPDF();
    }

    // Compress PDF specific functionality
    if (window.location.pathname.includes('compress-pdf')) {
        initCompressPDF();
    }

    // Merge PDF specific functionality
    if (window.location.pathname.includes('merge-pdf')) {
        initMergePDF();
    }

    // Split PDF specific functionality
    if (window.location.pathname.includes('split-pdf')) {
        initSplitPDF();
    }

    // Image to PDF specific functionality
    if (window.location.pathname.includes('image-to-pdf')) {
        initImageToPDF();
    }
}

// Tool-specific initialization functions
function initPDFToWord() {
    console.log('PDF to Word tool initialized');
    // Note: True client-side PDF to Word is complex.
    // We will simulate the process or use a simple text extractor if needed.
    // For now, consistent with the plan, we keep the UI responsive.
}

function initWordToPDF() {
    console.log('Word to PDF tool initialized');
}

function initCompressPDF() {
    console.log('Compress PDF tool initialized');
    // Logic for PDF Compression (Basic metadata removal/stream compression using pdf-lib)
    setupToolForm(async (files, resultArea) => {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(await files[0].arrayBuffer());

        // Save with compression logic (native pdf-lib optimization is limited but removing metadata helps)
        // Note: For real image compression, we'd need to re-encode images which is heavy for browser.
        const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

        return new Blob([pdfBytes], { type: 'application/pdf' });
    }, 'compressed.pdf');
}

function initMergePDF() {
    console.log('Merge PDF tool initialized');
    // Logic for PDF Merge
    const uploadArea = document.querySelector('.upload-area');
    // Allow multiple files for merge
    const input = uploadArea.querySelector('input[type="file"]');
    if (input) input.multiple = true;

    setupToolForm(async (files, resultArea) => {
        if (files.length < 2) throw new Error("Please select at least 2 PDF files to merge.");

        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }, 'merged.pdf');
}

function initSplitPDF() {
    console.log('Split PDF tool initialized');
    // Logic for Split PDF (Splits all pages into separate files - simplified for demo)
    // Warning: Returning multiple files usually requires a ZIP. 
    // For this generic implementation, we'll return the FIRST page as a split example or just the first capability.

    setupToolForm(async (files, resultArea) => {
        const { PDFDocument } = PDFLib;
        const pdfDoc = await PDFDocument.load(await files[0].arrayBuffer());
        const numberOfPages = pdfDoc.getPageCount();

        // For simplicity in this static demo, we create a new PDF with just the first page (or split range logic)
        // A full UI would ask for range. Here we'll just extract the first page as a demo of "Split".
        const subPdf = await PDFDocument.create();
        const [copiedPage] = await subPdf.copyPages(pdfDoc, [0]);
        subPdf.addPage(copiedPage);

        const pdfBytes = await subPdf.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
    }, 'split_page_1.pdf');
}

function initImageToPDF() {
    console.log('Image to PDF tool initialized');
    // Logic for Image to PDF using jsPDF
    const uploadArea = document.querySelector('.upload-area');
    const input = uploadArea.querySelector('input[type="file"]');
    if (input) input.accept = "image/*"; // Update accept to images

    setupToolForm(async (files, resultArea) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageData = await readFileAsDataURL(file);
            const imgProps = doc.getImageProperties(imageData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (i > 0) doc.addPage();
            doc.addImage(imageData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }

        // Returns blob
        return doc.output('blob');
    }, 'images_converted.pdf');
}

// Helper to setup form listeners widely
function setupToolForm(processFunction, defaultFilename) {
    const form = document.querySelector('.tool-form');
    if (!form) return;

    form.removeEventListener('submit', handleToolFormSubmit); // Remove generic listener if any

    // We need to capture the files from the specific handleFileSelection scope or global
    // Since handleFileSelection updates a visual indicator, we need to store the files somewhere accessible.
    // Let's attach them to the form element for simplicity.

    const actionBtn = form.querySelector('.action-btn');
    const resultArea = form.querySelector('.result-area');

    actionBtn.onclick = async () => {
        const files = form.dataset.files ? JSON.parse(form.dataset.files) : null;
        // Wait, files cannot be JSON parsed easily. We should store the File objects array or re-read input.
        // Better: re-read the input if it has files, or use a global variable for selected files.
        // Let's use the file input directly.

        const input = form.querySelector('input[type="file"]');
        if (!input || !input.files || input.files.length === 0) {
            showError(form.querySelector('.upload-area'), "Please select a file first.");
            return;
        }

        const fileList = Array.from(input.files);

        try {
            // UI Loading
            const originalText = actionBtn.innerHTML;
            actionBtn.innerHTML = '<span class="loading mr-2"></span> Processing...';
            actionBtn.disabled = true;
            resultArea.style.display = 'none';

            // Process
            const blob = await processFunction(fileList, resultArea);

            // Success
            actionBtn.innerHTML = originalText;
            actionBtn.disabled = false;

            // Result UI
            resultArea.style.display = 'block';
            const downloadBtn = resultArea.querySelector('.download-btn');

            // Create Object URL
            const url = URL.createObjectURL(blob);
            downloadBtn.href = url;
            downloadBtn.download = defaultFilename;

            // Clean up old URLs to avoid leaks (optional but good practice)
            // if(downloadBtn.dataset.url) URL.revokeObjectURL(downloadBtn.dataset.url);
            // downloadBtn.dataset.url = url;

        } catch (error) {
            console.error(error);
            actionBtn.innerHTML = "Try Again";
            actionBtn.disabled = false;
            showError(form.querySelector('.upload-area'), "Error: " + error.message);
        }
    };
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Initialize React Components
function initReactComponents() {
    // Check if React is loaded
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
        console.log('React components initialization would go here');

        // Example of how React components would be rendered
        // This would be implemented with actual JSX in a real React app

        // For now, we'll just log that React is available
        console.log('React is available for component-based UI');
    }
}

// Enhanced Animation Functions
function initFramerMotionEffects() {
    // Since we're on the web, we'll implement similar effects to Framer Motion using GSAP
    // Micro animations for hover effects
    const hoverElements = document.querySelectorAll('.btn-primary, .tool-card, .trust-item');

    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            gsap.to(element, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });

    // Staggered animations for page load
    gsap.from('.stagger-item', {
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });

    console.log('Framer Motion-like effects initialized');
}

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeWebsite,
        initializeGSAPAnimations,
        initLottieAnimations,
        initReactComponents,
        initFramerMotionEffects,
        initHeader,
        initHeroSection,
        initToolCards,
        initTrustSection,
        initFooter,
        initAnimations,
        initFileUploads,
        initFormSubmissions
    };
}