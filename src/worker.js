import { GIFEncoder, quantize, applyPalette } from './gifenc.esm.js';

// Text atlas for drawing text without Canvas
const TEXT_ATLAS = {
  '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,1,1,1,1]],
  '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '4': [[1,0,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  '6': [[0,1,1,1,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'D': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,0]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'J': [[0,0,0,0,1],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,0,1]],
  'S': [[0,1,1,1,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  'Y': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z': [[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]]
};

class CaptchaGenerator {
  constructor() {
    this.width = 512;
    this.height = 256;
    this.frameData = new Uint8Array(this.width * this.height * 4); // RGBA
    this.xScroller = new Uint8Array(this.width * this.height * 4);
    this.yScroller = new Uint8Array(this.width * this.height * 4);
    this.backgroundData = new Uint8Array(this.width * this.height * 4);
    this.frameNum = 0;
    
    this.initializeNoise();
  }

  initializeNoise() {
    // Initialize random noise patterns
    for (let i = 0; i < this.frameData.length; i += 4) {
      const value = 1 + (Math.floor(Math.random() * 255));
      this.frameData[i] = value;
      this.frameData[i + 1] = value;
      this.frameData[i + 2] = value;
      this.frameData[i + 3] = 255;
    }

    // Initialize scrollers
    for (let i = 0; i < this.xScroller.length; i += 4) {
      const value = 1 + (Math.floor(Math.random() * 255));
      this.xScroller[i] = value;
      this.xScroller[i + 1] = value;
      this.xScroller[i + 2] = value;
      this.xScroller[i + 3] = 255;
    }

    for (let i = 0; i < this.yScroller.length; i += 4) {
      const value = 1 + (Math.floor(Math.random() * 255));
      this.yScroller[i] = value;
      this.yScroller[i + 1] = value;
      this.yScroller[i + 2] = value;
      this.yScroller[i + 3] = 255;
    }
  }

  drawText(text, x, y, scale = 20) {
    // Clear background
    this.backgroundData.fill(0);
    
    const totalWidth = text.length * 5 * scale + (text.length - 1) * scale;
    const startX = x - totalWidth / 2;
    const startY = y - (5 * scale) / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charPattern = TEXT_ATLAS[char];
      if (!charPattern) continue;

      const charX = startX + i * (5 * scale + scale);
      
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (charPattern[row][col]) {
            // Draw scaled pixel
            for (let sy = 0; sy < scale; sy++) {
              for (let sx = 0; sx < scale; sx++) {
                const px = Math.floor(charX + col * scale + sx);
                const py = Math.floor(startY + row * scale + sy);
                
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                  const idx = (py * this.width + px) * 4;
                  this.backgroundData[idx] = 255;     // R
                  this.backgroundData[idx + 1] = 255; // G
                  this.backgroundData[idx + 2] = 255; // B
                  this.backgroundData[idx + 3] = 255; // A
                }
              }
            }
          }
        }
      }
    }
  }

  generateFrame() {
    // Scroll the xScroller and yScroller (adapted from original)
    const xScrollerCopy = new Uint8Array(this.xScroller);
    for (let i = 0; i < this.xScroller.length; i += 4) {
      const yIndex = Math.floor(i / (this.width * 4));
      if (yIndex === 0 || yIndex === this.height - 1) {
        const value = 1 + Math.floor(Math.random() * 255);
        this.xScroller[i] = value;
        this.xScroller[i + 1] = value;
        this.xScroller[i + 2] = value;
        this.xScroller[i + 3] = 255;
      } else {
        const rowOffset = this.width * 4 * ((i / 4) % 2 === 0 ? 1 : -1);
        const sourceIndex = i + rowOffset;
        if (sourceIndex >= 0 && sourceIndex < xScrollerCopy.length) {
          this.xScroller[i] = xScrollerCopy[sourceIndex];
          this.xScroller[i + 1] = xScrollerCopy[sourceIndex + 1];
          this.xScroller[i + 2] = xScrollerCopy[sourceIndex + 2];
          this.xScroller[i + 3] = 255;
        }
      }
    }

    const yScrollerCopy = new Uint8Array(this.yScroller);
    for (let i = 0; i < this.yScroller.length; i += 4) {
      const xIndex = (i / 4) % this.width;
      const yIndex = Math.floor(i / (this.width * 4));
      if (xIndex === 0 || xIndex === this.width - 1) {
        const value = 1 + Math.floor(Math.random() * 255);
        this.yScroller[i] = value;
        this.yScroller[i + 1] = value;
        this.yScroller[i + 2] = value;
        this.yScroller[i + 3] = 255;
      } else {
        const offset = yIndex % 2 === 0 ? 4 : -4;
        const sourceIndex = i + offset;
        if (sourceIndex >= 0 && sourceIndex < yScrollerCopy.length) {
          this.yScroller[i] = yScrollerCopy[sourceIndex];
          this.yScroller[i + 1] = yScrollerCopy[sourceIndex + 1];
          this.yScroller[i + 2] = yScrollerCopy[sourceIndex + 2];
          this.yScroller[i + 3] = 255;
        }
      }
    }

    // Combine layers
    for (let i = 0; i < this.frameData.length; i += 4) {
      if (this.backgroundData[i + 3] !== 0) {
        const xIndex = (i / 4) % this.width;
        const yIndex = Math.floor(i / (this.width * 4));
        const sourceArr = (yIndex % 2 === 0) !== (xIndex % 2 === 0) ? this.xScroller : this.yScroller;
        
        this.frameData[i]     = sourceArr[i];
        this.frameData[i + 1] = sourceArr[i + 1];
        this.frameData[i + 2] = sourceArr[i + 2];
        this.frameData[i + 3] = 255;
      } else {
        const value = 1 + Math.floor(Math.random() * 255);
        this.frameData[i] = value;
        this.frameData[i + 1] = value;
        this.frameData[i + 2] = value;
        this.frameData[i + 3] = 255;
      }
    }

    this.frameNum++;
    return this.frameData;
  }
}

