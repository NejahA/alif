#pragma once

#include <string>
#include <vector>
#include <memory>

class SystemMonitor {
public:
    SystemMonitor();
    ~SystemMonitor();

    // Initialize the system monitor
    bool Initialize();

    // Update all system information
    void Update();

    // Get system information as formatted strings
    std::string GetCPUInfo() const;
    std::string GetMemoryInfo() const;
    std::string GetDiskInfo() const;
    std::string GetNetworkInfo() const;
    std::string GetProcessInfo() const;
    std::string GetSystemInfo() const;

    // Get detailed information
    double GetCPUUsage() const;
    uint64_t GetTotalMemory() const;
    uint64_t GetUsedMemory() const;
    uint64_t GetFreeMemory() const;
    uint64_t GetTotalDisk() const;
    uint64_t GetUsedDisk() const;
    uint64_t GetFreeDisk() const;
    double GetNetworkUpload() const;
    double GetNetworkDownload() const;

    // Process management
    size_t GetProcessCount() const;
    std::vector<std::string> GetTopProcesses(size_t count = 5) const;

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};