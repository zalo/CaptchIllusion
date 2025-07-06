import { GIFEncoder, quantize, applyPalette } from 'https://unpkg.com/gifenc';

class Captchillision {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 256;
        document.getElementById('appbody').appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        this.data = this.imageData.data;

        for (let i = 0; i < this.data.length; i += 4) {
            const value = 1 + (Math.round(Math.random()) * 254);
            this.data[i    ] = value;
            this.data[i + 1] = value;
            this.data[i + 2] = value;
            this.data[i + 3] = 255;  
        }

        this.xScroller = this.data.slice();
        for (let i = 0; i < this.xScroller.length; i += 4) {
                const value = 1 + (Math.round(Math.random()) * 254);
                this.xScroller[    i] = value;
                this.xScroller[i + 1] = value;
                this.xScroller[i + 2] = value;
                this.xScroller[i + 3] = 255;  
        }

        this.yScroller = this.data.slice();
        for (let i = 0; i < this.yScroller.length; i += 4) {
            const value = 1 + (Math.round(Math.random()) * 254);
            this.yScroller[    i] = value;
            this.yScroller[i + 1] = value;
            this.yScroller[i + 2] = value;
            this.yScroller[i + 3] = 255;  
        }

        this.backgroundImageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        this.backgroundData = this.backgroundImageData.data;

        this.animate = this.animate.bind(this);

        this.indexing = [];
        for (let i = 0; i < this.canvas.width; i += 4) {
            this.indexing.push(Math.random());
        }
        
        this.frameNum = 0;
        this.gif = new GIFEncoder();

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Draw text in the middle
        this.ctx.font = '188px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const text = 'KFUR';
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(text, x, y);

        // Copy the canvas to the background image data
        this.backgroundImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.backgroundData = this.backgroundImageData.data;

        this.dataCopy = this.data.slice();

        // Scroll the xScroller and yScroller
        let xScrollerCopy = this.xScroller.slice();
        for (let i = 0; i < this.xScroller.length; i += 4) {
            let yIndex = Math.floor(i / (this.canvas.width * 4));
            if( yIndex === 0 || yIndex == this.canvas.height - 1){
                const value = 1 + (Math.round(Math.random()) * 254);
                this.xScroller[    i] = value;
                this.xScroller[i + 1] = value;
                this.xScroller[i + 2] = value;
                this.xScroller[i + 3] = 255;
            } else {
                let rowAboveOrBelowIndex = i + (this.canvas.width * 4 * ((i/4) % 2 === 0 ? 1 : -1));
                this.xScroller[i    ] = xScrollerCopy[rowAboveOrBelowIndex + 0];
                this.xScroller[i + 1] = xScrollerCopy[rowAboveOrBelowIndex + 1];
                this.xScroller[i + 2] = xScrollerCopy[rowAboveOrBelowIndex + 2];
                this.xScroller[i + 3] = 255;
            }
        }
        let yScrollerCopy = this.yScroller.slice();
        for (let i = 0; i < this.yScroller.length; i += 4) {
            let xIndex = (i / 4) % this.canvas.width;
            let yIndex = Math.floor(i / (this.canvas.width * 4));
            if( xIndex === 0 || xIndex == this.canvas.width - 1){
                const value = 1 + (Math.round(Math.random()) * 254);
                this.yScroller[    i] = value;
                this.yScroller[i + 1] = value;
                this.yScroller[i + 2] = value;
                this.yScroller[i + 3] = 255;  
            } else {
                let leftOrRightIndex = yIndex % 2 === 0 ? i+4 : i-4;
                this.yScroller[i    ] = yScrollerCopy[leftOrRightIndex + 0];
                this.yScroller[i + 1] = yScrollerCopy[leftOrRightIndex + 1];
                this.yScroller[i + 2] = yScrollerCopy[leftOrRightIndex + 2];
                this.yScroller[i + 3] = 255;                 
            }
        }

        for (let i = 0; i < this.data.length; i += 4) {
            if(this.backgroundData[i + 3] == 0){
                // Grab the value from the row below
                let xIndex = (i / 4) % this.canvas.width;
                let yIndex = Math.floor(i / (this.canvas.width * 4));
                let sourceArr = (yIndex % 2 === 0) != (xIndex % 2 === 0) ? this.xScroller : this.yScroller;
                this.data[i    ] = sourceArr[i    ];
                this.data[i + 1] = sourceArr[i + 1];
                this.data[i + 2] = sourceArr[i + 2];
                this.data[i + 3] = 255;
            }else{
                let value = 1 + (Math.round(Math.random()) * 254);
                this.data[i    ] = value;
                this.data[i + 1] = value;
                this.data[i + 2] = value;
                this.data[i + 3] = 255;
            }
        }

        this.ctx.putImageData(this.imageData, 0, 0);

        //if(this.frameNum < 30){
        //    // Quantize your colors to a 256-color RGB palette palette
        //    let palette = quantize(this.data, 2);

        //    // Get an indexed bitmap by reducing each pixel to the nearest color palette
        //    let index = applyPalette(this.data, palette);

        //    // Write a single frame
        //    this.gif.writeFrame(index, this.canvas.width, this.canvas.height, { palette: palette, delay: 16 });

        //}else if(this.frameNum == 30){
        //    // Write end-of-stream character
        //    this.gif.finish();

        //    // Get the Uint8Array output of your binary GIF file
        //    let output = this.gif.bytes();
        //    let blob = new Blob([output], { type: 'image/gif' });
        //    window.open(URL.createObjectURL(blob));
        //}

        //if(this.frameNum === 10) {
        //    this.chunks = [];
        //    this.stream = this.canvas.captureStream(240); // grab our canvas MediaStream
        //    this.rec = new MediaRecorder(this.stream, { mimeType: 'video/webm' }); // init the recorder
        //    // every time the recorder has new data, we will store it in our array
        //    this.rec.ondataavailable = e => this.chunks.push(e.data);
        //    // only when the recorder stops, we construct a complete Blob from all the chunks
        //    this.rec.onstop = e => {
        //        let blob = new Blob(this.chunks, {type: 'video/webm'});
        //        const vid = document.createElement('video');
        //        vid.src = URL.createObjectURL(blob);
        //        vid.loop = true;
        //        vid.autoplay = true;
        //        vid.controls = true;
        //        document.body.appendChild(vid);
        //        const a = document.createElement('a');
        //        a.download = 'myvid.webm';
        //        a.href = vid.src;
        //        a.textContent = 'download the video';
        //        document.body.appendChild(a);
        //    };
        //    this.rec.start();
        //    setTimeout(()=>{ this.rec.stop(); }, 3000); // stop recording in 3s
        //}

        this.frameNum += 1;
    }
}

window.addEventListener('load', () => {
    new Captchillision();
});
