#pragma once

#include <string>
#include <vector>
#include <cstdint>

struct Process {
    uint32_t pid;              // Process ID
    std::string name;          // Process name
    std::string exePath;       // Executable path
    std::string owner;         // Process owner
    double cpuUsage;           // CPU usage percentage
    uint64_t memoryUsage;      // Memory usage in bytes
    uint64_t virtualMemory;    // Virtual memory in bytes
    uint32_t threadCount;      // Number of threads
    uint32_t handleCount;      // Number of handles
    uint64_t ioReadBytes;      // I/O read bytes
    uint64_t ioWriteBytes;     // I/O write bytes
    std::string status;        // Running, suspended, etc.
    uint64_t startTime;        // Process start time
    double uptime;            // Process uptime in seconds
};

class ProcessInfo {
public:
    ProcessInfo();
    ~ProcessInfo();

    // Update process information
    void Update();

    // Get all processes
    std::vector<Process> GetProcesses() const;

    // Get process by PID
    Process GetProcess(uint32_t pid) const;

    // Get process by name
    std::vector<Process> GetProcessesByName(const std::string& name) const;

    // Get top processes by CPU usage
    std::vector<Process> GetTopCPUProcesses(size_t count = 10) const;

    // Get top processes by memory usage
    std::vector<Process> GetTopMemoryProcesses(size_t count = 10) const;

    // Get total number of processes
    size_t GetProcessCount() const;

    // Get system process count
    size_t GetSystemProcessCount() const;

    // Get user process count
    size_t GetUserProcessCount() const;

    // Kill a process
    bool KillProcess(uint32_t pid);

    // Suspend/resume a process
    bool SuspendProcess(uint32_t pid);
    bool ResumeProcess(uint32_t pid);

    // Get process tree/children
    std::vector<uint32_t> GetChildProcesses(uint32_t parentPid) const;

    // Get formatted string representation
    std::string ToString() const;

private:
    class Impl;
    Impl* pImpl;
};