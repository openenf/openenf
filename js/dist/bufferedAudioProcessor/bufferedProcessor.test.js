"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bufferedAudioProcessor_1 = require("./bufferedAudioProcessor");
describe('BufferedProcessor', () => {
    it('Executes processor when window size is exceeded', () => {
        const windowSize = 11;
        let executed = false;
        const subject = new bufferedAudioProcessor_1.BufferedAudioProcessor(windowSize, (window) => {
            executed = true;
            expect(window).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });
        subject.addChunk([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(executed).toBeFalsy();
        subject.addChunk([10]);
        expect(executed).toBeTruthy();
    });
    it('Includes remainder in subsequent processor execution', () => {
        const windowSize = 5;
        let processorExecutionCount = 0;
        const subject = new bufferedAudioProcessor_1.BufferedAudioProcessor(windowSize, (window) => {
            processorExecutionCount++;
            switch (processorExecutionCount) {
                case 1:
                    expect(window).toStrictEqual([0, 1, 2, 3, 4]);
                    break;
                case 2:
                    expect(window).toStrictEqual([5, 6, 7, 8, 9]);
                    break;
            }
        });
        subject.addChunk([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        subject.addChunk([9]);
        expect(processorExecutionCount).toBe(2);
    });
    it('Fires twice consecutively if chunk is twice as big as the buffer', () => {
        const windowSize = 2;
        let processorExecutionCount = 0;
        const subject = new bufferedAudioProcessor_1.BufferedAudioProcessor(windowSize, (window) => {
            processorExecutionCount++;
            switch (processorExecutionCount) {
                case 1:
                    expect(window).toStrictEqual([0, 1]);
                    break;
                case 2:
                    expect(window).toStrictEqual([2, 3]);
                    break;
                case 3:
                    expect(window).toStrictEqual([4, 5]);
                    break;
            }
        });
        subject.addChunk([0, 1, 2, 3, 4]);
        expect(processorExecutionCount).toBe(2);
        subject.addChunk([5]);
        expect(processorExecutionCount).toBe(3);
    });
    it('Flushes remainder on flush()', () => {
        const windowSize = 2;
        let processorExecutionCount = 0;
        const subject = new bufferedAudioProcessor_1.BufferedAudioProcessor(windowSize, (window) => {
            processorExecutionCount++;
            switch (processorExecutionCount) {
                case 1:
                    expect(window).toStrictEqual([0, 1]);
                    break;
                case 2:
                    expect(window).toStrictEqual([2]);
                    break;
                case 3:
                    expect(window).toStrictEqual([]);
                    break;
            }
        });
        subject.addChunk([0, 1, 2]);
        expect(processorExecutionCount).toBe(1);
        subject.flush();
        expect(processorExecutionCount).toBe(2);
        subject.flush();
        expect(processorExecutionCount).toBe(3);
    });
    it('Processes on quarter buffers if specified in constructor', () => {
        const windowSize = 8;
        const overlapFactor = 4;
        let processorExecutionCount = 0;
        const onWindowFull = (window) => {
            processorExecutionCount++;
            switch (processorExecutionCount) {
                case 1:
                    expect(window).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7]);
                    break;
                case 2:
                    expect(window).toStrictEqual([2, 3, 4, 5, 6, 7, 8, 9]);
                    break;
                case 3:
                    expect(window).toStrictEqual([4, 5, 6, 7, 8, 9, 10, 11]);
                    break;
                case 4:
                    expect(window).toStrictEqual([6, 7, 8, 9, 10, 11, 12, 13]);
                    break;
                case 5:
                    expect(window).toStrictEqual([8, 9, 10, 11, 12, 13, 14, 15]);
                    break;
            }
        };
        const subject = new bufferedAudioProcessor_1.BufferedAudioProcessor(windowSize, onWindowFull, overlapFactor);
        subject.addChunk([0, 1, 2, 3, 4, 5, 6]);
        expect(processorExecutionCount).toBe(0);
        subject.addChunk([7, 8]);
        expect(processorExecutionCount).toBe(1);
        subject.addChunk([9]);
        expect(processorExecutionCount).toBe(2);
        subject.addChunk([10, 11]);
        expect(processorExecutionCount).toBe(3);
        subject.addChunk([12, 13]);
        expect(processorExecutionCount).toBe(4);
        subject.addChunk([14, 15]);
        expect(processorExecutionCount).toBe(5);
    });
});
