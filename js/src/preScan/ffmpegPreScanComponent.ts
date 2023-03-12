import {PreScanComponent} from "./preScanComponent";
import {ENFEventBase} from "../ENFProcessor/events/ENFEventBase";
import {PreScanUpdate} from "../model/preScanUpdate";
import {PreScanResult} from "../model/preScanResult";
import ffmpeg from "fluent-ffmpeg";
import {getMetaData} from "../ffmpegUtils/getMetaData";
import {GoertzelContext} from "../goertzel/GoertzelContext";
import {PreScanProcessor} from "./ffmpegPreScanProcessor";
import {runCommand} from "../ffmpegUtils/runCommand";

function determineBaseFrequency(firstPassResult: { [p: number]: number }) {
    const fifties = firstPassResult[50] + firstPassResult[100] + firstPassResult[200];
    const sixties = firstPassResult[60] + firstPassResult[120] + firstPassResult[240];
    return fifties > sixties ? 50 : 60;
}

export class FfmpegPreScanComponent implements PreScanComponent {
    private goertzelContext: GoertzelContext;
    constructor(goertzelContext: GoertzelContext) {
        this.goertzelContext = goertzelContext;
    }
    readonly implementationId: string = "WasmFfmpegPreScanComponent.0.0.1";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    async preScan(resourceUri: string): Promise<PreScanResult> {
        const metaData = await getMetaData(resourceUri);
        const goertzelStore = this.goertzelContext.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new PreScanProcessor(goertzelStore);
        await runCommand(resourceUri, metaData.channels, (chunk) => {
            preScanProcessor.process(chunk);
        })
        const firstPassResult = preScanProcessor.getResult();
        const result:PreScanResult = {
            baseFrequency: determineBaseFrequency(firstPassResult),
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
