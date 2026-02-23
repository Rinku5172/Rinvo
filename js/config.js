/**
 * RocketPDF Global Configuration
 * 
 * This file manages the connection between the frontend and backend.
 * 
 * MODES:
 * - 'CLIENT': Uses browser-based libraries (pdf.js, pdf-lib) to process files.
 *             Works immediately on static hosting (Firebase, GitHub Pages).
 *             No data leaves the user's computer.
 * 
 * - 'SERVER': Sends files to the backend API for processing.
 *             Requires a running backend server (Railway, Render, localhost).
 *             Better quality for complex conversions (PDF to Word).
 */

const CONFIG = {
    // Current Mode: 'CLIENT' or 'SERVER'
    // Defaulting to CLIENT so it works on the live site immediately
    mode: 'CLIENT',

    // API Configuration (Only used when mode is 'SERVER')
    api: {
        // Local backend URL for testing
        local: 'http://localhost:3000/api',

        // Production backend URL (Replace with your Railway/Render URL)
        // Example: 'https://rocketpdf-backend.railway.app/api'
        production: 'https://YOUR-BACKEND-URL.railway.app/api',

        // Helper to get the correct URL based on hostname
        get baseUrl() {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return this.local;
            }
            return this.production;
        }
    },

    // Feature Flags - Toggle specific features
    features: {
        enableOcr: true,       // Enable OCR in client mode (uses Tesseract.js)
        enableDarkTheme: true, // Allow users to switch themes
        showDebugInfo: false   // Show console logs for debugging
    },

    // Metadata
    app: {
        name: 'RocketPDF PDF Tools',
        version: '2.0.0',
        author: 'RocketPDF Team'
    }
};

// Freeze to prevent accidental modification
Object.freeze(CONFIG.api);

// Export for module usage or attach to window for script usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.ROCKETPDF_CONFIG = CONFIG;
}
