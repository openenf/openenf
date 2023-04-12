import { AudioFileMetadata } from "../preScan/audioFileMetadata";
/**
 * Uses {@link ffmpeg.ffprobe} to extract metadata from the audio file before analysis begins.
 * @param path
 */
export declare const getMetaDataFFMpeg: (path: string) => Promise<AudioFileMetadata>;
