import {AudioFileMetadata} from "../preScan/audioFileMetadata";
import {NoMatch} from "../ENFProcessor/noMatch";
import {NoMatchReason} from "../model/noMatchReason";
import {RenderingAudioContext} from "@descript/web-audio-js";

export const getAudioData = (buffer: ArrayBuffer, path: string): Promise<[Float32Array, AudioFileMetadata]> => {
    return new Promise(async (resolve,reject) => {
        let audioContext:any;
        if (typeof AudioContext === "undefined") {
            audioContext = new RenderingAudioContext();
        } else {
            audioContext = new AudioContext();
        }
        
        audioContext.decodeAudioData(buffer, (audioBuffer:AudioBuffer) => {
            if (!audioBuffer) {
                reject(new NoMatch(NoMatchReason.MetaDataError));
                return;
            }
            const channelData = audioBuffer.getChannelData(0);
            const audioFileMetaData: AudioFileMetadata = {
                channels: audioBuffer.numberOfChannels,
                duration: audioBuffer.duration,
                durationSamples: audioBuffer.length,
                sampleRate: audioBuffer.sampleRate
            };
            resolve([channelData,audioFileMetaData]);
        }, (error:any) => {
            reject(new NoMatch(NoMatchReason.MetaDataError, error))
        });
    })
};
