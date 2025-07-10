import { GIFEncoder, quantize, applyPalette } from './gifenc.esm.js';
import { TEXT_ATLAS } from './text_atlas.js'; // Import the text atlas
import { encode } from './UPNG.js'; // Import UPNG for PNG encoding

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

  // Transpose a UInt8Array according to a specific width and height
  transpose(array, width, height) {
    const transposed = new Uint8Array(array.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIndex  = (y * width + x) * 4;
        const destIndex = (x * height + y) * 4;
        transposed[destIndex] = array[srcIndex];
        transposed[destIndex + 1] = array[srcIndex + 1];
        transposed[destIndex + 2] = array[srcIndex + 2];
        transposed[destIndex + 3] = array[srcIndex + 3];
      }
    }
    return transposed;
  }

  drawText(text) {
    // Clear background
    this.backgroundData.fill(0);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charPattern = TEXT_ATLAS[char];
      if (!charPattern) continue;
      
      // Transpose the character pattern to fit the background and copy character pattern into backgroundData
      this.backgroundData.set(this.transpose(charPattern, 128, 256), charPattern.length * i);
    }

    // Transpose the background data again
    this.backgroundData.set(this.transpose(this.backgroundData, 256, 512));
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
      if (this.backgroundData[i + 4] != 255) {
        const xIndex = (i / 4) % this.width;
        const yIndex = Math.floor(i / (this.width * 4));
        const sourceArr = (yIndex % 2 === 0) !== (xIndex % 2 === 0) ? this.xScroller : this.yScroller;
        
        this.frameData[i    ] = sourceArr[i];
        this.frameData[i + 1] = sourceArr[i + 1];
        this.frameData[i + 2] = sourceArr[i + 2];
        this.frameData[i + 3] = 255;
      } else {
        const value = 1 + Math.floor(Math.random() * 255);
        this.frameData[i    ] = value;
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
async function hashString(input) {
  // Convert string to UTF-8 encoded bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Use first 4 bytes to generate 4 letters
  const letters = hashArray.slice(0, 4).map(byte => {
    // Map byte value (0-255) to letter (A-Z)
    const letterIndex = byte % 26;
    return String.fromCharCode(65 + letterIndex);
  }).join('');
  
  return letters;
}

// Generate random URL code
function generateUrlCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generates CSS such that only one frame shows at a time
// This is the "magic" that animates the SVG!
function generateAnimationCSS (numFrames = 25, frameRate = 240) {
  let frameTime = 1.0 / frameRate;
  let animationTime = frameTime * numFrames;
  let animationString =
    '  <style type="text/css">\n' +
    '    @keyframes flash { 0%   { visibility: visible; }\n' +
    '                       ' + (100.0 / numFrames) + '%  { visibility: hidden;  } }\n';
  for (let i = 0; i < numFrames; i++) {
    animationString += '    #Frame-' + i + ' { animation: flash ' + animationTime + 's linear infinite ' + (frameTime * i) + 's;    }\n';
  }
  animationString += '  </style>';
  return animationString;
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
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
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
        const numFrames = 25;
        for (let i = 0; i < numFrames; i++) {
          generator.drawText(captchaText);
          const frameData = generator.generateFrame();
          
          // Quantize colors to a palette
          const palette = quantize(frameData, 256);
          
          // Get indexed bitmap
          const index = applyPalette(frameData, palette);
          
          // Write frame to GIF
          gif.writeFrame(index, generator.width, generator.height, { 
            palette: palette, 
            delay: 15 // 100ms delay between frames
          });
        }
        
        // Finish GIF
        gif.finish();
        
        // Get the GIF bytes
        const gifData = gif.bytes();

        /*let frames = [];
        let delays = [];
        const numFrames = 25;
        for (let i = 0; i < numFrames; i++) {
          generator.drawText(captchaText);
          const frameData = generator.generateFrame();
          frames.push(frameData.buffer.slice(0)); // Push a copy of the frame data
          delays.push(16); // 100ms delay for each frame
        }

        var pngData = encode(frames, 512, 256, 0, delays);*/

        /*// Create an SVG where each frame is a separate png layer
        const numFrames = 25;
        let svgText = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256">';
        for (let i = 0; i < numFrames; i++) {
          generator.drawText(captchaText);
          let frameData = generator.generateFrame();
          let pngData = encode([frameData.buffer], 512, 256, 0);
          console.log('Generated frame ' + i + ' data length: ' + new Uint8Array(pngData).length, frameData.length);

          svgText += '  <g id="Frame-' + i + '" visibility="hidden">\n';
          svgText += '    <image href="data:image/png;base64,' + btoa([].reduce.call(new Uint8Array(pngData),function(p,c){return p+String.fromCharCode(c)},'')) + '" x="0" y="0" width="512" height="256" />\n';
          svgText += '  </g>\n';
        }
        svgText += generateAnimationCSS(numFrames, 61); // 61 FPS animation
        svgText += '</svg>';*/

        // Create an SVG where each frame is a separate gif layer
        
        /*const numFrames = 25;
        let svgText = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256">';
        for (let i = 0; i < numFrames; i++) {
          generator.drawText(captchaText);
          let gif = new GIFEncoder();
          let frameData = generator.generateFrame();
          let palette = quantize(frameData, 256);
          let index = applyPalette(frameData, palette);
          gif.writeFrame(index, generator.width, generator.height, { palette: palette });
          gif.finish();

          svgText += '  <g id="Frame-' + i + '" visibility="hidden">\n';
          svgText += '    <image href="data:image/gif;base64,' + btoa([].reduce.call(gif.bytes(),function(p,c){return p+String.fromCharCode(c)},'')) + '" x="0" y="0" width="512" height="256" />\n';
          svgText += '  </g>\n';
        }
        svgText += generateAnimationCSS(numFrames, 60); // 60 FPS animation
        svgText += '</svg>';*/

        return new Response(gifData, {
          headers: { 
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
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
        // Add CORS headers for all addresses
        headers: { 'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'no-cache, no-store, must-revalidate'
         }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};