"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForStrongSignal = void 0;
const checkForStrongSignal = (downSampledStream) => {
    const numberOfNonNullSamplesRequired = 5;
    let nonNullCount = 0;
    for (let i = 0; i < (downSampledStream.length); i++) {
        if (downSampledStream[i] != null) {
            nonNullCount++;
        }
        else {
            nonNullCount = 0;
        }
        if (nonNullCount >= numberOfNonNullSamplesRequired) {
            return true;
        }
    }
    return false;
};
exports.checkForStrongSignal = checkForStrongSignal;
