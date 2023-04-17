"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENFEventBase = void 0;
class ENFEventBase {
    constructor() {
        this.handlers = [];
    }
    addHandler(handler) {
        this.handlers.push(handler);
    }
    removeHandler(handler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }
    trigger(data) {
        this.handlers.slice(0).forEach(h => h(data));
    }
}
exports.ENFEventBase = ENFEventBase;
