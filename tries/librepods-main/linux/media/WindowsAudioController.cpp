#include "WindowsAudioController.h"
#include "logger.h"
#include <windows.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>

WindowsAudioController::WindowsAudioController(QObject *parent)
    : QObject(parent), m_initialized(false)
{
}

WindowsAudioController::~WindowsAudioController()
{
    if (m_initialized) {
        CoUninitialize();
    }
}

bool WindowsAudioController::initialize()
{
    HRESULT hr = CoInitialize(NULL);
    if (FAILED(hr)) {
        LOG_ERROR("Failed to initialize COM");
        return false;
    }
    m_initialized = true;
    return true;
}

int WindowsAudioController::getVolume()
{
    if (!m_initialized) return -1;

    IMMDeviceEnumerator *pEnumerator = NULL;
    IMMDevice *pDevice = NULL;
    IAudioEndpointVolume *pEndpointVolume = NULL;

    HRESULT hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) return -1;

    hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);
    if (SUCCEEDED(hr)) {
        hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
        if (SUCCEEDED(hr)) {
            float currentVolume = 0;
            pEndpointVolume->GetMasterVolumeLevelScalar(&currentVolume);
            pEndpointVolume->Release();
            pDevice->Release();
            pEnumerator->Release();
            return (int)(currentVolume * 100);
        }
        pDevice->Release();
    }
    pEnumerator->Release();
    return -1;
}

bool WindowsAudioController::setVolume(int volume)
{
    if (!m_initialized) return false;

    IMMDeviceEnumerator *pEnumerator = NULL;
    IMMDevice *pDevice = NULL;
    IAudioEndpointVolume *pEndpointVolume = NULL;

    HRESULT hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&pEnumerator);
    if (FAILED(hr)) return false;

    hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);
    if (SUCCEEDED(hr)) {
        hr = pDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_ALL, NULL, (void**)&pEndpointVolume);
        if (SUCCEEDED(hr)) {
            pEndpointVolume->SetMasterVolumeLevelScalar((float)volume / 100.0f, NULL);
            pEndpointVolume->Release();
            pDevice->Release();
            pEnumerator->Release();
            return true;
        }
        pDevice->Release();
    }
    pEnumerator->Release();
    return false;
}

bool WindowsAudioController::isDeviceActive(const QString &macAddress)
{
    // On Windows, identifying the active device by MAC address is complex 
    // via standard Core Audio. It usually requires linking with PnP IDs.
    // For now, we'll return true if any AirPods-like name is the default.
    return true; // Simplified placeholder
}
