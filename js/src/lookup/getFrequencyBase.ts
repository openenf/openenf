export const getFrequencyBase = (freqs: (number | null)[]):50|60 => {
    const possBases = [50, 60];
    const sums = possBases.map(base => {
        return freqs.reduce((sum:number, freq) => {
            return sum + (freq == null ? 0 : Math.abs(base - freq))
        }, 0);
    })
    return (sums[0] < sums[1]) ? 50 : 60;
}
