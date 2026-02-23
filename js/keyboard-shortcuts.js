// Keyboard Shortcuts Manager
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            'ctrl+h': { action: 'goHome', description: 'Go to Homepage' },
            'ctrl+u': { action: 'uploadFile', description: 'Upload File' },
            'ctrl+d': { action: 'downloadFile', description: 'Download File' },
            'ctrl+k': { action: 'showShortcuts', description: 'Show Shortcuts' },
            'esc': { action: 'closeModal', description: 'Close Modal' },
            'ctrl+/': { action: 'showHelp', description: 'Show Help' }
        };
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.executeAction(this.shortcuts[key].action);
            }
        });

        // Create shortcuts modal
        this.createModal();
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');

        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift') {
            parts.push(key === 'escape' ? 'esc' : key);
        }

        return parts.join('+');
    }

    executeAction(action) {
        switch (action) {
            case 'goHome':
                window.location.href = '/index.html';
                break;
            case 'uploadFile':
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.click();
                break;
            case 'downloadFile':
                const downloadBtn = document.querySelector('[id*="download"], [id*="Download"]');
                if (downloadBtn && !downloadBtn.disabled) downloadBtn.click();
                break;
            case 'showShortcuts':
                this.showModal();
                break;
            case 'closeModal':
                this.hideModal();
                break;
            case 'showHelp':
                window.location.href = '/faq.html';
                break;
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 600px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #1e293b;">
                        <i class="fas fa-keyboard"></i> Keyboard Shortcuts
                    </h2>
                    <button onclick="keyboardShortcuts.hideModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="display: grid; gap: 1rem;">
                    ${Object.entries(this.shortcuts).map(([key, data]) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px;">
                            <span style="color: #475569;">${data.description}</span>
                            <kbd style="background: white; padding: 0.25rem 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: 600; color: #1e293b;">
                                ${key.toUpperCase()}
                            </kbd>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Initialize keyboard shortcuts
let keyboardShortcuts;
document.addEventListener('DOMContentLoaded', () => {
    keyboardShortcuts = new KeyboardShortcuts();
});
