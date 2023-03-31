import {AudioFileMetadata} from "../preScan/audioFileMetadata";
import {NoMatch} from "../ENFProcessor/noMatch";
import {NoMatchReason} from "../model/noMatchReason";

export const getAudioData = (buffer: ArrayBuffer, path: string): Promise<[Float32Array, AudioFileMetadata]> => {
    return new Promise(async (resolve,reject) => {
        let AudioContext;
        if (typeof AudioContext === "undefined") {
            try {
                const result = await import('src/audioContextUtils/web-audio-api');
                AudioContext = result.AudioContext;
            } catch (e) {
                console.error(e);
            }
        }

        const audioContext = new AudioContext();
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
