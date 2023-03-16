import {ENFEventBase} from "../events/ENFEventBase";
import {PreScanUpdate} from "../../model/preScanUpdate";
import {PreScanResultLike} from "../../model/preScanResultLike";
import {PreScanComponent} from "../../preScan/preScanComponent";

export class MockPreScanComponent implements PreScanComponent {
    private readonly onPreScan: any;

    constructor(onPreScan?:(resourceUri:string) => void, result?: PreScanResultLike) {
        this.onPreScan = onPreScan;
        const defaultPreScanResult:PreScanResultLike = {
            duration: undefined,
            durationSamples: 0,
            h100: 0,
            h120: 0,
            h200: 0,
            h240: 0,
            h50: 0,
            h60: 0,
            numChannels: 0,
            sampleRate: 0
        };
        this.result = result || defaultPreScanResult;
    }

    result: PreScanResultLike;

    readonly implementationId: string = "MockPreScanComponent";
    preScanProgressEvent: ENFEventBase<[PreScanUpdate, number]> = new ENFEventBase<[PreScanUpdate, number]>();

    preScan(resourceUri: string): Promise<PreScanResultLike> {
        if (this.onPreScan) {
            this.onPreScan(resourceUri)
        }
        return Promise.resolve(this.result);
    }
}