// Hash function for generating CAPTCHA from URL
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 4).toUpperCase();
}

// Generate random URL code
function generateUrlCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Main route - generate new CAPTCHA
    if (path === '/' || path === '/generate') {
      const urlCode = generateUrlCode();
      const captchaText = await hashString(urlCode);
      
      return new Response(JSON.stringify({
        captcha_url: `/captcha/${urlCode}`,
        validate_url: `/validate/${urlCode}`,
        captcha_text: captchaText // In production, don't expose this
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate CAPTCHA image
    if (path.startsWith('/captcha/')) {
      const urlCode = path.split('/')[2];
      if (!urlCode) {
        return new Response('Invalid URL code', { status: 400 });
      }

      try {
        const captchaText = await hashString(urlCode);
        const generator = new CaptchaGenerator();
        
        // Create GIF encoder
        const gif = new GIFEncoder();
        
        // Generate multiple frames for animation
        const numFrames = 15;
        for (let i = 0; i < numFrames; i++) {
          generator.drawText(captchaText, generator.width / 2, generator.height / 2);
          const frameData = generator.generateFrame();
          
          // Quantize colors to a palette
          const palette = quantize(frameData, 256);
          
          // Get indexed bitmap
          const index = applyPalette(frameData, palette);
          
          // Write frame to GIF
          gif.writeFrame(index, generator.width, generator.height, { 
            palette: palette, 
            delay: 16 // 100ms delay between frames
          });
        }
        
        // Finish GIF
        gif.finish();
        
        // Get the GIF bytes
        const gifData = gif.bytes();
        
        return new Response(gifData, {
          headers: { 
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      } catch (error) {
        console.error('Error generating CAPTCHA:', error);
        return new Response('Error generating CAPTCHA', { status: 500 });
      }
    }

    // Validate CAPTCHA
    if (path.startsWith('/validate/')) {
      const urlCode = path.split('/')[2];
      const userInput = url.searchParams.get('input');
      
      if (!urlCode || !userInput) {
        return new Response('Missing parameters', { status: 400 });
      }

      const expectedCaptcha = await hashString(urlCode);
      const isValid = userInput.toUpperCase() === expectedCaptcha;

      return new Response(JSON.stringify({
        valid: isValid,
        expected: expectedCaptcha // In production, don't expose this
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};