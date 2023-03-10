/**
 * Returned by the {@link Analyzer.onPreScanProgressEvent}
 */
export class PreScanUpdate {
    /**
     * The strength of the signal at 50HZ
     */
    f50: number
    
    /**
     * The strength of the signal at 100HZ
     */
    f100: number
    
    /**
     * The strength of the signal at 200HZ
     */
    f200: number
    
    /**
     * The strength of the signal at 60HZ
     */
    f60: number
    
    /**
     * The strength of the signal at 120HZ
     */
    f120: number
    
    /**
     * The strength of the signal at 240HZ
     */
    f180: number
    
    /**
     * the start position of the pre-scan window
     */
    startSamples: number

    /**
     * the end position of the pre-scan window
     */
    endSamples: number
}