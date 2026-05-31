#pragma once

#include <string>
#include <vector>
#include <cstdint>

struct NetworkInterface {
    std::string name;
    std::string description;
    std::string macAddress;
    std::string ipAddress;
    std::string subnetMask;
    std::string gateway;
    std::string dnsServers;
    bool isConnected;
    bool isWireless;
    uint64_t bytesSent;        // Total bytes sent
    uint64_t bytesReceived;    // Total bytes received
    uint64_t speed;           // Connection speed in Mbps
    double uploadSpeed;       // Current upload speed in bytes/sec
    double downloadSpeed;     // Current download speed in bytes/sec
};

class NetworkInfo {
public:
    NetworkInfo();
    ~NetworkInfo();

    // Update network information
    void Update();

    // Get all network interfaces
    std::vector<NetworkInterface> GetInterfaces() const;

    // Get active network interface
    NetworkInterface GetActiveInterface() const;

    // Get total bytes sent
    uint64_t GetTotalBytesSent() const;

    // Get total bytes received
    uint64_t GetTotalBytesReceived() const;

    // Get current upload speed (bytes/sec)
    double GetUploadSpeed() const;

    // Get current download speed (bytes/sec)
    double GetDownloadSpeed() const;

    // Get network usage percentage (0-100 based on max speed)
    double GetUsage() const;

    // Get public IP address (requires internet)
    std::string GetPublicIP() const;

    // Get network latency/ping
    double GetLatency() const;

    // Check internet connectivity
    bool IsConnected() const;

    // Get formatted string representation
    std::string ToString() const;

private:
    class Impl;
    Impl* pImpl;
};