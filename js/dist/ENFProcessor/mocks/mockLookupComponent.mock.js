"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLookupComponent = void 0;
const ENFEventBase_1 = require("../events/ENFEventBase");
class MockLookupComponent {
    constructor(onLookup, result) {
        this.implementationId = "MockLookupComponent";
        this.lookupProgressEvent = new ENFEventBase_1.ENFEventBase();
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
exports.MockLookupComponent = MockLookupComponent;
