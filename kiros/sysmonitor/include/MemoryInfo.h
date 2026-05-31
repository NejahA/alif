#pragma once

#include <string>
#include <cstdint>

class MemoryInfo {
public:
    MemoryInfo();
    ~MemoryInfo();

    // Update memory information
    void Update();

    // Get total physical memory in bytes
    uint64_t GetTotal() const;

    // Get used memory in bytes
    uint64_t GetUsed() const;

    // Get free memory in bytes
    uint64_t GetFree() const;

    // Get available memory in bytes
    uint64_t GetAvailable() const;

    // Get memory usage percentage (0-100)
    double GetUsage() const;

    // Get swap/page file information
    uint64_t GetSwapTotal() const;
    uint64_t GetSwapUsed() const;
    uint64_t GetSwapFree() const;

    // Get formatted string representation
    std::string ToString() const;

    // Get memory in human-readable format (KB, MB, GB)
    static std::string FormatBytes(uint64_t bytes);

private:
    class Impl;
    Impl* pImpl;
};