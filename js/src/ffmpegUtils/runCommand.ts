import ffmpeg from "fluent-ffmpeg";

const convertChunkToFloats = (chunk:Float32Array) => {
    const floats = [];
    for(let i = 0; i < chunk.length; i = i + 4) {
        const data =  [chunk[i], chunk[i+1], chunk[i+2], chunk[i+3]];
        const buf = new ArrayBuffer(4);
        floats.push(Buffer.from(data).readFloatBE(0))
        const view = new DataView(buf);
        data.forEach(function (b, i) {
            view.setUint8(i, b);
        });
    }
    return Float32Array.from(floats);
}

const buildCommand = (path:string, onComplete:() => void) => {
    const command = ffmpeg(path)
        .noVideo()
        .format('f32be')
        .audioCodec('pcm_f32be')
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('stderr', function(stderrLine) {
            //console.error('Stderr output: ' + stderrLine);
        })
        .on('error', function(err) {
            console.error('An error occurred: ' + err.message);
        })
        .on('end', function() {
            onComplete()
        });
    return command;
}

function getFirstChannel(chunk:Float32Array, numChannels: number):number[] {
    const returnArray = [];
    for(let i = 0; i < chunk.length; i = i + numChannels) {
        if (chunk[i] !== undefined) {
            returnArray.push(chunk[i])
        }
    }
    return returnArray;
}

export const runCommand = async (path:string, numChannels:number, onProgress:(floats:number[]) => void):Promise<void> => {
    return new Promise(resolve => {
        const command = buildCommand(path, () => {
            resolve();
        })
        const ffStream = command.pipe();
        ffStream.on('data', function(chunk) {
            onProgress(getFirstChannel(convertChunkToFloats(chunk),numChannels))
        });
    })
}
