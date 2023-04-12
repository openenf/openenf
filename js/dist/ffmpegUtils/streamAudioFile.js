import ffmpeg from "fluent-ffmpeg";
const convertChunkToFloats = (chunk) => {
    const floats = [];
    for (let i = 0; i < chunk.length; i = i + 4) {
        const data = [chunk[i], chunk[i + 1], chunk[i + 2], chunk[i + 3]];
        const buf = new ArrayBuffer(4);
        floats.push(Buffer.from(data).readFloatBE(0));
        const view = new DataView(buf);
        data.forEach(function (b, i) {
            view.setUint8(i, b);
        });
    }
    return Float32Array.from(floats);
};
const buildCommand = (path, onComplete) => {
    const command = ffmpeg(path)
        .noVideo()
        .format('f32be')
        .audioCodec('pcm_f32be')
        .on('start', function (commandLine) {
        //console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
        .on('stderr', function (stderrLine) {
        //console.error('Stderr output: ' + stderrLine);
    })
        .on('error', function (err) {
        console.error('An error occurred: ' + err.message);
    })
        .on('end', function () {
        onComplete();
    });
    return command;
};
function getFirstChannel(chunk, numChannels) {
    const returnArray = [];
    for (let i = 0; i < chunk.length; i = i + numChannels) {
        if (chunk[i] !== undefined) {
            returnArray.push(chunk[i]);
        }
    }
    return returnArray;
}
/**
 * Streams chunks of audio from the supplied path. Once a chunk has been read and converted to PCM audio it's passed to {@link onProgress}
 * @param path The filepath to the audio
 * @param numChannels The number of channels in the audio
 * @param onProgress The function to fire when a chunk of audio has been read and converted to PCM.]
 */
export const streamAudioFile = async (path, numChannels, onProgress) => {
    return new Promise(resolve => {
        const command = buildCommand(path, () => {
            resolve();
        });
        const ffStream = command.pipe();
        ffStream.on('data', function (chunk) {
            onProgress(getFirstChannel(convertChunkToFloats(chunk), numChannels));
        });
    });
};
