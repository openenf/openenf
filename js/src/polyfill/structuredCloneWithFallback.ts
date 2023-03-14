export const structuredCloneWithFallback = (obj:any) => {
    if (typeof structuredClone === "function") {
        return structuredClone(obj);
    } else {
        return JSON.parse(JSON.stringify(obj));
    }
}
