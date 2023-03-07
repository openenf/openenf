#include <cmath>
#include "LookupHelpers.h"

namespace LookupHelpers {
    std::vector<std::vector<int>> getArrayThreadBounds(int arrayLength, int numThreads, int freqLength) {
        std::vector<std::vector<int>> results = std::vector<std::vector<int>>();
        results.reserve(numThreads);
        int startInterval = floor(arrayLength / numThreads);
        int remainder = arrayLength - (startInterval * numThreads);
        for(int i = 0; i < numThreads; i++) {
            std::vector<int> result = std::vector<int>();
            result.reserve(2);
            int chunkRemainder = 0;
            if (i == numThreads - 1) {
                chunkRemainder = remainder;
            }
            int start = i * startInterval;
            int end = std::min(arrayLength, ((i+1) * startInterval) - 1 + freqLength + chunkRemainder);
            result.push_back(start);
            result.push_back(end);
            results.push_back(result);
        }
        return results;
    }

    std::vector<int16_t*> nonPointerToPointerVector(std::vector<int16_t> freqs) {
        std::vector<int16_t*> nullableVector;
        for(int i = 0; i < freqs.size(); i++) {
            int16_t* pointer = nullptr;
            if (freqs[i] != -32768) {
                pointer = new int16_t(freqs[i]);
            }
            nullableVector.push_back(pointer);
        }
        return nullableVector;
    }

    std::vector<short*> normaliseFreqs(std::vector<double*> freqs, int baseFrequency) {
        std::vector<short *> results = std::vector<short *>();
        results.reserve(freqs.size());
        for (double* f : freqs) {
            if (f == nullptr) {
                results.push_back(nullptr);
            } else {
                double diff = (*f - baseFrequency);
                double roundUp = round(diff * 1000);
                short* s = new short(static_cast<short>(roundUp));
                results.push_back(s);
            }
        }
        return results;
    }

    short* doubleToNormalisedShort(double* f, int baseFrequency) {
        if (f == nullptr) {
            return nullptr;
        }
        double diff = (*f - baseFrequency);
        double roundUp = round(diff * 1000);
        short s = static_cast<short>(roundUp);
        short* ss = &s;
        return ss;
    }
}

#ifdef ENABLE_DOCTEST_IN_LIBRARY
#include "doctest/doctest.h"
#include "../tests/LookupTestHelpers.h"

TEST_CASE("can normalise float to short") {
    short result = *LookupHelpers::doubleToNormalisedShort(new double(50.001), 50);
    CHECK(result == 1);
    result = *LookupHelpers::doubleToNormalisedShort(new double(50.002), 50);
    CHECK(result == 2);
    result = *LookupHelpers::doubleToNormalisedShort(new double(50.003), 50);
    CHECK(result == 3);

    result = *LookupHelpers::doubleToNormalisedShort(new double(50), 50);
    CHECK(result == 0);

    result = *LookupHelpers::doubleToNormalisedShort(new double(49.999), 50);
    CHECK(result == -1);
    result = *LookupHelpers::doubleToNormalisedShort(new double(49.998), 50);
    CHECK(result == -2);
    result = *LookupHelpers::doubleToNormalisedShort(new double(49.997), 50);
    CHECK(result == -3);
}

TEST_CASE("can convert vector of frequencies pointers to normalised short vector") {
    std::vector<double> freqs = {49.963, 49.963, 49.963, 49.961, 49.963, 49.962, 49.96, 49.962, 49.959, 49.958};
    std::vector<double*> nullableFreqs = convertToDoublePtrs(freqs);
    nullableFreqs[2] = nullptr;
    std::vector<short> expectedResult = {-37,-37,-37,-39,-37,-38,-40,-38,-41,-42};
    std::vector<short*> nullableExpectedResult = createNullableArray(expectedResult);
    nullableExpectedResult[2] = nullptr;
    std::vector<short*> result = LookupHelpers::normaliseFreqs(nullableFreqs, 50);
    CHECK(arraysAreEqual(result, nullableExpectedResult));
}

TEST_CASE("get array thread bounds works") {
    int arrayLength = 17;
    int numThreads = 3;
    int freqLength = 5;
    std::vector<std::vector<int>> result = LookupHelpers::getArrayThreadBounds(arrayLength, numThreads, freqLength);
    CHECK(result.size() == numThreads);
    CHECK(result[0][0] == 0);
    CHECK(result[0][1] == 9);

    CHECK(result[1][0] == 5);
    CHECK(result[1][1] == 14);

    CHECK(result[2][0] == 10);
    CHECK(result[2][1] == 17);
}

TEST_CASE("get array thread bounds works for single thread") {
    int arrayLength = 27;
    int numThreads = 1;
    int freqLength = 5;
    std::vector<std::vector<int>> result = LookupHelpers::getArrayThreadBounds(arrayLength, numThreads, freqLength);
    CHECK(result.size() == numThreads);
    CHECK(result[0][0] == 0);
    CHECK(result[0][1] == 27);
}

TEST_CASE("non-pointer to pointer vector works") {
    std::vector<int16_t> freqs = {1, 2, -32768, 4, 5};
    std::vector<int16_t*> result = LookupHelpers::nonPointerToPointerVector(freqs);
    CHECK(*result[0] == 1);
    CHECK(*result[1] == 2);
    CHECK(result[2] == nullptr);
    CHECK(*result[3] == 4);
    CHECK(*result[4] == 5);
}

#endif
