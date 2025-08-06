const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function convertIcon() {
  try {
    const inputPath = path.join(__dirname, 'assets', 'lumicore icon.png');
    const outputPath = path.join(__dirname, 'assets', 'icon.ico');
    
    console.log('Converting PNG to ICO...');
    const ico = await pngToIco(inputPath);
    fs.writeFileSync(outputPath, ico);
    console.log('Icon converted successfully to assets/icon.ico');
  } catch (error) {
    console.error('Error converting icon:', error.message);
  }
}

convertIcon();
