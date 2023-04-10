"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioContextPreScanComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const fs_1 = __importDefault(require("fs"));
const getAudioData_1 = require("../audioContextUtils/getAudioData");
const preScanProcessor_1 = require("./preScanProcessor");
const preScanResult_1 = require("./preScanResult");
class AudioContextPreScanComponent {
    constructor(goertzelFilterCache) {
        this.implementationId = "AudioContextPreScanComponent0.0.1";
        this.preScanProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.audioLoadedEvent = new ENFEventBase_1.ENFEventBase();
        this.goertzelFilterCache = goertzelFilterCache;
    }
    async preScan(resourceUri) {
        let buffer = fs_1.default.readFileSync(resourceUri);
        const [audioData, metaData] = await (0, getAudioData_1.getAudioData)(buffer, resourceUri);
        this.audioLoadedEvent.trigger(audioData);
        const goertzelStore = this.goertzelFilterCache.getStore(metaData.sampleRate, metaData.sampleRate);
        const preScanProcessor = new preScanProcessor_1.PreScanProcessor(goertzelStore, this.preScanProgressEvent, audioData.length);
        for (let i = 0; i < audioData.length; i += 67108864) {
            preScanProcessor.process(audioData.slice(i, i + 67108864));
        }
        const firstPassResult = preScanProcessor.getResult();
        return new preScanResult_1.PreScanResult(firstPassResult, metaData);
    }
}
exports.AudioContextPreScanComponent = AudioContextPreScanComponent;
