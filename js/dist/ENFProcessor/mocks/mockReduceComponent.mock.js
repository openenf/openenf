"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockReduceComponent = void 0;
class MockReduceComponent {
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
exports.MockReduceComponent = MockReduceComponent;
