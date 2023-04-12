import fs from "fs";
import path from "path";

test('execute goertzelFilter in a Chrome Javascript engine using puppeteer', async () => {
    const samples = JSON.parse(fs.readFileSync(path.resolve('test/testAnalysisOutput/59.95Hz1Second.json'),'utf-8'));
    const page = await browser.newPage();
    await page.addScriptTag({path:'dist/goertzel/GoertzelFilter.js', type:'module'});
    const result = await page.evaluate((samples) => {
        const goertzelFilter = new (window as any).GoertzelFilter();
        const detectFrequencyHz = 59.95;
        const sampleFrequencyHz = 44100;
        const windowSizeSamples = 44100;
        goertzelFilter.init(detectFrequencyHz, sampleFrequencyHz, windowSizeSamples)
        const result = goertzelFilter.run(samples);
        return result;
    },samples);
    expect(result).toBe(0.059335745806406694);
},20000);