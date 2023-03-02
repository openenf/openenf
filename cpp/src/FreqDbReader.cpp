#include "json.hpp"
#include "FreqDbReader.h"
#include "ResultLeague.h"
#include "LookupHelpers.h"
#include <thread>

FreqDbMetaData FsFreqDbReader::getMetaData() {
    std::ifstream infile(this->filePath);
    char ch;
    std::string headerString;
    int separatorCount = 0;
    while (infile >> std::noskipws >> ch) {
        headerString.push_back(ch);
        if (ch == 0x0d) {
            separatorCount++;
            if (separatorCount == 5) {
                break;
            }
        }
    }
    this->dataSizeBytes = this->fileSizeBytes - headerString.length();
    headerString.erase(headerString.length() - 5);
    nlohmann::json json_obj = nlohmann::json::parse(headerString);
    FreqDbMetaData freqDbMetaData = FreqDbMetaData();
    freqDbMetaData.gridId = json_obj["gridId"];
    freqDbMetaData.startDate = stoi(to_string(json_obj["startDate"]));
    freqDbMetaData.endDate = freqDbMetaData.startDate + this->dataSizeBytes / 2;
    freqDbMetaData.baseFrequency = stoi(to_string(json_obj["baseFrequency"]));

    this->duration = freqDbMetaData.endDate - freqDbMetaData.startDate;
    this->gridId = freqDbMetaData.gridId;
    infile.close();
    return freqDbMetaData;
}

FsFreqDbReader::FsFreqDbReader(std::string filePath) {
    this->filePath = filePath;
    this->fileSizeBytes = this->GetFileSize(filePath);
    this->getMetaData();
}

long FsFreqDbReader::GetFileSize(std::string filename) {
    struct stat stat_buf;
    int rc = stat(filename.c_str(), &stat_buf);
    return rc == 0 ? stat_buf.st_size : -1;
}

std::vector <int16_t> FsFreqDbReader::readDbToVector() {
    std::vector<int16_t> returnVector;

    std::ifstream file(this->filePath, std::ios::binary);
    if (!file.is_open()) {
        throw std::ios_base::failure("Failed to open file");
    }

    // Skip the first N bytes
    const int NUM_BYTES_TO_SKIP = this->fileSizeBytes - this->dataSizeBytes;  // Change this to the number of bytes to skip
    file.seekg(NUM_BYTES_TO_SKIP, std::ios::beg);

    // Read the data into a buffer
    //const int BUFFER_SIZE = std::min(1024, this->dataSizeBytes / 2);
    const int BUFFER_SIZE = 1024;
    int16_t buffer[BUFFER_SIZE];
    if(file.is_open()) {
        while(file) {
            file.read((char*)buffer, BUFFER_SIZE * sizeof(int16_t));
            int numCharsRead = file.gcount();
            for (int i = 0; i < numCharsRead; i++) {
                returnVector.push_back(buffer[i]);
                if (returnVector.size() == this->duration) {
                    break;
                }
            }
        }
    }

    // Close the file
    file.close();

    return returnVector;
}

std::vector<LookupResult> FsFreqDbReader::resultLeagueToLookupResults(ResultLeague& resultArray) {
    std::vector<LookupResult> results;
    for (int i = 0; i < resultArray.results.size(); i++) {
        LookupResult lookupResult = LookupResult();
        lookupResult.score = resultArray.results[i][1];
        lookupResult.position = resultArray.results[i][0];
        results.push_back(lookupResult);
    }
    return results;
}

std::vector<LookupResult> FsFreqDbReader::lookupInternal(std::vector<int16_t*> freqs, int maxSingleDiff, int startTime, int endTime, ResultLeague& resultLeague) {
    std::vector<int16_t> largeArray = this->readDbToVector();
    this->threadSafeLookup(startTime, endTime, freqs, maxSingleDiff, largeArray, resultLeague);
    return FsFreqDbReader::resultLeagueToLookupResults(resultLeague);
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t*> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads) {
    int freqsSize = freqs.size();
    std::vector<std::vector<int>> threadBounds = LookupHelpers::getArrayThreadBounds(endTime - startTime, numThreads, freqsSize);
    std::vector<std::thread> threads;
    ResultLeague resultLeague = ResultLeague(100);
    std::vector<int16_t> largeArray = this->readDbToVector();
    for(int i = 0; i < threadBounds.size(); i++) {
        std::vector<int16_t*> clone(freqsSize);
        copy(freqs.begin(), freqs.end(),clone.begin());
        threads.emplace_back(&FsFreqDbReader::threadSafeLookup, this, threadBounds[i][0] + startTime, threadBounds[i][1] + startTime, clone, maxSingleDiff, largeArray, std::ref(resultLeague));
    }
    for (std::thread& t : threads) {
        t.join();
    }
    return FsFreqDbReader::resultLeagueToLookupResults(resultLeague);
}


void FsFreqDbReader::threadSafeLookup(int startTime, int endTime, std::vector<int16_t *> freqs, int maxSingleDiff,
                                      std::vector<int16_t> largeArray, ResultLeague &resultArray) {
    int i = startTime;
    int resultPosition = startTime -1;
    std::vector<int16_t*> scores;
    std::vector<int16_t*> compareArray;
    int largeArraySize = largeArray.size();
    int freqsSize = freqs.size();
    int lastIndexToRead = std::min(largeArraySize, (endTime + freqsSize));
    while(true) {
        int16_t* ptr = new int16_t(0);
        scores.insert(scores.end(), ptr);
        if (freqs.size() > 0) {
            int16_t* firstElement = freqs.front();
            compareArray.insert(compareArray.end(), firstElement);
            freqs.erase(freqs.begin());
        }
        if (i >= lastIndexToRead) {
            break;
        }
        int compareArraySize = compareArray.size();
        int16_t newValue = largeArray[i];
        i++;
        for(int j = 0; j < compareArraySize; j++) {
            if (scores[j] != nullptr) {
                int16_t* compareValue = compareArray[compareArraySize - 1 - j];
                if (compareValue != NULL) {
                    int16_t newDiff = abs(*compareValue - newValue);
                    if (newDiff > maxSingleDiff) {
                        scores[j] = NULL;
                    } else {
                        *scores[j] += newDiff;
                    }
                }
            }
        }
        if(scores.size() >= freqsSize) {
            resultPosition++;
            int16_t* front = scores.front();
            if (front != NULL) {
                resultArray.add(*front, resultPosition);
            }
            scores.erase(scores.begin());
        }
    }
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t *> vector1, int maxSingleDiff, int startTime, int endTime) {
    ResultLeague resultArray = ResultLeague(100);
    return this->lookupInternal(vector1, maxSingleDiff, startTime, endTime, std::ref(resultArray));
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t*> freqs, int maxSingleDiff) {
    ResultLeague resultArray = ResultLeague(100);
    return this->lookupInternal(freqs, maxSingleDiff, 0, this->duration, std::ref(resultArray));
}

