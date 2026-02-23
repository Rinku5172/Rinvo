/**
 * Lenis Smooth Scroll & Advanced Animations - COMPLETE FIXED VERSION
 * Handles all website animations, smooth scroll, and interactive effects
 */

class AnimationController {
    constructor() {
        this.lenis = null;
        this.animationFrame = null;
        this.parallaxElements = [];
        this.progressBar = null;
        this.intersectionObservers = [];
        this.isReducedMotion = false;
        this.init();
    }

    init() {
        // Check for reduced motion preference
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (this.isReducedMotion) {
            console.log('Reduced motion preference detected, skipping animations');
            this.initReducedMotion();
            return;
        }

        // Check if Lenis is available
        if (typeof Lenis === 'undefined') {
            console.warn('⚠️ Lenis library not loaded. Please include Lenis script for smooth scroll.');
            this.initFallback();
        } else {
            this.initLenis();
        }

        // Initialize all animation systems
        this.initScrollAnimations();
        this.initParallax();
        this.initMagneticButtons();
        this.initTiltCards();
        this.initScrollProgress();
        this.initStaggerAnimations();
        this.initFloatingAnimations();
        this.initTextReveal();
        this.initCounterAnimations();
        this.initMouseEffects();

        console.log('✅ Animation Controller initialized');
    }

