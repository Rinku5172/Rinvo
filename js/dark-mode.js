// Dark Mode Toggle Script
(function () {
    'use strict';

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Create dark mode toggle button
    function createDarkModeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.innerHTML = currentTheme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        toggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            // Update theme
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update icon with animation
            this.style.transform = 'rotate(360deg) scale(0.8)';
            setTimeout(() => {
                this.innerHTML = newTheme === 'dark'
                    ? '<i class="fas fa-sun"></i>'
                    : '<i class="fas fa-moon"></i>';
                this.style.transform = '';
            }, 150);
        });

        document.body.appendChild(toggle);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDarkModeToggle);
    } else {
        createDarkModeToggle();
    }
})();
