const QRCode = require('qrcode');
const { ipcRenderer } = require('electron');

class QRGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setupIPC();
    }

    initializeElements() {
        this.form = document.getElementById('qr-form');
        this.urlInput = document.getElementById('url-input');
        this.sizeSelect = document.getElementById('size-select');
        this.generateBtn = document.getElementById('generate-btn');
        this.qrContainer = document.getElementById('qr-container');
        this.placeholder = document.getElementById('placeholder');
        this.qrCanvas = document.getElementById('qr-code');
        this.actions = document.getElementById('actions');
        this.saveBtn = document.getElementById('save-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.message = document.getElementById('message');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.saveBtn.addEventListener('click', () => this.saveQRCode());
        this.clearBtn.addEventListener('click', () => this.clearForm());
        this.urlInput.addEventListener('input', () => this.clearMessage());
        
        // Auto-generate on URL change (with debounce)
        let debounceTimer;
        this.urlInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (this.isValidUrl(this.urlInput.value)) {
                    this.generateQRCode();
                }
            }, 500);
        });
    }

    setupIPC() {
        // Listen for menu commands
        ipcRenderer.on('clear-form', () => {
            this.clearForm();
        });

        ipcRenderer.on('save-qr', () => {
            if (this.qrCanvas.style.display !== 'none') {
                this.saveQRCode();
            }
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.generateQRCode();
    }

    async generateQRCode() {
        const url = this.urlInput.value.trim();
        const size = parseInt(this.sizeSelect.value);

        if (!url) {
            this.showMessage('Please enter a URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showMessage('Please enter a valid URL', 'error');
            return;
        }

        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';

        try {
            const options = {
                width: size,
                height: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            await QRCode.toCanvas(this.qrCanvas, url, options);
            
            this.showQRCode();
            this.showMessage('QR Code generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showMessage('Error generating QR code. Please try again.', 'error');
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'Generate QR Code';
        }
    }

    showQRCode() {
        this.placeholder.style.display = 'none';
        this.qrCanvas.style.display = 'block';
        this.qrContainer.classList.add('has-qr');
        this.actions.style.display = 'flex';
    }

    hideQRCode() {
        this.placeholder.style.display = 'block';
        this.qrCanvas.style.display = 'none';
        this.qrContainer.classList.remove('has-qr');
        this.actions.style.display = 'none';
    }

    async saveQRCode() {
        if (this.qrCanvas.style.display === 'none') {
            this.showMessage('No QR code to save', 'error');
            return;
        }

        try {
            const imageData = this.qrCanvas.toDataURL('image/png');
            const url = this.urlInput.value.trim();
            const domain = new URL(url).hostname.replace('www.', '');
            const filename = `qr-${domain}-${Date.now().toString().slice(-6)}.png`;

            const result = await ipcRenderer.invoke('save-qr-image', imageData, filename);

            if (result.success) {
                this.showMessage(`QR code saved successfully!`, 'success');
            } else if (result.cancelled) {
                this.showMessage('Save cancelled', 'error');
            } else {
                this.showMessage(`Error saving file: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error saving QR code:', error);
            this.showMessage('Error saving QR code', 'error');
        }
    }

    clearForm() {
        this.urlInput.value = '';
        this.hideQRCode();
        this.clearMessage();
        this.urlInput.focus();
    }

    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    showMessage(text, type) {
        this.message.textContent = text;
        this.message.className = type;
        
        // Auto-clear message after 3 seconds
        setTimeout(() => {
            this.clearMessage();
        }, 3000);
    }

    clearMessage() {
        this.message.textContent = '';
        this.message.className = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});

// Handle any unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
