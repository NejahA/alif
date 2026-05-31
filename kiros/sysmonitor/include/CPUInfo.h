#pragma once

#include <string>
#include <vector>

class CPUInfo {
public:
    CPUInfo();
    ~CPUInfo();

    // Update CPU information
    void Update();

    // Get CPU usage percentage (0-100)
    double GetUsage() const;

    // Get CPU frequency in MHz
    double GetFrequency() const;

    // Get CPU temperature in Celsius (if available)
    double GetTemperature() const;

    // Get CPU name/model
    std::string GetName() const;

    // Get number of cores
    int GetCoreCount() const;

    // Get per-core usage
    std::vector<double> GetCoreUsages() const;

    // Get formatted string representation
    std::string ToString() const;

private:
    class Impl;
    Impl* pImpl;
};