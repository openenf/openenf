"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApplicationData = void 0;
const path_1 = __importDefault(require("path"));
const cliProgress = __importStar(require("cli-progress"));
const fs_1 = __importDefault(require("fs"));
const ENFDataDirectory_1 = require("./ENFDataDirectory");
const verifyApplicationData = async () => {
    const dataDirectory = (0, ENFDataDirectory_1.getENFDataDirectory)();
    const gbPath = path_1.default.resolve(dataDirectory, "GB.freqdb");
    await downloadIfNotExist("https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb", gbPath);
    const dePath = path_1.default.resolve(dataDirectory, "DE.freqdb");
    await downloadIfNotExist("https://zenodo.org/record/7809233/files/DE_50_2010-2021.freq.freqdb?download=1", dePath);
    return [gbPath, dePath];
};
exports.verifyApplicationData = verifyApplicationData;
const downloadIfNotExist = async (url, filepath) => {
    if (fs_1.default.existsSync(filepath)) {
        return;
    }
    await downloadFile(url, filepath);
};
const downloadFile = async (fileUrl, apiPath) => {
    return new Promise((resolve, reject) => {
        const url = require('url'), http = require('https'), p = url.parse(fileUrl), timeout = 10000;
        const dir = path_1.default.dirname(apiPath);
        fs_1.default.mkdirSync(dir, { recursive: true });
        const file = fs_1.default.createWriteStream(apiPath);
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
            progressBar.start(len, 0, { log: `Downloading ${path_1.default.basename(apiPath)}` });
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
