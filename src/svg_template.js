export const svgTemplate = `<svg width="512" height="256" xmlns="http://www.w3.org/2000/svg">
    <foreignObject x="0" y="0" width="512" height="256">
        <canvas id="captchaCanvas" xmlns="http://www.w3.org/1999/xhtml" width="512" height="256" style="display: block;"></canvas>
    </foreignObject>

    <script type="text/javascript">
        <![CDATA[

            // You'd think this is for obfuscation, but it's really just to play the animation at the native framerate of the browser.
            // Someone broke frame parity for ALL animated image types in all browsers, so this is the only way to get a smooth animation.

            // Load base64 image data to an imageBitmap array
            const base64Images = [/*REPLACEME*/];
            const imageBitmaps = [];

            var currentFrame = 0;
            const myCanvas = document.getElementById('captchaCanvas');
            const ctx = myCanvas.getContext('2d');

            function base64ToBlob(base64, mimeType) {
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                return new Blob([byteArray], { type: mimeType });
            }

            function animate() {
                ctx.drawImage(imageBitmaps[currentFrame], 0, 0, myCanvas.width, myCanvas.height);
                currentFrame = (currentFrame + 1) % imageBitmaps.length;
                requestAnimationFrame(animate);
            }

            async function loadBitmaps(){
                for (let i = 0; i < base64Images.length; i++) {
                    const blob = base64ToBlob(base64Images[i], 'image/gif');
                    let bitmap = await createImageBitmap(blob);
                    imageBitmaps.push(bitmap);
                    if (imageBitmaps.length === base64Images.length) {
                        animate();
                    }
                }
            }

            loadBitmaps();
        ]]>
    </script>
</svg>`;
