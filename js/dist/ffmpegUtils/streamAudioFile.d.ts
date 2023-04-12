/**
 * Streams chunks of audio from the supplied path. Once a chunk has been read and converted to PCM audio it's passed to {@link onProgress}
 * @param path The filepath to the audio
 * @param numChannels The number of channels in the audio
 * @param onProgress The function to fire when a chunk of audio has been read and converted to PCM.]
 */
export declare const streamAudioFile: (path: string, numChannels: number, onProgress: (floats: number[]) => void) => Promise<void>;
