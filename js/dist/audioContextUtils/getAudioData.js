"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAudioData = void 0;
const noMatch_1 = require("../ENFProcessor/noMatch");
const noMatchReason_1 = require("../model/noMatchReason");
const web_audio_js_1 = require("@descript/web-audio-js");
const getAudioData = (buffer, path) => {
    return new Promise(async (resolve, reject) => {
        let audioContext;
        if (typeof AudioContext === "undefined") {
            audioContext = new web_audio_js_1.RenderingAudioContext();
        }
        else {
            audioContext = new AudioContext();
        }
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
