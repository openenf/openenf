export class MockRefineComponent {
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
