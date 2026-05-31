#ifndef WINDOWSBLUETOOTHMONITOR_H
#define WINDOWSBLUETOOTHMONITOR_H

#include <QObject>
#include <QBluetoothDeviceDiscoveryAgent>
#include <QBluetoothDeviceInfo>
#include <QSet>
#include <QString>

class WindowsBluetoothMonitor : public QObject
{
    Q_OBJECT
public:
    explicit WindowsBluetoothMonitor(QObject *parent = nullptr);
    ~WindowsBluetoothMonitor();

    void startMonitoring();
    void stopMonitoring();

signals:
    void deviceConnected(const QString &macAddress, const QString &deviceName);
    void deviceDisconnected(const QString &macAddress, const QString &deviceName);

private slots:
    void onDeviceDiscovered(const QBluetoothDeviceInfo &device);
    void onDeviceUpdated(const QBluetoothDeviceInfo &device, QBluetoothDeviceInfo::Fields updatedFields);
    void checkConnectionStatus();

private:
    QBluetoothDeviceDiscoveryAgent *m_discoveryAgent;
    QSet<QString> m_connectedAirPods;
    bool isAirPods(const QBluetoothDeviceInfo &device);
};

#endif // WINDOWSBLUETOOTHMONITOR_H
