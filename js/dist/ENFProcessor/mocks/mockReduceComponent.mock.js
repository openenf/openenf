export class MockReduceComponent {
    constructor(onReduce, result) {
        this.implementationId = "MockReduceComponent";
        this.onReduce = onReduce;
        this.result = result || [];
    }
    reduce(analysisResults) {
        if (this.onReduce) {
            this.onReduce(analysisResults);
        }
        return Promise.resolve(this.result);
    }
}
