import path from "path";
import os from "os";

export const getTestExecutablePath = () => {
    let executablePath = path.join("test","serverExecutable");
    switch (os.platform()) {
        case "win32":
            executablePath = path.join(executablePath,"windows","ENFLookupServer.exe");
            break;
        case "darwin":
            executablePath = path.join(executablePath,"macos","ENFLookupServer");
            break;
        default:
            executablePath = path.join(executablePath,"linux","ENFLookupServer");
    }
    return path.resolve(executablePath);
}
