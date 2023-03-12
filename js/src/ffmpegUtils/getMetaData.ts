import * as ffmpeg from "fluent-ffmpeg";
import {AudioFileMetadata} from "./audioFileMetadata";
export const getMetaData = async (path:string):Promise<AudioFileMetadata> => {
    return new Promise<AudioFileMetadata>((resolve,reject) => {
        ffmpeg.ffprobe(path, function(err, metadata) {
            if (err) {
                reject(err)
                return;
            }
            if (!metadata) {
                reject(new Error("No metadata return from 'getMetaData'"));
                return;
            }
            const audioChannel1 = metadata.streams.find(x => x.codec_type === "audio");
            if (!audioChannel1) {
                throw new Error("No audio track found.")
            }
            let {channels, sample_rate, duration, duration_ts} = audioChannel1;
            channels = channels || 0;
            sample_rate = sample_rate || 0;
            duration = duration || "";
            duration_ts = duration_ts || "";
            resolve({channels, sampleRate:sample_rate, duration:parseInt(duration), durationSamples:parseInt(duration_ts)});
        });
    })
}

