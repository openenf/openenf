import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import path from "path";
import {ENFProcessorFactory} from "../../src/ENFProcessor/ENFProcessorFactory";
import {getTestExecutablePath} from "../../src/testUtils";

describe('BaseENFProcessor',  () => {
    it('can lookup 10 minute audio sample over 2 grids 1 year range', async () => {
        const enfProcessor = await ENFProcessorFactory
            .ExecutablePath(getTestExecutablePath())
            .Build();
        let previousProgress = 0;
        enfProcessor.progressEvent.addHandler(p => {
            console.log(`${p} BaseENFProcessor - can lookup 10 minute audio sample over 2 grids 1 year range`)
            if (p) {
                expect(p).toBeGreaterThanOrEqual(previousProgress);
                previousProgress = p;
            }
        })
        enfProcessor.logEvent.addHandler(s => {
            console.log(s)
        })

        const filepath = path.resolve("test/testAudio/large/DE_2021-02-22T11:52:58_saw_600_H_secs_05amp_8Harmonics.wav");
        const results:any = await enfProcessor.performFullAnalysis(filepath,["DE","GB"], new Date("2020-12-01"), new Date("2021-12-01"));
        expect(results.ENFAnalysisResults[0].time).toStrictEqual(new Date("2021-02-22T11:53:00.000Z"))
    }, 720000)
    it('can lookup real-world GB audio sample', async () => {
        const enfProcessor = await ENFProcessorFactory
            .ExecutablePath(getTestExecutablePath())
            .Build();
        let previousProgress = 0;
        enfProcessor.progressEvent.addHandler(p => {
            console.log(`${p} BaseENFProcessor - can lookup real-world GB audio sample`)
            if (p) {
                expect(p).toBeGreaterThanOrEqual(previousProgress);
                previousProgress = p;
            }
        })
        enfProcessor.logEvent.addHandler(s => {
            console.log(s)
        })

        const filepath = path.resolve("test/testAudio/large/608774__theplax__downstairs-in-boots-library_TRIM.wav");
        let results;
        try {
            results = await enfProcessor.performFullAnalysis(filepath, ["DE", "GB"], new Date("2020-12-01"), new Date("2023-12-01"));
        }
        finally {
            await enfProcessor.dispose();
        }
        expect(results.ENFAnalysisResults).not.toBeNull();
        if (results.ENFAnalysisResults) {
            const result = results.ENFAnalysisResults[0];
            expect(result.time).toStrictEqual(new Date("2021-11-04T13:35:32.000Z"));
        }
    }, 720000)
});
