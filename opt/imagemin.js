import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";

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
            if ([".png", ".jpg", ".jpeg"].indexOf(path.extname(totalDir)) !== -1) {
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
                imageminJpegtran(),
                imageminPngquant({
                    quality: [0.6, 0.8]
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