    // Reduced motion mode - skip all animations
    initReducedMotion() {
        // Make all elements visible immediately
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, [data-animate], .stagger-item').forEach(el => {
            el.classList.add('active');
            el.style.opacity = '1';
            el.style.transform = 'none';
        });

        // Still handle anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'auto' });
                }
            });
        });
    }

    // Fallback when Lenis is not available
    initFallback() {
        console.log('📜 Running without smooth scroll (using native scroll)');
        
        // Handle anchor links with native smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    initLenis() {
        try {
            // Initialize Lenis with optimized settings
            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
                lerp: 0.1,
                wheelMultiplier: 1,
                orientation: 'vertical',
                gestureOrientation: 'vertical'
            });

            // Animation frame loop
            const raf = (time) => {
                if (this.lenis) {
                    this.lenis.raf(time);
                }
                this.animationFrame = requestAnimationFrame(raf);
            };
            this.animationFrame = requestAnimationFrame(raf);

            // Smooth scroll for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        const target = document.querySelector(targetId);
                        if (target && this.lenis) {
                            this.lenis.scrollTo(target, {
                                offset: -80,
                                duration: 1.5,
                                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                                immediate: false,
                                lock: true
                            });
                        }
                    }
                });
            });

            console.log('✨ Lenis smooth scroll initialized');
        } catch (error) {
            console.error('❌ Error initializing Lenis:', error);
            this.initFallback();
        }
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add active class with slight delay for smoother appearance
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, 50);
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedSelectors = [
            '.fade-in', 
            '.slide-in-left', 
            '.slide-in-right', 
            '.scale-in', 
            '[data-animate]',
            '.animate-on-scroll'
        ];
        
        animatedSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                observer.observe(el);
            });
        });

        this.intersectionObservers.push(observer);

        // Hero section - show immediately
        setTimeout(() => {
            document.querySelectorAll('.hero .fade-in, .hero .slide-in-left, .hero .slide-in-right, .hero .scale-in').forEach(el => {
                el.classList.add('active');
            });
        }, 100);
    }

    initParallax() {
        this.parallaxElements = document.querySelectorAll('.parallax');
        if (this.parallaxElements.length === 0) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    
                    this.parallaxElements.forEach(el => {
                        const speed = parseFloat(el.dataset.speed) || 0.3;
                        const direction = el.dataset.direction || 'up';
                        
                        let yPos;
                        if (direction === 'up') {
                            yPos = scrolled * speed;
                        } else if (direction === 'down') {
                            yPos = -(scrolled * speed);
                        } else {
                            yPos = (scrolled - (el.offsetTop - window.innerHeight)) * speed;
                        }
                        
                        // Limit movement
                        yPos = Math.min(Math.max(yPos, -150), 150);
                        
                        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    });
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }

    initMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic-btn, .btn-magnetic');
        if (magneticButtons.length === 0) return;

        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Calculate movement with limits
                const moveX = Math.min(Math.max(x * 0.2, -15), 15);
                const moveY = Math.min(Math.max(y * 0.2, -15), 15);

                btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.05)`;
                btn.style.transition = 'transform 0.1s cubic-bezier(0.23, 1, 0.32, 1)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
                btn.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
            });
        });
    }

    initTiltCards() {
        const tiltCards = document.querySelectorAll('.tilt-card, .card-tilt');
        if (tiltCards.length === 0) return;

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Calculate rotation with limits
                const rotateX = Math.min(Math.max((y - centerY) / 25, -8), 8);
                const rotateY = Math.min(Math.max((centerX - x) / 25, -8), 8);

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.transition = 'transform 0.1s ease-out';
                
                // Dynamic glare effect
                const glare = card.querySelector('.card-glare, .tilt-glare');
                if (glare) {
                    const glareX = (x / rect.width) * 100;
                    const glareY = (y / rect.height) * 100;
                    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)`;
                    glare.style.opacity = '1';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
                
                const glare = card.querySelector('.card-glare, .tilt-glare');
                if (glare) {
                    glare.style.background = 'none';
                    glare.style.opacity = '0';
                }
            });
        });
    }

    initScrollProgress() {
        // Remove existing progress bar
        const existingBar = document.querySelector('.scroll-progress, .scroll-indicator');
        if (existingBar) {
            existingBar.remove();
        }

        // Create new progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'scroll-progress';
        this.progressBar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.progressBar);

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const winScroll = document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = height > 0 ? (winScroll / height) : 0;
                    
                    if (this.progressBar) {
                        this.progressBar.style.transform = `scaleX(${scrolled})`;
                    }
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }

    initStaggerAnimations() {
        const staggerContainers = document.querySelectorAll('[data-stagger], .stagger-container, .stagger-grid');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.stagger-item, [data-stagger-item]');
                    
                    items.forEach((item, index) => {
                        const delay = parseInt(item.dataset.staggerDelay) || (index * 100);
                        setTimeout(() => {
                            item.classList.add('active');
                        }, delay);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

        staggerContainers.forEach(container => observer.observe(container));
        this.intersectionObservers.push(observer);
    }

    initFloatingAnimations() {
        // Add floating animations to specified elements
        const floatingElements = document.querySelectorAll('[data-float], .float-icon, .hero-icon');
        floatingElements.forEach(el => {
            el.classList.add('float-animation');
        });
    }

    initTextReveal() {
        const textReveals = document.querySelectorAll('.text-reveal, [data-text-reveal]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        textReveals.forEach(el => observer.observe(el));
        this.intersectionObservers.push(observer);
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('[data-counter], .stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
        this.intersectionObservers.push(observer);
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target) || parseInt(element.textContent) || 100;
        const duration = parseInt(element.dataset.duration) || 2000;
        const start = 0;
        const increment = target / (duration / 16);
        
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    initMouseEffects() {
        // Custom cursor effects (if enabled)
        const cursorEnabled = document.body.classList.contains('custom-cursor');
        if (!cursorEnabled) return;

        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });

        // Cursor hover effects
        document.querySelectorAll('a, button, .tool-card, .popular-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }

    // Utility: Add floating animation to element
    addFloatingAnimation(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('float-animation');
        });
    }

    // Utility: Add pulse animation to element
    addPulseAnimation(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('pulse-animation');
        });
    }

    // Utility: Add shimmer effect
    addShimmerEffect(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('shimmer-effect');
        });
    }

    // Utility: Smooth scroll to element
    scrollToElement(selector, offset = -80) {
        const element = document.querySelector(selector);
        if (!element) return;

        if (this.lenis) {
            this.lenis.scrollTo(element, {
                offset: offset,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        } else {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Utility: Refresh Lenis
    refresh() {
        if (this.lenis) {
            this.lenis.resize();
        }
    }

    // Clean up all observers and animations
    destroy() {
        // Destroy Lenis
        if (this.lenis) {
            this.lenis.destroy();
            this.lenis = null;
        }
        
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remove progress bar
        if (this.progressBar && this.progressBar.parentNode) {
            this.progressBar.parentNode.removeChild(this.progressBar);
            this.progressBar = null;
        }
        
        // Disconnect all observers
        this.intersectionObservers.forEach(observer => {
            observer.disconnect();
        });
        this.intersectionObservers = [];
        
        console.log('🧹 Animation Controller cleaned up');
    }
}

// Initialize animations when DOM is ready
let animationController = null;

// Safe initialization function
function initAnimations() {
    if (animationController) {
        animationController.destroy();
    }
    
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        try {
            animationController = new AnimationController();
            
            // Add floating animations to specific elements
            animationController.addFloatingAnimation('.hero-icon, .popular-icon, .feature-icon');
            
            // Add pulse animations to CTA buttons
            animationController.addPulseAnimation('.btn-signup, .btn-hero-primary, .cta-button');
            
            // Add shimmer to special elements
            animationController.addShimmerEffect('.badge, .tool-badge');
            
            window.animationController = animationController;
        } catch (error) {
            console.error('❌ Error initializing AnimationController:', error);
        }
    }, 200);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}

// Handle page transitions (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // Page changed, reinitialize animations
        initAnimations();
    }
}).observe(document, { subtree: true, childList: true });

