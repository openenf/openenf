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
    /// Pass a filePath to a .freqdb format file
    FsFreqDbReader(std::string filePath);

    /// Get the base frequency, start and end dates and grid ID from the .freqdb file
    FreqDbMetaData getMetaData();

    /// Read the entire contents of the database to a vector. This could take a while and take a lot of memory.
    std::vector <int16_t> readDbToVector();

    std::vector<LookupResult> lookup(std::vector<int16_t*> freqs, int maxSingleDiff);
    std::vector<LookupResult> lookup(std::vector<int16_t*> vector1, int maxSingleDiff, int startTime, int endTime);
    std::vector<LookupResult> lookup(std::vector<int16_t *> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads);

private:
    std::string filePath;
    long fileSizeBytes;
    long GetFileSize(std::string filename);
    int dataSizeBytes;
    std::string gridId;
    int duration;

    void threadSafeLookup(int startTime, int endTime, std::vector<int16_t *> freqs, int maxSingleDiff, std::vector<int16_t> largeArray, ResultLeague &resultArray);
    std::vector<LookupResult> lookupInternal(std::vector<int16_t*> freqs, int maxSingleDiff, int startTime, int endTime, ResultLeague& resultLeague);
    std::vector<LookupResult> resultLeagueToLookupResults(ResultLeague& resultArray);

};