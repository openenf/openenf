import path from "path";
import * as cliProgress from "cli-progress";
import fs from "fs";
import { getENFDataDirectory } from "./ENFDataDirectory";
import crypto from "crypto";
const getMD5 = async (filePath) => {
    return new Promise((resolve, reject) => {
        const fileHash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        stream.on('data', function (data) {
            fileHash.update(data);
        });
        stream.on('end', function () {
            const md5sum = fileHash.digest('hex');
            resolve(md5sum);
        });
        stream.on('error', function (err) {
            reject(err);
        });
    });
};
export const verifyApplicationData = async () => {
    const dataDirectory = getENFDataDirectory();
    await downloadIfNotExist("https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb", path.resolve(dataDirectory, "GB.freqdb"));
    await downloadIfNotExist("https://zenodo.org/record/7809233/files/DE_50_2010-2021.freq.freqdb?download=1", path.resolve(dataDirectory, "DE.freqdb"));
};
const downloadIfNotExist = async (url, filepath) => {
    if (fs.existsSync(filepath)) {
        return;
    }
    await downloadFile(url, filepath);
};
const downloadFile = async (fileUrl, apiPath) => {
    return new Promise((resolve, reject) => {
        var url = require('url'), http = require('https'), p = url.parse(fileUrl), timeout = 10000;
        var file = fs.createWriteStream(apiPath);
        var timeout_wrapper = function (req) {
            return function () {
                req.abort();
                reject(new Error("File transfer timeout!"));
            };
        };
        var request = http.get(fileUrl).on('response', function (res) {
            var len = parseInt(res.headers['content-length'], 10);
            var downloaded = 0;
            const progressBar = new cliProgress.SingleBar({
                format: 'Downloading Grid Frequency Data |{bar}| {percentage}% || {log}',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: false
            });
            progressBar.start(len, 0, { log: `Downloading ${path.basename(apiPath)}` });
            res.on('data', function (chunk) {
                file.write(chunk);
                downloaded += chunk.length;
                progressBar.update(downloaded);
                // reset timeout
                clearTimeout(timeoutId);
                timeoutId = setTimeout(fn, timeout);
            }).on('end', function () {
                // clear timeout
                clearTimeout(timeoutId);
                file.end();
                progressBar.stop();
                resolve();
            }).on('error', function (err) {
                // clear timeout
                clearTimeout(timeoutId);
                reject(err);
            });
        });
        // generate timeout handler
        var fn = timeout_wrapper(request);
        // set initial timeout
        var timeoutId = setTimeout(fn, timeout);
    });
};
