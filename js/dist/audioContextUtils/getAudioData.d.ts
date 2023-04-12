import { AudioFileMetadata } from "../preScan/audioFileMetadata";
export declare const getAudioData: (buffer: ArrayBuffer, path: string) => Promise<[Float32Array, AudioFileMetadata]>;
