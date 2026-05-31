#pragma once

#include <string>
#include <vector>
#include <cstdint>

struct DiskDrive {
    std::string name;
    std::string type;           // HDD, SSD, NVMe, etc.
    std::string filesystem;     // NTFS, FAT32, exFAT, etc.
    uint64_t totalSize;         // Total size in bytes
    uint64_t freeSize;          // Free space in bytes
    uint64_t usedSize;          // Used space in bytes
    double usagePercentage;     // Usage percentage (0-100)
    std::string mountPoint;     // Drive letter or mount point
    uint64_t readSpeed;         // Read speed in bytes/sec
    uint64_t writeSpeed;        // Write speed in bytes/sec
};

class DiskInfo {
public:
    DiskInfo();
    ~DiskInfo();

    // Update disk information
    void Update();

    // Get all disk drives
    std::vector<DiskDrive> GetDrives() const;

    // Get specific drive by index or letter
    DiskDrive GetDrive(int index) const;
    DiskDrive GetDrive(const std::string& letter) const;

    // Get total disk space across all drives
    uint64_t GetTotalSpace() const;

    // Get used disk space across all drives
    uint64_t GetUsedSpace() const;

    // Get free disk space across all drives
    uint64_t GetFreeSpace() const;

    // Get overall disk usage percentage
    double GetUsage() const;

    // Get disk I/O statistics
    uint64_t GetTotalReads() const;
    uint64_t GetTotalWrites() const;
    uint64_t GetReadSpeed() const;   // bytes/sec
    uint64_t GetWriteSpeed() const;  // bytes/sec

    // Get formatted string representation
    std::string ToString() const;

private:
    class Impl;
    Impl* pImpl;
};