"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRefineComponent = void 0;
class MockRefineComponent {
    dispose() {
        return Promise.resolve(undefined);
    }
    constructor(onRefine, result) {
        this.implementationId = "MockRefineComponent";
        this.onRefine = onRefine;
        this.result = result;
    }
    refine(lookupFrequencies, lookupResults) {
        if (this.onRefine) {
            this.onRefine(lookupResults);
        }
        return Promise.resolve(this.result);
    }
}
exports.MockRefineComponent = MockRefineComponent;
