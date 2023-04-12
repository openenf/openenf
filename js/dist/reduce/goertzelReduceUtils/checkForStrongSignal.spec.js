import { checkForStrongSignal } from "./checkForStrongSignal";
describe('checkForStrongSignal', () => {
    it('returns true for a series of 9 non-null frequencies', () => {
        const frequencies = [
            59.96, 59.97, 59.98,
            59.99, 60, 60.01,
            60.02, 60.03, 60.04
        ];
        const result = checkForStrongSignal(frequencies);
        expect(result).toBe(true);
    });
    it('returns true for a series two sets of 4 non-null frequencies separated by null', () => {
        const frequencies = [
            59.96, 59.97, 59.98,
            59.99, null, 60.01,
            60.02, 60.03, 60.04
        ];
        const result = checkForStrongSignal(frequencies);
        expect(result).toBe(false);
    });
});
