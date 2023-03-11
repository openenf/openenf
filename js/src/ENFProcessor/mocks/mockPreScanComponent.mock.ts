import {ENFEventBase} from "../events/ENFEventBase";
import {PreScanUpdate} from "../../model/preScanUpdate";
import {PreScanResult} from "../../model/preScanResult";
import {PreScanComponent} from "../../preScan/preScanComponent";

export class MockPreScanComponent implements PreScanComponent {
    private readonly onPreScan: any;

    constructor(onPreScan?:(resourceUri:string) => void, result?: PreScanResult) {
        this.onPreScan = onPreScan;
        const defaultPreScanResult:PreScanResult = {
            baseFrequency: undefined,
            duration: undefined,
            durationSamples: undefined,
            h100: undefined,
            h120: undefined,
            h200: undefined,
            h240: undefined,
            h50: undefined,
            h60: undefined,
            numChannels: undefined,
            sampleRate: undefined
        };
        this.result = result || defaultPreScanResult;
    }

    result: PreScanResult;

    readonly implementationId: string = "MockPreScanComponent";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    preScan(resourceUri: string): Promise<PreScanResult> {
        if (this.onPreScan) {
            this.onPreScan(resourceUri)
        }
        return Promise.resolve(this.result);
    }
}
