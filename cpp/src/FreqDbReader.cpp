#include "json.hpp"
#include "FreqDbReader.h"
#include "ResultLeague.h"
#include "LookupHelpers.h"
#include <thread>

#if __EMSCRIPTEN__
#include <emscripten.h>
#endif

FreqDbMetaData FsFreqDbReader::readDataFromBinaryFile() {
    FreqDbMetaData freqDbMetaData = FreqDbMetaData();
    std::string path = this->filePath;
#if __EMSCRIPTEN__
    EM_ASM(
            FS.mkdir('/temp');
            FS.mount(NODEFS, {root : '.'}, '/temp');
            );
    path = std::string("/temp/") + path;
#endif
    std::ifstream infile(path, std::ios::in|std::ios::binary);
    infile.ignore( std::numeric_limits<std::streamsize>::max() );
    this->fileSizeBytes = infile.gcount();
    infile.clear();   //  Since ignore will have set eof.
    infile.seekg( 0, std::ios_base::beg );
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
    //headerString = headerString.substr(0, headerString.length() - 5);

    nlohmann::json json_obj = nlohmann::json::parse(headerString);
    freqDbMetaData.gridId = json_obj["gridId"];
    freqDbMetaData.startDate = stoi(to_string(json_obj["startDate"]));
    freqDbMetaData.endDate = freqDbMetaData.startDate + this->dataSizeBytes / 2;
    freqDbMetaData.baseFrequency = stoi(to_string(json_obj["baseFrequency"]));

    this->duration = freqDbMetaData.endDate - freqDbMetaData.startDate;
    int durationInBytes = this->duration * 2;

    const int BUFFER_SIZE = 1024;
    int16_t buffer[BUFFER_SIZE];
    if(infile.is_open()) {
        while(infile) {
            infile.read((char*)buffer, BUFFER_SIZE * sizeof(int16_t));
            int numCharsRead = infile.gcount() / 2;
            for (int i = 0; i < numCharsRead; i++) {
                this->bigArray.push_back(buffer[i]);
                if (this->bigArray.size() == durationInBytes) {
                    break;
                }
            }
        }
    }

    infile.close();
    return freqDbMetaData;
}

FsFreqDbReader::FsFreqDbReader(std::string filePath) {
    this->filePath = filePath;
    this->freqDbMetaData = this->readDataFromBinaryFile();
}

std::vector <int16_t> FsFreqDbReader::readDbToVector() {
    return this->bigArray;
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

std::vector<LookupResult> FsFreqDbReader::lookupInternal(std::vector<int16_t> freqs, int maxSingleDiff, int startTime, int endTime, ResultLeague& resultLeague) {
    std::vector<int16_t> largeArray = this->readDbToVector();
    this->threadSafeLookup(startTime, endTime, freqs, maxSingleDiff, largeArray, resultLeague);
    return FsFreqDbReader::resultLeagueToLookupResults(resultLeague);
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads) {
    int freqsSize = freqs.size();
    std::vector<std::vector<int>> threadBounds = LookupHelpers::getArrayThreadBounds(endTime - startTime, numThreads, freqsSize);
    std::vector<std::thread> threads;
    ResultLeague resultLeague = ResultLeague(100);
    std::vector<int16_t> largeArray = this->readDbToVector();
    for(int i = 0; i < threadBounds.size(); i++) {
        std::vector<int16_t> clone(freqsSize);
        copy(freqs.begin(), freqs.end(),clone.begin());
        threads.emplace_back(&FsFreqDbReader::threadSafeLookup, this, threadBounds[i][0] + startTime, threadBounds[i][1] + startTime, clone, maxSingleDiff, largeArray, std::ref(resultLeague));
    }
    for (std::thread& t : threads) {
        t.join();
    }
    std::vector<LookupResult> result = FsFreqDbReader::resultLeagueToLookupResults(resultLeague);
    return result;
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t*> freqs, int maxSingleDiff, int startTime, int endTime, int numThreads) {
    return FsFreqDbReader::lookup(LookupHelpers::pointerToNonPointerVector(freqs), maxSingleDiff, startTime, endTime, numThreads);
}

void FsFreqDbReader::threadSafeLookup(int startTime, int endTime, std::vector<int16_t> freqs, int maxSingleDiff,
                                      std::vector<int16_t> largeArray, ResultLeague &resultArray) {
    int i = startTime;
    int resultPosition = startTime -1;
    std::vector<int16_t> scores;
    std::vector<int16_t> compareArray;
    int largeArraySize = largeArray.size();
    int freqsSize = freqs.size();
    int lastIndexToRead = std::min(largeArraySize, (endTime + freqsSize));
    while(true) {
        scores.insert(scores.end(), 0);
        if (freqs.size() > 0) {
            int16_t firstElement = freqs.front();
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
            if (scores[j] != -32768) {
                int16_t compareValue = compareArray[compareArraySize - 1 - j];
                if (compareValue != -32768) {
                    int16_t newDiff = abs(compareValue - newValue);
                    if (newDiff > maxSingleDiff) {
                        scores[j] = -32768;
                    } else {
                        scores[j] += newDiff;
                    }
                }
            }
        }
        if(scores.size() >= freqsSize) {
            resultPosition++;
            int16_t front = scores.front();
            if (front != -32768) {
                resultArray.add(front, resultPosition);
            }
            scores.erase(scores.begin());
        }
    }
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t *> vector1, int maxSingleDiff, int startTime, int endTime) {
    ResultLeague resultArray = ResultLeague(100);
    return this->lookupInternal(LookupHelpers::pointerToNonPointerVector(vector1), maxSingleDiff, startTime, endTime, std::ref(resultArray));
}

std::vector<LookupResult> FsFreqDbReader::lookup(std::vector<int16_t*> freqs, int maxSingleDiff) {
    ResultLeague resultArray = ResultLeague(100);
    return this->lookupInternal(LookupHelpers::pointerToNonPointerVector(freqs), maxSingleDiff, 0, this->duration, std::ref(resultArray));
}

#if __EMSCRIPTEN__

#include <emscripten/bind.h>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(FsFreqDbReader) {
    register_vector<int16_t>("vectorInt16_t");
    register_vector<int16_t*>("vectorInt16_tPointer");
    register_vector<int>("vectorInt");
    register_vector<LookupResult>("vectorLookupResult");
    class_<FreqDbMetaData>("FreqDbMetaData")
        .property("gridId", &FreqDbMetaData::gridId)
        .property("startDate", &FreqDbMetaData::startDate)
        .property("endDate", &FreqDbMetaData::endDate)
        .property("baseFrequency", &FreqDbMetaData::baseFrequency);
    class_<LookupResult>("LookupResult")
        .property("position", &LookupResult::position)
        .property("score", &LookupResult::score);
    class_<ResultLeague>("ResultLeague")
         .constructor<unsigned int>()
        .property("results", &ResultLeague::results)
        .function("add", &ResultLeague::add);
    class_<FsFreqDbReader>("FsFreqDbReader")
        .constructor<std::string>()
        .property("freqDbMetaData", &FsFreqDbReader::freqDbMetaData)
        .function("readDbToVector", &FsFreqDbReader::readDbToVector)
        .function("lookup", select_overload<std::vector<LookupResult>(std::vector<int16_t>,int,int,int,int)>(&FsFreqDbReader::lookup), allow_raw_pointers());
}
#endif