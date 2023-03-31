import os from "os";
import {app} from "electron";
import path from "path";

export const getENFDataDirectory = (): string => {
    const platform = os.platform();
    const appDataPath = app ? app.getPath('userData') : os.homedir();
    const appDirectoryName = "OpenENF";
    if (platform === 'win32') {
        return path.join(appDataPath, 'AppData', 'Roaming', appDirectoryName);
    } else if (platform === 'darwin') {
        return path.join(appDataPath, 'Library', 'Application Support', appDirectoryName);
    } else {
        return path.join(appDataPath, '.config', appDirectoryName.toLowerCase());
    }
};
