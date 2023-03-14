import * as ffmpeg from "fluent-ffmpeg";
import {AudioFileMetadata} from "./audioFileMetadata";
import {NoMatch} from "../ENFProcessor/noMatch";
import {NoMatchReason} from "../model/noMatchReason";

/**
 * Uses {@link ffmpeg.ffprobe} to extract metadata from the audio file before analysis begins.
 * @param path
 */
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
            if (!channels) {
                throw new NoMatch(NoMatchReason.MetaDataError);
            }
            if (!sample_rate) {
                throw new NoMatch(NoMatchReason.MetaDataError);
            }
            duration = duration || "";
            duration_ts = duration_ts || "";
            resolve({channels, sampleRate:sample_rate, duration:parseInt(duration), durationSamples:parseInt(duration_ts)});
        });
    })
}

