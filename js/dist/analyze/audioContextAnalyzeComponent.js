"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioContextAnalyzeComponent = void 0;
const ENFEventBase_1 = require("../ENFProcessor/events/ENFEventBase");
const validatePrescanResult_1 = require("./validatePrescanResult");
const goertzelAnalyzeProcessor_1 = require("./goertzelAnalyzeProcessor");
const getAudioData_1 = require("../audioContextUtils/getAudioData");
const fs_1 = __importDefault(require("fs"));
/**
 * Implements {@link AnalyzeComponent} using {@link getAudioData} which in turn uses an underlying {@link AudioContext}.
 * AudioContext is native in the browser but requires the web-audio-api package in Node.
 * Pros of using AudioContext:
 * - Very fast
 * Cons
 * - Can only handle .wav and .mp3 in Node.
 */
class AudioContextAnalyzeComponent {
    async analyze(resourceUri, preScanResult, expectedFrequency) {
        const goertzelStore = this.goertzelFilterCache.getStore(preScanResult.sampleRate, preScanResult.sampleRate);
        const frequencies = (0, validatePrescanResult_1.validatePreScanResult)(preScanResult, expectedFrequency);
        let buffer = fs_1.default.readFileSync(resourceUri);
        const [audioData, _] = await (0, getAudioData_1.getAudioData)(buffer, resourceUri);
        const analyzeProcessor = new goertzelAnalyzeProcessor_1.GoertzelAnalyzeProcessor(goertzelStore, frequencies[0], this.overlapFactor, this.analyzeProgressEvent, audioData.length);
        for (let i = 0; i < audioData.length; i += 67108864) {
            analyzeProcessor.process(audioData.slice(i, i + 67108864));
        }
        return analyzeProcessor.getResult();
    }
    constructor(goertzelFilterCache, overlapFactor) {
        this.analyzeProgressEvent = new ENFEventBase_1.ENFEventBase();
        this.implementationId = "AudioContextAnalyzeComponent0.0.1";
        this.goertzelFilterCache = goertzelFilterCache;
        this.overlapFactor = overlapFactor;
    }
}
exports.AudioContextAnalyzeComponent = AudioContextAnalyzeComponent;
