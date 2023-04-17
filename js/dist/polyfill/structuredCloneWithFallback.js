"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structuredCloneWithFallback = void 0;
const structuredCloneWithFallback = (obj) => {
    if (typeof structuredClone === "function") {
        return structuredClone(obj);
    }
    else {
        return JSON.parse(JSON.stringify(obj));
    }
};
exports.structuredCloneWithFallback = structuredCloneWithFallback;
