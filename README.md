# QR Code Generator

A modern Windows desktop application built with Electron for generating QR codes from URLs.

## Features

- 🎯 **Simple Interface**: Clean and intuitive user interface
- 🔗 **URL Validation**: Automatic URL validation and formatting
- 📏 **Multiple Sizes**: Generate QR codes in different sizes (200x200 to 500x500)
- 💾 **Save Functionality**: Save QR codes as PNG images
- ⚡ **Real-time Generation**: Generate QR codes as you type (with debounce)
- 🖥️ **Native Feel**: Windows-native menu system and keyboard shortcuts
- 🎨 **Modern Design**: Beautiful gradient UI with smooth animations

## Screenshots

![QR Code Generator Interface](screenshots/main-interface.png)

## Installation

### Option 1: Download Pre-built Installer
1. Go to the [Releases](releases) page
2. Download the latest `.exe` installer
3. Run the installer and follow the setup wizard
4. Launch "QR Code Generator" from your Start Menu or Desktop

### Option 2: Build from Source

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

#### Steps
1. Clone or download this repository
2. Open terminal in the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in development mode:
   ```bash
   npm run dev
   ```
5. Build for Windows:
   ```bash
   npm run build-win
   ```

## Usage

1. **Enter URL**: Type or paste any valid URL in the input field
2. **Select Size**: Choose your preferred QR code size from the dropdown
3. **Generate**: Click "Generate QR Code" or wait for auto-generation
4. **Save**: Click the "Save QR Code" button to save as PNG image
5. **Clear**: Use the "Clear" button to start fresh

### Keyboard Shortcuts

- `Ctrl+N` - Clear form for new QR code
- `Ctrl+S` - Save current QR code
- `Ctrl+Q` - Exit application

## Technical Details

### Built With
- **Electron** - Cross-platform desktop framework
- **Node.js** - JavaScript runtime
- **QRCode.js** - QR code generation library
- **HTML5 Canvas** - For rendering QR codes

### Project Structure
```
qr-code-generator/
├── main.js           # Main Electron process
├── renderer.js       # Renderer process (UI logic)
├── index.html        # Application UI
├── package.json      # Dependencies and build config
├── assets/           # Icons and images
└── dist/            # Built application (after build)
```

### Build Configuration
The application is configured to build Windows installers using `electron-builder` with NSIS. The installer includes:
- Desktop shortcut creation
- Start menu entry
- Uninstaller
- Auto-updater support (if configured)

## Development

### Running in Development
```bash
npm run dev
```
This opens the app with developer tools enabled.

### Building for Production
```bash
npm run build-win
```
Creates a Windows installer in the `dist/` directory.

### Customization
- **Icon**: Replace files in `assets/` directory
- **App Name**: Update `productName` in `package.json`
- **Window Size**: Modify dimensions in `main.js`
- **Styling**: Edit CSS in `index.html`

## System Requirements

### Minimum Requirements
- Windows 10 (64-bit)
- 100 MB free disk space
- 512 MB RAM

### Recommended
- Windows 11
- 200 MB free disk space
- 1 GB RAM

## Troubleshooting

### Common Issues

**App won't start**
- Ensure you have the latest Visual C++ Redistributable installed
- Try running as administrator

**QR codes not generating**
- Check your internet connection (for URL validation)
- Ensure the URL is properly formatted (includes http:// or https://)

**Can't save QR codes**
- Check file permissions in the selected save directory
- Ensure you have write access to the chosen location

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](issues) page for existing solutions
2. Create a new issue with detailed information
3. Include your OS version and app version

## Changelog

### v1.0.0
- Initial release
- Basic QR code generation
- Save functionality
- Multiple size options
- Windows installer support

---

**Made with ❤️ using Electron**
