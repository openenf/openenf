/**
 * Metadata extracted from an audio file for the purposes of ENF analysis
 */
export interface AudioFileMetadata {
    /**
     * Typically 1 (for mono) or 2 (for stereo). Theoretically could be any positive integer
     */
    channels: number;
    /**
     * Typically 44100, 48000. Higher sample rates should be catered for but in practice you'll get better results if you down-sample the audio
     * before analysiing
     */
    sampleRate: number;
    /**
     * The duration in whole seconds. Used for reference but not accurate. If we need sample-accurate timing we should be using {@link durationSamples}
     */
    duration: number;
    /**
     * The exact number of samples in the audio
     */
    durationSamples: number;
}
