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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaDataFFMpeg = void 0;
const ffmpeg = __importStar(require("fluent-ffmpeg"));
const noMatch_1 = require("../ENFProcessor/noMatch");
const noMatchReason_1 = require("../model/noMatchReason");
/**
 * Uses {@link ffmpeg.ffprobe} to extract metadata from the audio file before analysis begins.
 * @param path
 */
const getMetaDataFFMpeg = async (path) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, function (err, metadata) {
            if (err) {
                reject(err);
                return;
            }
            if (!metadata) {
                reject(new Error("No metadata return from 'getMetaData'"));
                return;
            }
            const audioChannel1 = metadata.streams.find(x => x.codec_type === "audio");
            if (!audioChannel1) {
                throw new Error("No audio track found.");
            }
            let { channels, sample_rate, duration, duration_ts } = audioChannel1;
            if (!channels) {
                throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.MetaDataError);
            }
            if (!sample_rate) {
                throw new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.MetaDataError);
            }
            duration = duration || "";
            duration_ts = duration_ts || "";
            resolve({ channels, sampleRate: sample_rate, duration: parseInt(duration), durationSamples: parseInt(duration_ts) });
        });
    });
};
exports.getMetaDataFFMpeg = getMetaDataFFMpeg;
