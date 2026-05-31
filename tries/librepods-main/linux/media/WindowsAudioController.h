#ifndef WINDOWSAUDIOCONTROLLER_H
#define WINDOWSAUDIOCONTROLLER_H

#include <QObject>
#include <QString>

class WindowsAudioController : public QObject
{
    Q_OBJECT
public:
    explicit WindowsAudioController(QObject *parent = nullptr);
    ~WindowsAudioController();

    bool initialize();
    int getVolume();
    bool setVolume(int volume);
    bool isDeviceActive(const QString &macAddress);

private:
    bool m_initialized;
};

#endif // WINDOWSAUDIOCONTROLLER_H