// Refresh on window resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (animationController) {
            animationController.refresh();
        }
    }, 250);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (animationController) {
        animationController.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnimationController, initAnimations };
} else {
    window.AnimationController = AnimationController;
    window.initAnimations = initAnimations;
}

// Add required CSS styles
(function addAnimationStyles() {
    const styleId = 'animation-controller-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Floating Animation */
        .float-animation {
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        /* Pulse Animation */
        .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        /* Shimmer Effect */
        .shimmer-effect {
            position: relative;
            overflow: hidden;
        }
        
        .shimmer-effect::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent
            );
            transform: translateX(-100%);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        
        /* Scroll Progress Bar */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #7c3aed, #db2777);
            transform-origin: 0 50%;
            transform: scaleX(0);
            z-index: 99999;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3);
            pointer-events: none;
            transition: transform 0.1s ease;
        }
        
        /* Tilt Card Effects */
        .tilt-card {
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
            position: relative;
            overflow: hidden;
            will-change: transform;
        }
        
        .card-glare, .tilt-glare {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.3s ease;
            mix-blend-mode: overlay;
        }
        
        .tilt-card:hover .card-glare,
        .tilt-card:hover .tilt-glare {
            opacity: 1;
        }
        
        /* Magnetic Button */
        .magnetic-btn, .btn-magnetic {
            transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            will-change: transform;
            transform: translate3d(0, 0, 0);
        }
        
        /* Animation Base Classes */
        .fade-in,
        .slide-in-left,
        .slide-in-right,
        .scale-in,
        .stagger-item,
        [data-animate] {
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1),
                        transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            will-change: opacity, transform;
        }
        
        .fade-in.active {
            opacity: 1;
        }
        
        .slide-in-left {
            transform: translateX(-30px);
        }
        
        .slide-in-left.active {
            opacity: 1;
            transform: translateX(0);
        }
        
        .slide-in-right {
            transform: translateX(30px);
        }
        
        .slide-in-right.active {
            opacity: 1;
            transform: translateX(0);
        }
        
        .scale-in {
            transform: scale(0.9);
        }
        
        .scale-in.active {
            opacity: 1;
            transform: scale(1);
        }
        
        .stagger-item {
            opacity: 0;
            transform: translateY(20px);
        }
        
        .stagger-item.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Text Reveal Animation */
        .text-reveal {
            overflow: hidden;
            position: relative;
        }
        
        .text-reveal::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            transform: translateX(-100%);
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .text-reveal.revealed::after {
            transform: translateX(100%);
        }
        
        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
            .float-animation,
            .pulse-animation,
            .shimmer-effect::after,
            .fade-in,
            .slide-in-left,
            .slide-in-right,
            .scale-in,
            .stagger-item,
            .tilt-card {
                animation: none !important;
                transition: none !important;
                transform: none !important;
                opacity: 1 !important;
            }
            
            .scroll-progress {
                display: none;
            }
        }
    `;
    
    document.head.appendChild(style);
})();