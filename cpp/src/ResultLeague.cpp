#include "ResultLeague.h"

ResultLeague::ResultLeague(unsigned int max_size) {
    this->max_size = max_size;
}

void ResultLeague::add(int score, int position) {
    std::lock_guard<std::mutex> lock(mutex_);
    bool inserting = false;
    unsigned long results_size = results.size();
    //Check to see if the results array is already at maximum size.
    if (results_size >= max_size) {
        //Because the array is always sorted from the lowest score to highest the last entry will always have the maximum value:
        int max_value = results.back()[1];
        //If the new score is greater than the current max value there's nothing left to do.
        if (score >= max_value) {
            return;
        }
            //Conversely, if the new score is lower than the current maximum, we're going to need to evict the current maximum
            //value to make way for this one:
        else {
            inserting = true;
        }
    }


    for (int i = results_size - 1; i >= 0; i--) {
        if (score > results[i][1]) {
            results.insert(results.begin() + i + 1, {position, score});
            if (inserting) {
                results.pop_back();
            }
            return;
        }
    }
    results.insert(results.begin(), {position, score});
    if (inserting) {
        results.pop_back();
    }
}

#ifdef ENABLE_DOCTEST_IN_LIBRARY
#include "doctest/doctest.h"

/// a test helper to check if two vectors-of-vectors are equal
static bool arraysAreEqual(std::vector<std::vector<int>> vector1, std::vector<std::vector<int>> vector2) {
    if (vector1.size() != vector2.size()) {
        return false;
    }
    for (int i = 0; i < vector1.size(); i++) {
        if (vector1[i][0] != vector2[i][0]) {
            return false;
        }
        if (vector1[i][1] != vector2[i][1]) {
            return false;
        }
    }
    return true;
}

TEST_CASE("adds a single result to underlying array") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    std::vector<std::vector<int>> expectedResults{{0, 1}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("adds a second result after the first if it is larger") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(2,1);
    std::vector<std::vector<int>> expectedResults{{0, 1},
                                                  {1, 2}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("adds a second result before the first if it is equal") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(1,1);
    std::vector<std::vector<int>> expectedResults{{1, 1},
                                                  {0, 1}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("adds a second result before the first if it is less") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(0,1);
    std::vector<std::vector<int>> expectedResults{{1, 0},
                                                  {0, 1}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("does not add a third result if greater") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(2,1);
    resultArray.add(3,2);
    std::vector<std::vector<int>> expectedResults{{0, 1},
                                                  {1, 2}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("does not add a third result if equal") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(2,1);
    resultArray.add(2,2);
    std::vector<std::vector<int>> expectedResults{{0, 1},
                                                  {1, 2}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("replaces second result if less than second") {
    ResultLeague resultArray(2);
    resultArray.add(1,0);
    resultArray.add(3,1);
    resultArray.add(2,2);
    std::vector<std::vector<int>> expectedResults{{0, 1},
                                                  {2, 2}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}


TEST_CASE("adds second result at top if less than first") {
    ResultLeague resultArray(2);
    resultArray.add(2,0);
    resultArray.add(3,1);
    resultArray.add(1,2);
    std::vector<std::vector<int>> expectedResults{{2, 1},
                                                  {0, 2}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

TEST_CASE("can add a result in middle") {
    ResultLeague resultArray(3);
    resultArray.add(1,0);
    resultArray.add(3,1);
    resultArray.add(4,2);
    resultArray.add(2,3);
    std::vector<std::vector<int>> expectedResults{{0, 1},
                                                  {3, 2},
                                                  {1, 3}};
    CHECK(arraysAreEqual(resultArray.results, expectedResults));
}

#endif
