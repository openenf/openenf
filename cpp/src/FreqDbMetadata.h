#pragma once

#include<string>

///The metadata contained in a .freqdb file
struct FreqDbMetaData {
public:
    ///a unique string identifier for the grid. E.g. 'GB' 'DE' or 'XX'
    std::string gridId;

    ///Unix time the grid data begins
    int startDate;

    ///Unix time the grid data ends
    int endDate;

    ///Base frequency of the grid, either 50 or 60hz
    int baseFrequency;
};
