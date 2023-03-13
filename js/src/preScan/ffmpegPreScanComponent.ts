import {PreScanComponent} from "./preScanComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {PreScanResult} from "../model/preScanResult";
import {getMetaData} from "../ffmpegUtils/getMetaData";
import {GoertzelFilterCache} from "../goertzel/GoertzelFilterCache";
import {PreScanProcessor} from "./ffmpegPreScanProcessor";
import {streamAudioFile} from "../ffmpegUtils/streamAudioFile";

/**
 * Determines the base frequency for the entire file based on the relative strengths of the fundamental, first and third harmonics
 * at 50 and 60Hz. The minimumRelativeStrength is somewhat arbitrary but roughly equates to being to detect a 50hz sin wave
 * mixed with pink noise at a signal-to-noise ratio of 1:50.
 * @param firstPassResult a dictionary of signal strengths at 50, 100, 200, 60, 120 and 240hz.
 * @param numSamples the total number of samples, allowing us to normalise the signal strengths for any length of audio
 */
function determineBaseFrequency(firstPassResult: { [p: number]: number }, numSamples: number): 50 | 60 | undefined {
    const minimumRelativeStrength = 5;
    const fifties = (firstPassResult[50] + firstPassResult[100] + firstPassResult[200]) / numSamples;
    const sixties = (firstPassResult[60] + firstPassResult[120] + firstPassResult[240]) / numSamples;
    if (fifties === 0 || sixties === 0) {
        return undefined;
    }
    const relativeStrength = fifties/sixties > 1 ? fifties/sixties : sixties/fifties;
    if (relativeStrength < minimumRelativeStrength) {
        return undefined;
    }
    return fifties > sixties ? 50 : 60;
}

/**
 * This implements {@link PreScanComponent} using {@link https://www.npmjs.com/package/fluent-ffmpeg}. It therefore requires
 * {@link http://www.ffmpeg.org/} to be installed on the executing machine. Going forward we may migrate to
 * {@link https://github.com/ffmpegwasm/ffmpeg.wasm} to remove the requirement for native FFMpeg.
 */
export class FfmpegPreScanComponent implements PreScanComponent {
    private goertzelContext: GoertzelFilterCache;
    constructor(goertzelContext: GoertzelFilterCache) {
        this.goertzelContext = goertzelContext;
    }
    readonly implementationId: string = "WasmFfmpegPreScanComponent.0.0.1";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    async preScan(resourceUri: string): Promise<PreScanResult> {
        const metaData = await getMetaData(resourceUri);
        const goertzelStore = this.goertzelContext.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore);
        await streamAudioFile(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        })
        const firstPassResult = preScanProcessor.getResult();
        const result:PreScanResult = {
            baseFrequency: determineBaseFrequency(firstPassResult, metaData.durationSamples),
            duration: metaData.duration,
            durationSamples: metaData.durationSamples,
            h100: firstPassResult[100],
            h120: firstPassResult[120],
            h200: firstPassResult[200],
            h240: firstPassResult[240],
            h50: firstPassResult[50],
            h60: firstPassResult[60],
            numChannels: metaData.channels,
            sampleRate: metaData.sampleRate
        }
        return result;
    }
}
