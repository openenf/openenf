#include "doctest/doctest.h"
#include "../src/FreqDbReader.h"
#include "json.hpp"
#include <sstream>
#include "LookupTestHelpers.h"

TEST_CASE("can read file with millions of entries") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/GB_50_Jan2014.freqdb"));

    std::vector<int16_t> first100 = {31,26,19,8,0,-2,-8,-13,-21,-23,-23,-21,-25,-25,-22,-19,-18,-16,-11,-8,-5,-6,-5,-3,-2,-1,-1,2,3,2,-3,-6,-4,-8,-7,-5,-5,-8,-10,-10,-11,-11,-11,-11,-6,-1,-2,0,-1,-4,-11,-20,-23,-29,-31,-32,-28,-22,-21,-21,-28,-31,-35,-41,-45,-50,-56,-58,-56,-57,-56,-49,-43,-37,-30,-21,-18,-19,-20,-21,-22,-23,-22,-19,-9,-3,5,8,7,8,2,-7,-17,-25,-29,-34,-37,-36,-33,-32};
    std::vector<int16_t> mid100_1339200_1339300 = {-7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21};
    std::vector<int16_t> last100 = {56,52,51,50,51,47,51,52,53,55,56,54,57,56,58,57,55,54,46,39,33,30,26,23,19,20,19,19,18,21,19,22,21,24,22,25,24,27,29,28,27,26,23,20,17,19,18,14,13,12,13,10,12,10,9,8,9,7,11,10,7,9,7,8,7,12,17,18,24,22,23,18,19,17,15,12,10,9,11,13,12,16,18,20,21,22,21,18,18,16,16,10,7,6,5,5,5,8,6,9};

    std::vector<int16_t> freqsInDb = fsFreqDbReader.readDbToVector();
    std::vector<int> first100Db(freqsInDb.begin() + 0, freqsInDb.begin() + 100);
    std::vector<int> mid00Db(freqsInDb.begin() + 1339200, freqsInDb.begin() + 1339300);
    std::vector<int> last100Db(freqsInDb.begin() + 2678300, freqsInDb.begin() + 2678400);

    CHECK(freqsInDb.size() == 2678400);
    CHECK(std::equal(first100.begin(), first100.end(), first100Db.begin()));
    CHECK(std::equal(mid100_1339200_1339300.begin(), mid100_1339200_1339300.end(), mid00Db.begin()));
    CHECK(std::equal(last100.begin(), last100.end(), last100Db.begin()));
}

TEST_CASE("can do single thread lookup on large file") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/GB_50_Jan2014.freqdb"));
    std::vector<int16_t> lookupFreqs = {-7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21};
    std::vector<LookupResult> result = fsFreqDbReader.lookup(lookupFreqs, 1000, 0, 2678400, 1);
    CHECK(result[0].position == 1339200);
    CHECK(result[0].score == 0);
}

TEST_CASE("can do 8 thread lookup on large file") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/GB_50_Jan2014.freqdb"));
    std::vector<int16_t> lookupFreqs = {-7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21};
    std::vector<LookupResult> result = fsFreqDbReader.lookup(lookupFreqs, 15, 0, 2678400, 8);
    CHECK(result[0].position == 1339200);
    CHECK(result[0].score == 0);
    CHECK(result.size() == 53);
    for(int i = 0; i < result.size(); i++) {
        std::cout << "Position: " << result[i].position << " Score: " <<result[i].score  << std::endl;
    }
}

TEST_CASE("can do comprehensive lookup around the range provided.") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/GB_50_Jan2014.freqdb"));
    std::vector<int16_t> lookupFreqs = {-7,-6,-2,-2,1,2,5,1,1,3,4,4,5,5,6,4,2,1,-4,-5,-9,-11,-14,-13,-15,-15,-19,-25,-26,-31,-35,-38,-39,-39,-38,-40,-40,-38,-37,-38,-38,-40,-41,-41,-44,-46,-46,-44,-47,-46,-48,-49,-48,-48,-48,-46,-45,-47,-47,-49,-49,-50,-50,-52,-53,-51,-53,-51,-49,-46,-46,-44,-44,-42,-39,-40,-39,-37,-39,-36,-36,-37,-36,-37,-36,-37,-37,-36,-33,-31,-29,-29,-28,-26,-25,-23,-23,-22,-22,-21};
    std::vector<LookupResult> result = fsFreqDbReader.comprehensiveLookup(lookupFreqs, 1339200, 2, 2);
    CHECK(result.size() == 5);
    CHECK(result[0].position == 1339198);
    CHECK(result[0].score == 247);
    CHECK(result[1].position == 1339199);
    CHECK(result[1].score == 152);
    CHECK(result[2].position == 1339200);
    CHECK(result[2].score == 0);
    CHECK(result[3].position == 1339201);
    CHECK(result[3].score == 155);
    CHECK(result[4].position == 1339202);
    CHECK(result[4].score == 253);
}

TEST_CASE("can do lookup passing only frequency array and maxSingleDiff parameter") {
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
}

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
    std::vector<int16_t*> nullableFreqs = createNullableArray<int16_t>({1, 2, 3, 4, 5});
    std::vector<LookupResult> result = fsFreqDbReader.lookup(nullableFreqs, 1000, 10, 14, 1);
    CHECK(result.size() == 5);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
    CHECK(result[1].position == 11);
    CHECK(result[1].score == 7);
}

TEST_CASE("can do non-pointer lookup where -32768 represents a null value") {
    FsFreqDbReader fsFreqDbReader(resolvePath("tests/Test123FreqDb.freqdb"));
    std::vector<int16_t> freqs = {1, 2, -32768, 4, 5};
    std::vector<LookupResult> result = fsFreqDbReader.lookup(freqs, 1000, 10, 14, 1);
    CHECK(result.size() == 5);
    CHECK(result[0].position == 10);
    CHECK(result[0].score == 0);
    CHECK(result[1].position == 11);
    CHECK(result[1].score == 6); //This is one less than the previous score because the third value in the freqs array (-32768) represents null
}

TEST_CASE("fsFreqDbReader") {
    SUBCASE("can read metaData from a valid freqDB file") {
        FsFreqDbReader fsFreqDbReader(resolvePath("tests/TestFreqDb.freqdb"));
        FreqDbMetaData freqDbMetaData = fsFreqDbReader.freqDbMetaData;
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
