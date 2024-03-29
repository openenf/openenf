import {AnalysisWindowResult} from "../model/analysisWindowResult";
import {GoertzelReduceComponent} from "./goertzelReduceComponent";
import fs from "fs";

describe('goertzelReduceComponent', () => {
    it('reduces an AnalysisWindowResults array with 100% accurate frequency match to the source to a 100% accurate stream of frequencies', async () => {
        const analysisWindowJsonFile = "src/reduce/testData/GB_50_Jan2014_analayzeOutput_OF1.json";
        const analysisWindows: AnalysisWindowResult[] = JSON.parse(fs.readFileSync(analysisWindowJsonFile, 'utf-8'));
        const goertzelReduceComponent = new GoertzelReduceComponent(1);
        const result = await goertzelReduceComponent.reduce(analysisWindows);
        //Note the NULLs in the expected result are because the signal deviates ±0.4Hz from the base frequency.
        const expectedResult = [49.94,49.98,49.98,50.01,50.02,50.05,50.01,50.01,50.03,50.04,50.04,50.05,50.05,50.06,50.04,50.02,50.01,49.96,49.95,49.91,49.89,49.86,49.87,49.85,49.85,49.81,49.75,49.74,49.69,49.65,49.62,49.61,49.61,49.62,49.6,49.6,49.62,49.63,49.62,49.62,49.6,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,49.61,49.6,49.61,49.63,49.61,49.64,49.64,49.63,49.64,49.63,49.64,49.63,49.63,49.64,49.67,49.69,49.71,49.71,49.72,49.74,49.75,49.77,49.77,49.78,49.78];
        expect(result).toStrictEqual(expectedResult);
    })
    it('reduces a real-world sample correctly', async () => {
        const analysisWindowJsonFile = "test/testAnalysisOutput/618186__theplax__tumble-dryer-contact.wav.analysis.json";
        const analysisWindows: AnalysisWindowResult[] = JSON.parse(fs.readFileSync(analysisWindowJsonFile, 'utf-8'));
        const goertzelReduceComponent = new GoertzelReduceComponent(16);
        const result = await goertzelReduceComponent.reduce(analysisWindows);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toStrictEqual([
                50.016,
                50.036,
                50.004,
                50.02,
                50.008,
                49.989,
                50.052,
                50.033,
                50.051,
                50.036,
                50.05,
                50.032,
                50.037,
                50.023,
                50.043,
                50.019,
                50.041,
                50.016,
                50.023,
                50.029,
                50.021,
                50.039,
                50.026,
                50.016,
                50.044,
                50.036,
                50.03,
                50.018,
                50.027,
                50.044,
                50.005,
                50.027,
                50.038,
                50.02,
                50.023,
                50.04,
                50.047,
                50.051,
                50.039,
                50.042,
                50.066,
                50.041,
                50.051,
                50.044,
                50.043,
                50.053,
                50.032,
                50.056,
                50.053,
                50.037,
                50.047,
                50.039,
                50.066,
                50.037,
                50.033,
                50.053,
                50.056,
                50.058,
                50.049,
                50.059,
                50.062,
                50.053,
                50.052,
                50.055,
                50.052,
                50.056,
                50.052,
                50.066,
                50.044,
                50.05,
                50.049,
                50.042,
                50.048,
                50.056,
                50.047,
                50.033,
                50.053,
                50.056,
                50.04,
                50.032
            ]
        );
    })
    it('reduces apawlak sample correctly', async () => {
        const analysisWindowJsonFile = "test/testAnalysisOutput/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.analysis.threaded.json";
        const analysisWindows: AnalysisWindowResult[] = JSON.parse(fs.readFileSync(analysisWindowJsonFile, 'utf-8'));
        const goertzelReduceComponent = new GoertzelReduceComponent(16);
        const result = await goertzelReduceComponent.reduce(analysisWindows);
        //fs.writeFileSync("test/testFreqs/404931__alanpawlak__ambientuohstudentunion44-1-24bit.wav.freqs.json", JSON.stringify(result))
        console.log(result);
    });
    it('reduces an array of AnalysisWindowResults with GoertzelHarmonicResult data to a stream of frequencies (and possibly nulls)', async () => {
        const goertzelReduceComponent = new GoertzelReduceComponent(1);
        const result = await goertzelReduceComponent.reduce(analyzeOutput);
        expect(result).toStrictEqual([59.96, 59.97, 59.98, 59.99, 60, 60.01, 60.02, 60.03, 60.04]);
    })
    const analyzeOutput: AnalysisWindowResult[] = [
        {
            "start": 0,
            "end": 1,
            "startSamples": 0,
            "endSamples": 44099,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.05933393212430416,
                    "hz": 59.9501953125,
                    "standardDev": 0.0002487282932732517,
                    "confidence": 0.004192007580960043,
                    "target": 60
                }
            ]
        },
        {
            "start": 1,
            "end": 2,
            "startSamples": 44100,
            "endSamples": 88199,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.059333950712187986,
                    "hz": 59.96044921875,
                    "standardDev": 0.00024907766011294716,
                    "confidence": 0.004197894411601742,
                    "target": 60
                }
            ]
        },
        {
            "start": 2,
            "end": 3,
            "startSamples": 88200,
            "endSamples": 132299,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.059333940580178185,
                    "hz": 59.9703369140625,
                    "standardDev": 0.00024914683565597037,
                    "confidence": 0.004199060996451049,
                    "target": 60
                }
            ]
        },
        {
            "start": 3,
            "end": 4,
            "startSamples": 132300,
            "endSamples": 176399,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.05933393799241133,
                    "hz": 59.980224609375,
                    "standardDev": 0.0002490338797897533,
                    "confidence": 0.004197157448433714,
                    "target": 60
                }
            ]
        },
        {
            "start": 4,
            "end": 5,
            "startSamples": 176400,
            "endSamples": 220499,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.0593339311728159,
                    "hz": 59.990478515625,
                    "standardDev": 0.0002493352767528784,
                    "confidence": 0.004202237603752648,
                    "target": 60
                }
            ]
        },
        {
            "start": 5,
            "end": 6,
            "startSamples": 220500,
            "endSamples": 264599,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.059333914895456134,
                    "hz": 60,
                    "standardDev": 0.0002488979562650671,
                    "confidence": 0.004194868258796253,
                    "target": 60
                }
            ]
        },
        {
            "start": 6,
            "end": 7,
            "startSamples": 264600,
            "endSamples": 308699,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.059333949526515245,
                    "hz": 60.01025390625,
                    "standardDev": 0.0002490317599475832,
                    "confidence": 0.004197120905229737,
                    "target": 60
                }
            ]
        },
        {
            "start": 7,
            "end": 8,
            "startSamples": 308700,
            "endSamples": 352799,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.05933393847948495,
                    "hz": 60.0201416015625,
                    "standardDev": 0.0002490710543884321,
                    "confidence": 0.004197783945769079,
                    "target": 60
                }
            ]
        },
        {
            "start": 8,
            "end": 9,
            "startSamples": 352800,
            "endSamples": 396899,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.05933394499007736,
                    "hz": 60.030029296875,
                    "standardDev": 0.000249083358724767,
                    "confidence": 0.004197990859472131,
                    "target": 60
                }
            ]
        },
        {
            "start": 9,
            "end": 10,
            "startSamples": 396900,
            "endSamples": 440999,
            "channelNum": 1,
            "data": [
                {
                    "amp": 0.05933375023444811,
                    "hz": 60.040283203125,
                    "standardDev": 0.00024859619232690366,
                    "confidence": 0.004189794026917468,
                    "target": 60
                }
            ]
        }
    ]
})
