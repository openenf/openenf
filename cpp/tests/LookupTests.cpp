#include "doctest/doctest.h"
#include "../src/FreqDbReader.h"
#include "json.hpp"
#include <sstream>
#include "LookupTestHelpers.h"

/*TEST_CASE("can do lookup passing only frequency array and maxSingleDiff parameter") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));
    std::vector<int16_t> expectedFreqs = {1,8,5,7,2,8,5,8,2,3,1,2,3,4,5,8,1,9,2,4,0,0,9,9,7,2,1};
    std::vector<int16_t> freqsInDb = fsFreqDbReader.readDbToVector();
    if (expectedFreqs.size() != freqsInDb.size()) {
        CHECK(false);
    }
    for (unsigned long i = 0; i < expectedFreqs.size(); i++) {
        if (expectedFreqs[i] != freqsInDb[i]) {
            CHECK(false);
        }
    }

    std::vector<int16_t*> nullableFreqs = createNullableArray<int16_t>({1,2,3,4,5});

    std::vector<LookupResult> result = fsFreqDbReader.lookup(nullableFreqs, 1000);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
}*/

TEST_CASE("can do two consecutive lookups (checking for memory leaks)") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));
    std::vector<int16_t*> nullableFreqs = createNullableArray<int16_t>({1,2,3,4,5});
    std::vector<LookupResult> result = fsFreqDbReader.lookup(nullableFreqs, 1000);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);

    std::vector<int16_t*> nullableFreqs2 = createNullableArray<int16_t>({1,2,3,4,5});
    std::vector<LookupResult> result2 = fsFreqDbReader.lookup(nullableFreqs, 1000);
    CHECK(result2[0].position == 10);
    CHECK(result2[0].score == 0);
}

TEST_CASE("can do lookupInternal with null results") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));

    std::vector<int16_t*> freqsToSearch = createNullableArray<int16_t>({1, 2, 3, 4, 5});
    freqsToSearch[2] = nullptr;

    std::vector<LookupResult> result = fsFreqDbReader.lookup(freqsToSearch, 1000);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
}

TEST_CASE("can do lookupInternal with start and end times") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));
    std::vector<int16_t*> nullableFreqs = createNullableArray<int16_t>({1,2,3,4,5});
    std::vector<LookupResult> result = fsFreqDbReader.lookup(nullableFreqs, 1000, 10, 14);
    CHECK(result.size() == 5);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
    CHECK(result[1].position == 11);
    CHECK(result[1].score == 7);
}

TEST_CASE("can do lookup with start and end times and single thread") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));
    FreqDbMetaData metaData = fsFreqDbReader.getMetaData();
    int startDate = metaData.startDate;
    std::vector<int16_t*> nullableFreqs = createNullableArray<int16_t>({1, 2, 3, 4, 5});
    std::vector<LookupResult> result = fsFreqDbReader.lookup(nullableFreqs, 1000, 10, 14, 1);
    CHECK(result.size() == 5);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
    CHECK(result[1].position == 11);
    CHECK(result[1].score == 7);
}

TEST_CASE("fsFreqDbReader") {
    SUBCASE("can read metaData from a valid freqDB file") {
        FsFreqDbReader fsFreqDbReader(resolvePath("tests/TestFreqDb.freqdb"));
        FreqDbMetaData freqDbMetaData = fsFreqDbReader.getMetaData();
        CHECK(freqDbMetaData.baseFrequency == 50);
        CHECK(freqDbMetaData.gridId == "XX");
        CHECK(freqDbMetaData.startDate == 1262304000); //1st Jan 2010
        CHECK(freqDbMetaData.endDate == 1262304016); //1st Jan 2010 + 16 seconds
    }
    SUBCASE("can read all frequencies to an array") {
        FsFreqDbReader fsFreqDbReader(resolvePath("tests/TestFreqDb.freqdb"));
        std::vector<int16_t> expectedResult = {-500, -499, -10, -2, -1,
                                          0, 1, 10, 20, 30,
                                          40, 50, 60, 70, 499,
                                          500};
        std::vector<int16_t> result = fsFreqDbReader.readDbToVector();
        CHECK(result.size() == expectedResult.size());
        for (unsigned long  i = 0; i < result.size(); i++) {
            CHECK(expectedResult[i] == result[i]);
        }
    }
}
