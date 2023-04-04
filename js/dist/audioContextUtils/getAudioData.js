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
exports.getAudioData = void 0;
const noMatch_1 = require("../ENFProcessor/noMatch");
const noMatchReason_1 = require("../model/noMatchReason");
const getAudioData = (buffer, path) => {
    return new Promise(async (resolve, reject) => {
        let AudioContext;
        if (typeof AudioContext === "undefined") {
            try {
                const result = await Promise.resolve().then(() => __importStar(require('web-audio-api')));
                AudioContext = result.AudioContext;
            }
            catch (e) {
                console.error(e);
            }
        }
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(buffer, (audioBuffer) => {
            if (!audioBuffer) {
                reject(new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.MetaDataError));
                return;
            }
            const channelData = audioBuffer.getChannelData(0);
            const audioFileMetaData = {
                channels: audioBuffer.numberOfChannels,
                duration: audioBuffer.duration,
                durationSamples: audioBuffer.length,
                sampleRate: audioBuffer.sampleRate
            };
            resolve([channelData, audioFileMetaData]);
        }, (error) => {
            reject(new noMatch_1.NoMatch(noMatchReason_1.NoMatchReason.MetaDataError, error));
        });
    });
};
exports.getAudioData = getAudioData;
