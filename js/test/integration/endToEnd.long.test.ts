import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import path from "path";
import {ENFProcessorFactory} from "../../src/ENFProcessor/ENFProcessorFactory";
import {getTestExecutablePath} from "../../src/testUtils";

describe('BaseENFProcessor', () => {
    it('can lookup 1 hour audio sample over 2 grids entire range', async () => {
        const enfProcessor = ENFProcessorFactory
            .ExecutablePath(getTestExecutablePath())
            .Build();
        let previousProgress = 0;
        enfProcessor.analysisProgressEvent.addHandler(p => {
            if (p) {
                expect(p).toBeGreaterThanOrEqual(previousProgress);
                previousProgress = p;
            }
        })
        enfProcessor.logEvent.addHandler(s => {
            console.log(s)
        })

        const filepath = path.resolve("test/testAudio/large/DE_2021-12-30T040946_saw_3600_D_secs_05amp_8Harmonics.wav");
        const results = await enfProcessor.performFullAnalysis(filepath,["DE","GB"]);
        console.log('results', results);
    }, 30000000)
});
