const fixChunk = (s, chunk) => {
    function fixStart(s, right) {
        const targetHz = s[right + 1].hz;
        for (let i = 0; i <= right; i++) {
            s[i].hz = targetHz;
        }
    }
    function fixEnd(s, left) {
        const targetHz = s[left - 1].hz;
        for (let i = left; i < s.length; i++) {
            s[i].hz = targetHz;
        }
    }
    function fixMid(s, left, right) {
        const rightHz = s[right + 1].hz;
        const leftHz = s[left - 1].hz;
        if (rightHz == null || leftHz == null) {
            return;
        }
        const diff = rightHz - leftHz;
        const points = right - left + 2;
        const delta = diff / points;
        let targetHz = leftHz;
        for (let i = left; i <= right; i++) {
            targetHz = targetHz + delta;
            s[i].hz = targetHz;
        }
    }
    const keys = Object.keys(chunk);
    const start = parseInt(keys[0]);
    const end = parseInt(keys[keys.length - 1]);
    /*if (keys.length >= 9) {
        for (let i = start; i <= end; i++) {
            s[i].hz = null
        }
        return;
    }*/
    if (start == 0) {
        fixStart(s, end);
    }
    else if (end == s.length - 1) {
        fixEnd(s, start);
    }
    else
        fixMid(s, start, end);
};
export const interpolateUnconfidentSamples = (samples, confidence, windowSize) => {
    if (!samples.length) {
        return samples;
    }
    confidence = confidence * (windowSize * windowSize);
    let interpolationChunk = {};
    samples.forEach((s, i) => {
        if (s.confidence >= confidence) {
            interpolationChunk[i] = s;
        }
        else {
            if (Object.keys(interpolationChunk).length) {
                fixChunk(samples, interpolationChunk);
                interpolationChunk = {};
            }
        }
    });
    //Check to see if there's an outstanding chunk at the end of the sample
    if (Object.keys(interpolationChunk).length) {
        fixChunk(samples, interpolationChunk);
    }
    return samples;
};
