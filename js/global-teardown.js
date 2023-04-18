module.exports = async function globalTeardown() {
    // clean up any resources held by the serverController object
    if (global.serverController) {
        await global.serverController.stop();
    }
};
