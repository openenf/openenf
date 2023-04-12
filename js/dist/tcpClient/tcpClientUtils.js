import path from "path";
import os from "os";
export const toPascalCase = (key, value) => {
    if (value && typeof value === 'object') {
        for (var k in value) {
            if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
                value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                delete value[k];
            }
        }
    }
    return value;
};
export const getDefaultExecutablePath = () => {
    let executablePath = path.join(__filename, "../../../test", "serverExecutable");
    switch (os.platform()) {
        case "win32":
            executablePath = path.join(executablePath, "windows", "ENFLookupServer.exe");
            break;
        case "darwin":
            executablePath = path.join(executablePath, "macos", "ENFLookupServer");
            break;
        default:
            executablePath = path.join(executablePath, "linux", "ENFLookupServer");
    }
    return path.resolve(executablePath);
};
