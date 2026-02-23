// Careers Page Interactive Functionality

// Tool filtering by category
const toolCards = document.querySelectorAll('.tool-card');
const categoryFilters = document.querySelectorAll('.category-filter');

if (categoryFilters.length > 0) {
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.dataset.category;

            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            // Filter tools
            toolCards.forEach(card => {
                const cardCategory = card.querySelector('.tool-category').textContent;
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all animatable elements
document.querySelectorAll('.tool-card, .job-card, .benefit-card').forEach(el => {
    observer.observe(el);
});

// Form validation
const applicationForm = document.getElementById('applicationForm');

if (applicationForm) {
    applicationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(applicationForm);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (!data.fullName || !data.email || !data.position || !data.experience || !data.coverLetter) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Validate resume upload
        const resumeFile = document.getElementById('resume').files[0];
        if (!resumeFile) {
            showNotification('Please upload your resume', 'error');
            return;
        }

        // Check file size (5MB max)
        if (resumeFile.size > 5 * 1024 * 1024) {
            showNotification('Resume file size must be less than 5MB', 'error');
            return;
        }

        // Show loading state
        const submitBtn = applicationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate submission (replace with actual API call)
        setTimeout(() => {
            showNotification('Thank you for your application! We will review it and get back to you soon.', 'success');
            applicationForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Reset file upload display
            const fileUpload = document.querySelector('.file-upload');
            fileUpload.innerHTML = `
                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #667eea; margin-bottom: 0.5rem;"></i>
                <p style="margin: 0; color: #64748b;">Click to upload your resume (PDF, DOC, DOCX)</p>
                <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #94a3b8;">Max file size: 5MB</p>
                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required>
            `;
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem;">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
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

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Initialize counters when visible
const counters = document.querySelectorAll('.counter');
if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// Job card expand/collapse
const jobCards = document.querySelectorAll('.job-card');
jobCards.forEach(card => {
    const requirements = card.querySelector('.job-requirements');
    if (requirements) {
        // Initially collapsed on mobile
        if (window.innerWidth < 768) {
            requirements.style.maxHeight = '0';
            requirements.style.overflow = 'hidden';
            requirements.style.transition = 'max-height 0.3s ease';

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = 'Show Requirements';
            toggleBtn.className = 'btn-secondary';
            toggleBtn.style.marginTop = '1rem';
            toggleBtn.onclick = () => {
                if (requirements.style.maxHeight === '0px') {
                    requirements.style.maxHeight = requirements.scrollHeight + 'px';
                    toggleBtn.textContent = 'Hide Requirements';
                } else {
                    requirements.style.maxHeight = '0';
                    toggleBtn.textContent = 'Show Requirements';
                }
            };
            requirements.parentElement.insertBefore(toggleBtn, requirements);
        }
    }
});

console.log('🚀 RocketPDF Careers page loaded successfully!');
