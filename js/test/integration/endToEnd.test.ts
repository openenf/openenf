import {getTestExecutablePath} from "../../src/testUtils";
import {BaseENFProcessor} from "../../src/ENFProcessor/baseENFProcessor";
import path from "path";
import {ENFProcessorFactory} from "../../src/ENFProcessor/ENFProcessorFactory";

describe('BaseENFProcessor', () => {
    it('can lookup 1 hour audio sample over 2 grids entire range', async () => {
        const enfProcessor = ENFProcessorFactory
            .ExecutablePath(getTestExecutablePath())
            .Build();
        let pStr = "";
        let lStr = "";
        enfProcessor.analysisProgressEvent.addHandler(p => {
            console.log('p', p);
            pStr += p + '\n';
        })
        enfProcessor.logEvent.addHandler(s => {
            console.log(s)
            lStr += s + `\n`;
        })

        const filepath = path.resolve("test/testAudio/DE_2013-02-05T17:46:39_saw_9_D_secs_05amp_8Harmonics.wav");
        const results = await enfProcessor.performFullAnalysis(filepath,["DE","GB"]);
        console.log('results', results);
        console.log('pStr', pStr);
        console.log('lStr', lStr);
    }, 30000000)
});
