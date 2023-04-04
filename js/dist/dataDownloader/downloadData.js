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
exports.downloadData = void 0;
const path_1 = __importDefault(require("path"));
const cliProgress = __importStar(require("cli-progress"));
const fs_1 = __importDefault(require("fs"));
const ENFDataDirectory_1 = require("./ENFDataDirectory");
const crypto_1 = __importDefault(require("crypto"));
const staticFreqDbLocationData = {
    "XX": {
        gridId: "XX",
        url: "https://zenodo.org/record/7768353/files/TestFreqDb.freqdb",
        md5: "ddc138b743874940c9577e03df5b21db"
    },
    "GB": {
        gridId: "GB",
        url: "https://zenodo.org/record/7741427/files/GB_50_2014-2021.freqdb",
        md5: "5686bc6fcc53b9d172ed617f77c8e2c3"
    }
};
const getMD5 = async (filePath) => {
    return new Promise((resolve, reject) => {
        const fileHash = crypto_1.default.createHash('md5');
        const stream = fs_1.default.createReadStream(filePath);
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
const downloadData = async (gridId) => {
    return new Promise(async (resolve, reject) => {
        if (!staticFreqDbLocationData[gridId]) {
            throw new Error(`Grid id ${gridId} not known"`);
        }
        const fileName = `${gridId}.freqdb`;
        const filePath = path_1.default.join((0, ENFDataDirectory_1.getENFDataDirectory)(), fileName);
        const remoteFreqDb = staticFreqDbLocationData[gridId];
        if (fs_1.default.existsSync(filePath)) {
            const md5 = await getMD5(filePath);
            if (md5 == remoteFreqDb.md5) {
                //File is already downloaded and verified so:
                resolve();
            }
            else {
                console.warn(`For file ${fileName} expected MD5 ${remoteFreqDb.md5} but got ${md5}. Re-downloading`);
                //fs.rmSync(filePath);
                resolve();
            }
        }
        const url = remoteFreqDb.url;
        fs_1.default.mkdir((0, ENFDataDirectory_1.getENFDataDirectory)(), () => { });
        const fetchResponse = await fetch(url);
        const contentLength = fetchResponse.headers.get('content-length');
        let total = -1;
        let loaded = 0;
        if (contentLength) {
            total = parseInt(contentLength, 10);
        }
        const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        bar.start(100, 0);
        const response = new Response(new ReadableStream({
            async start(controller) {
                if (fetchResponse.body) {
                    const reader = fetchResponse.body.getReader();
                    for (;;) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        loaded += value.byteLength;
                        bar.update(loaded / total * 100);
                        fs_1.default.writeFile(filePath, value, { flag: "a" }, function (err) {
                            if (err)
                                return console.log(err);
                        });
                        controller.enqueue(value);
                    }
                    controller.close();
                    bar.stop();
                    const md5 = await getMD5(filePath);
                    if (md5 !== remoteFreqDb.md5) {
                        reject(new Error(`For file ${fileName} expected MD5 ${remoteFreqDb.md5} but got ${md5}. File may be corrupted`));
                    }
                    resolve();
                }
            },
        }));
    });
};
exports.downloadData = downloadData;
