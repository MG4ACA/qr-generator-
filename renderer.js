const QRCode = require("qrcode");
const { ipcRenderer } = require("electron");

class QRGenerator {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.setupIPC();
  }

  initializeElements() {
    // Tab elements
    this.tabBtns = document.querySelectorAll(".tab-btn");
    this.tabContents = document.querySelectorAll(".tab-content");

    // URL form elements
    this.form = document.getElementById("qr-form");
    this.urlInput = document.getElementById("url-input");
    this.sizeSelect = document.getElementById("size-select");
    this.generateBtn = document.getElementById("generate-btn");

    // Image form elements
    this.imageForm = document.getElementById("image-form");
    this.imageInput = document.getElementById("image-input");
    this.selectFileBtn = document.getElementById("select-file-btn");
    this.fileInfo = document.getElementById("file-info");
    this.imagePreview = document.getElementById("image-preview");
    this.imageSizeSelect = document.getElementById("image-size-select");
    this.generateImageBtn = document.getElementById("generate-image-btn");

    // Common elements
    this.qrContainer = document.getElementById("qr-container");
    this.placeholder = document.getElementById("placeholder");
    this.qrCanvas = document.getElementById("qr-code");
    this.actions = document.getElementById("actions");
    this.saveBtn = document.getElementById("save-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.message = document.getElementById("message");

    this.currentTab = "url";
    this.currentImageData = null;
  }

  bindEvents() {
    // Tab navigation
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab));
    });

    // URL form events
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.urlInput.addEventListener("input", () => this.clearMessage());

    // Image form events
    this.imageForm.addEventListener("submit", (e) => this.handleImageSubmit(e));
    this.selectFileBtn.addEventListener("click", () => this.imageInput.click());
    this.imageInput.addEventListener("change", (e) => this.handleImageSelect(e));

    // Common events
    this.saveBtn.addEventListener("click", () => this.saveQRCode());
    this.clearBtn.addEventListener("click", () => this.clearForm());

    // Auto-generate on URL change (with debounce)
    let debounceTimer;
    this.urlInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.currentTab === "url" && this.isValidUrl(this.urlInput.value)) {
          this.generateQRCode();
        }
      }, 500);
    });
  }

  setupIPC() {
    // Listen for menu commands
    ipcRenderer.on("clear-form", () => {
      this.clearForm();
    });

    ipcRenderer.on("save-qr", () => {
      if (this.qrCanvas.style.display !== "none") {
        this.saveQRCode();
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.generateQRCode();
  }

  handleImageSubmit(e) {
    e.preventDefault();
    this.generateQRFromImage();
  }

  switchTab(tab) {
    this.currentTab = tab;

    // Update tab buttons
    this.tabBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    // Update tab content
    this.tabContents.forEach((content) => {
      content.classList.toggle("active", content.id === `${tab}-tab`);
    });

    // Clear any existing QR code and messages
    this.hideQRCode();
    this.clearMessage();
  }

  async handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showMessage("Please select a valid image file", "error");
      return;
    }

    // Show file info
    this.fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(
      2
    )} MB)`;
    this.fileInfo.classList.add("show");

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      this.currentImageData = e.target.result;
      this.generateImageBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  async generateQRFromImage() {
    if (!this.currentImageData) {
      this.showMessage("Please select an image first", "error");
      return;
    }

    const size = parseInt(this.imageSizeSelect.value);

    this.generateImageBtn.disabled = true;
    this.generateImageBtn.textContent = "Generating...";

    try {
      const options = {
        width: size,
        height: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      // Use the image data as QR code content
      await QRCode.toCanvas(this.qrCanvas, this.currentImageData, options);

      this.showQRCode();
      this.showMessage("QR Code generated from image successfully!", "success");
    } catch (error) {
      console.error("Error generating QR code from image:", error);
      this.showMessage(
        "Error generating QR code from image. The image might be too large.",
        "error"
      );
    } finally {
      this.generateImageBtn.disabled = false;
      this.generateImageBtn.textContent = "Generate QR Code from Image";
    }
  }

  async generateQRCode() {
    const url = this.urlInput.value.trim();
    const size = parseInt(this.sizeSelect.value);

    if (!url) {
      this.showMessage("Please enter a URL", "error");
      return;
    }

    if (!this.isValidUrl(url)) {
      this.showMessage("Please enter a valid URL", "error");
      return;
    }

    this.generateBtn.disabled = true;
    this.generateBtn.textContent = "Generating...";

    try {
      const options = {
        width: size,
        height: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      };

      await QRCode.toCanvas(this.qrCanvas, url, options);

      this.showQRCode();
      this.showMessage("QR Code generated successfully!", "success");
    } catch (error) {
      console.error("Error generating QR code:", error);
      this.showMessage("Error generating QR code. Please try again.", "error");
    } finally {
      this.generateBtn.disabled = false;
      this.generateBtn.textContent = "Generate QR Code";
    }
  }

  showQRCode() {
    this.placeholder.style.display = "none";
    this.qrCanvas.style.display = "block";
    this.qrContainer.classList.add("has-qr");
    this.actions.style.display = "flex";
  }

  hideQRCode() {
    this.placeholder.style.display = "block";
    this.qrCanvas.style.display = "none";
    this.qrContainer.classList.remove("has-qr");
    this.actions.style.display = "none";
  }

  async saveQRCode() {
    if (this.qrCanvas.style.display === "none") {
      this.showMessage("No QR code to save", "error");
      return;
    }

    try {
      const imageData = this.qrCanvas.toDataURL("image/png");
      let filename;

      if (this.currentTab === "url") {
        const url = this.urlInput.value.trim();
        const domain = new URL(url).hostname.replace("www.", "");
        filename = `qr-url-${domain}-${Date.now().toString().slice(-6)}.png`;
      } else {
        filename = `qr-image-${Date.now().toString().slice(-6)}.png`;
      }

      const result = await ipcRenderer.invoke("save-qr-image", imageData, filename);

      if (result.success) {
        this.showMessage(`QR code saved successfully!`, "success");
      } else if (result.cancelled) {
        this.showMessage("Save cancelled", "error");
      } else {
        this.showMessage(`Error saving file: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving QR code:", error);
      this.showMessage("Error saving QR code", "error");
    }
  }

  clearForm() {
    if (this.currentTab === "url") {
      this.urlInput.value = "";
      this.urlInput.focus();
    } else {
      this.imageInput.value = "";
      this.fileInfo.classList.remove("show");
      this.imagePreview.innerHTML = "";
      this.currentImageData = null;
      this.generateImageBtn.disabled = true;
    }

    this.hideQRCode();
    this.clearMessage();
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
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
    this.message.textContent = "";
    this.message.className = "";
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new QRGenerator();
});

// Handle any unhandled errors
window.addEventListener("error", (event) => {
  console.error("Unhandled error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
