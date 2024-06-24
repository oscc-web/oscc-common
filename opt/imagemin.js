import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";
import imagemingiflossy from "imagemin-giflossy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageDirSrcs = path.resolve(__dirname, "../../var/dist/res/images");
const imageDirDest = path.resolve(__dirname, "../../var/dist/res/images");
const parseFilesPromise = [];

function createDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

function readDirtory(dir, newDir) {
    createDir(newDir)
    const dirData = fs.readdirSync(dir)

    for (let innerDir of dirData) {
        const totalDir = path.resolve(dir, innerDir)
        const childDir = path.resolve(newDir, innerDir)
        const stat = fs.statSync(totalDir)
        if (stat.isDirectory()) {
            readDirtory(totalDir, childDir)
        }
        else {
            if ([".png", ".jpg", ".jpeg", ".gif"].indexOf(path.extname(totalDir)) !== -1) {
                parseFiles(totalDir,childDir)
            }
        }
    }
}

function parseFiles(fileSrcs, fileDest) {
    console.log(fileSrcs + " -> " + fileDest);
    parseFilesPromise.push(
        imagemin([fileSrcs], {
            destination: path.dirname(fileDest),
            glob: false,
            plugins: [
                // https://www.npmjs.com/package/imagemin-jpegtran
                imageminJpegtran({
                    // Values: true or false
                    // Lossless conversion to progressive.
                    progressive: false,
                    // Values: true or false
                    // Arithmetic coding (https://en.wikipedia.org/wiki/Arithmetic_coding)
                    arithmetic: false
                }),
                // https://www.npmjs.com/package/imagemin-pngquant
                imageminPngquant({
                    // Values: 1 (brute-force) to 11 (fastest).
                    // Speed 10 has 5% lower quality, but is about 8 times
                    // faster than the default. Speed 11 disables dithering and
                    // lowers compression level.
                    speed: 4,
                    // Values: true or false
                    // Remove optional metadata.
                    strip: false,
                    // Values: [0-1, 0-1]
                    // Instructs pngquant to use the least amount of colors
                    // required to meet or exceed the max quality. If
                    // conversion results in quality below the min quality the
                    // image won't be saved.
                    quality: [0.6, 0.8],
                    // Values: 0-1
                    // Set the dithering level using a fractional number
                    // between 0 (none) and 1 (full).
                    dithering: 1
                }),
                // https://www.npmjs.com/package/imagemin-giflossy
                imagemingiflossy({
                    // Values: true or false
                    // Interlace gif for progressive rendering.
                    interlaced: false,
                    // Values: 1 or 2 or 3
                    // Select an optimization level between 1 and 3.
                    // The optimization level determines how much optimization
                    // is done; higher levels take longer, but may have better
                    // results.
                    optimizationLevel: 1,
                    // Values: 80-200
                    // Order pixel patterns to create smaller GIFs at cost of
                    // artifacts and noise.
                    // Adjust lossy argument to quality you want (30 is very
                    // light compression, 200 is heavy).
                    lossy: 80,
                    // Values: undefined or "300x200" or etc
                    // Resize the output GIF to widthxheight
                    resize: undefined,
                    // Values: true or false
                    // Sets the output logical screen to the size of the
                    // largest output frame.
                    noLogicalScreen: false,
                    // Values: "mix" or "sample" or etc
                    // Set the method used to resize images.
                    resizeMethod: "mix",
                    // Values: "diversity" or "blend-diversity" or etc
                    // Determine how a smaller colormap is chosen
                    colorMethod: "diversity",
                    // Values: 1 or 2 or 3
                    // Optimize output GIF animations for space.
                    optimize: 1,
                    // Values: true or false
                    // Unoptimize GIF animations into an easy-to-edit form.
                    unoptimize: false
                })
            ]
        })
    );
}

readDirtory(imageDirSrcs, imageDirDest)

Promise.all(parseFilesPromise).then(data => {
}).catch(err => {
    console.log(err);
})
