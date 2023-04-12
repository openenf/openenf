import { NoMatch } from "../ENFProcessor/noMatch";
import { NoMatchReason } from "../model/noMatchReason";
import { RenderingAudioContext } from "@descript/web-audio-js";
export const getAudioData = (buffer, path) => {
    return new Promise(async (resolve, reject) => {
        let audioContext;
        if (typeof AudioContext === "undefined") {
            audioContext = new RenderingAudioContext();
        }
        else {
            audioContext = new AudioContext();
        }
        audioContext.decodeAudioData(buffer, (audioBuffer) => {
            if (!audioBuffer) {
                reject(new NoMatch(NoMatchReason.MetaDataError));
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
            reject(new NoMatch(NoMatchReason.MetaDataError, error));
        });
    });
};
