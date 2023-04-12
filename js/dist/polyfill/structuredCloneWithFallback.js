export const structuredCloneWithFallback = (obj) => {
    if (typeof structuredClone === "function") {
        return structuredClone(obj);
    }
    else {
        return JSON.parse(JSON.stringify(obj));
    }
};
