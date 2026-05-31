#include "WindowsBluetoothMonitor.h"
#include "logger.h"
#include <QBluetoothAddress>
#include <QTimer>

WindowsBluetoothMonitor::WindowsBluetoothMonitor(QObject *parent)
    : QObject(parent)
{
    m_discoveryAgent = new QBluetoothDeviceDiscoveryAgent(this);
    m_discoveryAgent->setLowEnergyDiscoveryTimeout(0); // Continuous or long timeout

    connect(m_discoveryAgent, &QBluetoothDeviceDiscoveryAgent::deviceDiscovered,
            this, &WindowsBluetoothMonitor::onDeviceDiscovered);
    connect(m_discoveryAgent, &QBluetoothDeviceDiscoveryAgent::deviceUpdated,
            this, &WindowsBluetoothMonitor::onDeviceUpdated);
    
    // Poll for connection status changes if signaling isn't enough on Windows
    QTimer *timer = new QTimer(this);
    connect(timer, &QTimer::timeout, this, &WindowsBluetoothMonitor::checkConnectionStatus);
    timer->start(5000);
}

WindowsBluetoothMonitor::~WindowsBluetoothMonitor()
{
}

void WindowsBluetoothMonitor::startMonitoring()
{
    LOG_INFO("Starting Windows Bluetooth monitoring...");
    m_discoveryAgent->start(QBluetoothDeviceDiscoveryAgent::LowEnergyMethod);
}

void WindowsBluetoothMonitor::stopMonitoring()
{
    m_discoveryAgent->stop();
}

bool WindowsBluetoothMonitor::isAirPods(const QBluetoothDeviceInfo &device)
{
    // Common AirPods service UUID
    return device.serviceUuids().contains(QBluetoothUuid(QString("74ec2172-0bad-4d01-8f77-997b2be0722a"))) ||
           device.name().contains("AirPods", Qt::CaseInsensitive);
}

void WindowsBluetoothMonitor::onDeviceDiscovered(const QBluetoothDeviceInfo &device)
{
    if (isAirPods(device)) {
        QString address = device.address().toString();
        LOG_DEBUG("Discovered AirPods: " << device.name() << " [" << address << "]");
        // checkConnectionStatus will handle the logic
    }
}

void WindowsBluetoothMonitor::onDeviceUpdated(const QBluetoothDeviceInfo &device, QBluetoothDeviceInfo::Fields updatedFields)
{
    if (isAirPods(device)) {
        checkConnectionStatus();
    }
}

void WindowsBluetoothMonitor::checkConnectionStatus()
{
    QList<QBluetoothDeviceInfo> devices = m_discoveryAgent->discoveredDevices();
    QSet<QString> currentlyConnected;

    for (const auto &device : devices) {
        if (isAirPods(device)) {
            // Note: On Windows, Qt Bluetooth might not always give accurate 'connected' state 
            // without a full WinRT backend, but for proximity/paired devices it's a start.
            // This is a placeholder for more robust WinRT logic if needed.
            // For now, if we see them in discovery, we check if they are "reachable"
            currentlyConnected.insert(device.address().toString());
        }
    }

    // Logic to emit signals for changes
    for (const auto &addr : currentlyConnected) {
        if (!m_connectedAirPods.contains(addr)) {
            emit deviceConnected(addr, "AirPods");
            m_connectedAirPods.insert(addr);
        }
    }

    for (const auto &addr : m_connectedAirPods) {
        if (!currentlyConnected.contains(addr)) {
            emit deviceDisconnected(addr, "AirPods");
            m_connectedAirPods.remove(addr);
        }
    }
}
