export const arrayToVectorInt16_t = (Module: any, a:(number|null)[]) =>{
    const lookupVector = new Module.vectorInt16_t();
    a.forEach(v => {
        lookupVector.push_back(v === null ? -32768 : v);
    })
    return lookupVector;
}

export const vectorToArray = (vector: any, pluckProperties?: string[]) => {
    const returnArray = [];
    for(let i = 0; i < vector.size(); i++) {
        if (!pluckProperties) {
            returnArray[i] = vector.get(i);
        }
        else {
            const obj:any = {};
            pluckProperties.forEach(p => {
                obj[p] = vector.get(i)[p];
            })
            returnArray[i] = obj;
        }
    }
    return returnArray;
}
