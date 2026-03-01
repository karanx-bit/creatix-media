const Jimp = require('jimp');

Jimp.read('./public/logo.png')
    .then(image => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            // Get RGB values (0-255)
            var red = this.bitmap.data[idx + 0];
            var green = this.bitmap.data[idx + 1];
            var blue = this.bitmap.data[idx + 2];

            // Calculate the perceived brightness or use max(RGB)
            // Since it's a shiny chrome logo on black background, Max RGB is a good proxy for alpha
            var brightness = Math.max(red, green, blue);

            // We maintain the RGB, but we just set the Alpha channel (idx + 3) to the brightness level
            // This effectively drops out pure black (brightness 0) and keeps bright highlights fully opaque
            this.bitmap.data[idx + 3] = brightness;
        });

        image.write('./public/logo_transparent.png', () => {
            console.log("Successfully created transparent logo");
        });
    })
    .catch(err => {
        console.error(err);
    });
