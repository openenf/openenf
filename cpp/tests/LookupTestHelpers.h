#include <filesystem>
#include <sstream>
#include <fstream>
#include <iostream>
#include "json.hpp"

inline std::string resolvePath(const std::string &relPath)
{
    auto baseDir = std::filesystem::current_path();
    while (baseDir.has_parent_path())
    {
        auto combinePath = baseDir / relPath;
        if (std::filesystem::exists(combinePath))
        {
            return combinePath.string();
        }
        baseDir = baseDir.parent_path();
    }
    throw std::runtime_error("File not found!");
}

template <typename T>
static bool arraysAreEqual(std::vector<T*> vector1, std::vector<T*> vector2) {
    if (vector1.size() != vector2.size()) {
        return false;
    }
    for (unsigned long i = 0; i < vector1.size(); i++) {
        if (vector1[i] == nullptr && vector2[i] != nullptr) {
            return false;
        }
        if (vector1[i] != nullptr && vector2[i] == nullptr) {
            return false;
        }
        if (vector1[i] != nullptr && *vector1[i] != *vector2[i]) {
            return false;
        }
    }
    return true;
}

template <typename T>
static bool arraysAreEqual(std::vector<T> vector1, std::vector<T> vector2) {
    if (vector1.size() != vector2.size()) {
        return false;
    }
    for (unsigned long i = 0; i < vector1.size(); i++) {
        if (vector1[i] != vector2[i]) {
            return false;
        }
    }
    return true;
}

template <typename T>
static std::vector<T*> createNullableArray(std::vector<T> v) {
    std::vector<T*> r;
    r.reserve(v.size());
    for (T& value : v) {
        T* vp = new T(value);
        r.push_back(vp);
    }
    return r;
}

static std::vector<double*> convertToDoublePtrs(const std::vector<double>& doubleVec) {
    std::vector<double*> doublePtrVec;
    doublePtrVec.reserve(doubleVec.size());

    for (const double& value : doubleVec) {
        doublePtrVec.push_back(new double(value));
    }

    return doublePtrVec;
}

static std::string timestampToISO8601(int timestamp) {
    std::time_t timestamp_sec = static_cast<std::time_t>(timestamp);
    std::tm* timeinfo = std::gmtime(&timestamp_sec);

    std::stringstream stream;
    stream << std::put_time(timeinfo, "%FT%TZ");

    return stream.str();
}

static std::vector<double> readJsonFileToDoubleArray(std::string filePath) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cerr << "Error: could not open file." << std::endl;
        throw std::ios_base::failure("Error: could not open file.");
    }

    // Parse the JSON data
    nlohmann::json j;
    try {
        file >> j;
    } catch (nlohmann::json::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        throw std::ios_base::failure(e.what());
    }

    // Extract the array of doubles from the JSON data
    std::vector<double> data;
    try {
        data = j.get<std::vector<double>>();
    } catch (nlohmann::json::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        throw std::ios_base::failure(e.what());
    }

    return data;
}