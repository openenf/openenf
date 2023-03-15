#pragma once

#include <sys/stat.h>
#include "FreqDbMetadata.h"
#include "json.hpp"
#include "LookupResult.h"
#include "ResultLeague.h"
#include <algorithm>
#include <fstream>
#include <iostream>
#include <vector>

/// Matches a vector of frequencies to sequence within a electrical grid frequency database.
class FsFreqDbReader
{
public:
    /// Returns the base frequency, start and end dates and grid ID from the .freqdb file
    FreqDbMetaData freqDbMetaData;

    /// Pass a filePath to a .freqdb format file
    FsFreqDbReader(std::string filePath);

    /// Read the entire contents of the database to a vector. This could take a while and take a lot of memory.
    std::vector<int16_t> readDbToVector();

    std::vector<LookupResult> lookup(std::vector<int16_t*> freqs, int maxSingleDiff);
    std::vector<LookupResult> lookup(std::vector<int16_t*> vector1, int maxSingleDiff, int startTime, int endTime);
    std::vector<LookupResult> lookup(std::vector<int16_t *> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads);
    std::vector<LookupResult> lookup(std::vector<int16_t> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads);

    /// Get match scores for every time around the aroundTs timestamp, i.e. all scores in the range (aroundTs - diffBefore -> aroundTs + diffAfter).
    /// This is used to refine the results retrieved from a standard lookup.
    std::vector<LookupResult> comprehensiveLookup(std::vector<int16_t> freqs, int aroundTs, int diffBefore, int diffAfter);

private:
    std::string filePath;
    long fileSizeBytes;
    int dataSizeBytes;
    int duration;
    std::vector<int16_t> bigArray;
    FreqDbMetaData readDataFromBinaryFile();

    void threadSafeLookup(int startTime, int endTime, std::vector<int16_t> freqs, int maxSingleDiff, std::vector<int16_t> largeArray, std::function<void(int,int)> onNewResult);
    std::vector<LookupResult> lookupInternal(std::vector<int16_t> freqs, int maxSingleDiff, int startTime, int endTime, ResultLeague& resultLeague);
    std::vector<LookupResult> resultLeagueToLookupResults(ResultLeague& resultArray);

};
