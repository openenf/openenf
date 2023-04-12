import { ENFEventBase } from "../events/ENFEventBase";
export class MockPreScanComponent {
    constructor(onPreScan, result) {
        this.implementationId = "MockPreScanComponent";
        this.preScanProgressEvent = new ENFEventBase();
        this.onPreScan = onPreScan;
        const defaultPreScanResult = {
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
    preScan(resourceUri) {
        if (this.onPreScan) {
            this.onPreScan(resourceUri);
        }
        return Promise.resolve(this.result);
    }
}
