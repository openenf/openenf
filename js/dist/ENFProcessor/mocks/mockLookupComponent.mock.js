import { ENFEventBase } from "../events/ENFEventBase";
export class MockLookupComponent {
    constructor(onLookup, result) {
        this.implementationId = "MockLookupComponent";
        this.lookupProgressEvent = new ENFEventBase();
        this.onLookup = onLookup;
        this.result = result || [];
    }
    lookup(freqs, gridIds, from, to) {
        if (this.onLookup) {
            this.onLookup(freqs, gridIds, from, to);
        }
        return Promise.resolve(this.result);
    }
}
