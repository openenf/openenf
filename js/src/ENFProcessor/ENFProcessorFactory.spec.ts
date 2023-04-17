import {ENFProcessorFactory} from "./ENFProcessorFactory";

describe('ENFProcessorFactory',  () => {
    it('can build with defaults', async () => {
        await ENFProcessorFactory.Build();
        //Nothing to expect to here provided the build completes without error.
    }, 20000);
})