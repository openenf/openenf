#pragma once

#include <vector>

namespace LookupHelpers
{
    /// Convert an array of double pointers, (e.g. 49.999, 50.001, 50.002) to a normalised array of shorts, (e.g. -1, 1, 2)
    std::vector<short*> normaliseFreqs(std::vector<double*> freqs, int baseFrequency);

    /// Converts a double, e.g. 50.123 to a normalised short, e.g. 123
    short* doubleToNormalisedShort(double* f, int baseFrequency);

    /// For a given array length, frequencies vector length and number of threads, getArrayThreadBounds returns the start and
    /// end searching positions on the array for each thread
    std::vector<std::vector<int>> getArrayThreadBounds(int arrayLength, int numThreads, int freqLength);

    /// At the time of writing (March 2023) Emscripten support for raw pointers is poor,
    /// https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html#embind-raw-pointers
    /// so this helper exists to convert a standard vector to a nullable one with -32768 standing in for a null pointer
    std::vector<int16_t*> nonPointerToPointerVector(std::vector<int16_t> freqs);
}
