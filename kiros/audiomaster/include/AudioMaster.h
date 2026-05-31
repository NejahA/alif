#pragma once

#include <windows.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h>
#include <audioclient.h>
#include <audiopolicy.h>
#include <functiondiscoverykeys_devpkey.h>
#include <vector>
#include <string>
#include <map>
#include <memory>

// Audio session states
enum class AudioSessionState {
    Inactive = 0,
    Active = 1,
    Expired = 2
};

// Audio device types
enum class AudioDeviceType {
    Playback = 0,
    Recording = 1,
    All = 2
};

// Audio device information
struct AudioDeviceInfo {
    std::wstring id;
    std::wstring name;
    std::wstring description;
    AudioDeviceType type;
    bool isDefault;
    bool isActive;
    DWORD state;
};

// Audio session information
struct AudioSessionInfo {
    std::wstring sessionId;
    std::wstring processName;
    std::wstring displayName;
    std::wstring iconPath;
    DWORD processId;
    AudioSessionState state;
    float volume;
    bool isMuted;
    GUID sessionGuid;
};

// Audio peak meter data
struct AudioPeakData {
    float leftChannel;
    float rightChannel;
    float peakLeft;
    float peakRight;
    float rmsLeft;
    float rmsRight;
};

// Equalizer bands
struct EqualizerBand {
    float frequency;
    float gain;
    float qFactor;
};

// Audio effects
struct AudioEffects {
    bool enableEqualizer;
    std::vector<EqualizerBand> equalizerBands;
    bool enableCompressor;
    float compressorThreshold;
    float compressorRatio;
    float compressorAttack;
    float compressorRelease;
    bool enableReverb;
    float reverbLevel;
    float reverbTime;
    bool enableBassBoost;
    float bassBoostLevel;
    bool enableVirtualSurround;
    float surroundLevel;
};

// Audio routing rule
struct AudioRoutingRule {
    std::wstring processName;
    std::wstring targetDeviceId;
    bool applyVolume;
    float targetVolume;
    bool applyEffects;
    AudioEffects effects;
};

class AudioMaster {
public:
    AudioMaster();
    ~AudioMaster();

    // Initialization
    bool Initialize();
    void Shutdown();

    // Device management
    std::vector<AudioDeviceInfo> GetAudioDevices(AudioDeviceType type = AudioDeviceType::All);
    bool SetDefaultDevice(const std::wstring& deviceId, AudioDeviceType type);
    AudioDeviceInfo GetDefaultDevice(AudioDeviceType type);
    bool SetDeviceVolume(const std::wstring& deviceId, float volume);
    float GetDeviceVolume(const std::wstring& deviceId);
    bool SetDeviceMute(const std::wstring& deviceId, bool mute);
    bool GetDeviceMute(const std::wstring& deviceId);
    AudioPeakData GetDevicePeakLevels(const std::wstring& deviceId);

    // Session management
    std::vector<AudioSessionInfo> GetAudioSessions();
    bool SetSessionVolume(const std::wstring& sessionId, float volume);
    float GetSessionVolume(const std::wstring& sessionId);
    bool SetSessionMute(const std::wstring& sessionId, bool mute);
    bool GetSessionMute(const std::wstring& sessionId);
    AudioPeakData GetSessionPeakLevels(const std::wstring& sessionId);
    bool MoveSessionToDevice(const std::wstring& sessionId, const std::wstring& deviceId);
    bool SetSessionEffects(const std::wstring& sessionId, const AudioEffects& effects);
    AudioEffects GetSessionEffects(const std::wstring& sessionId);

    // System volume
    bool SetSystemVolume(float volume);
    float GetSystemVolume();
    bool SetSystemMute(bool mute);
    bool GetSystemMute();

    // Audio routing
    bool AddRoutingRule(const AudioRoutingRule& rule);
    bool RemoveRoutingRule(const std::wstring& processName);
    std::vector<AudioRoutingRule> GetRoutingRules();
    void ApplyRoutingRules();

    // Audio effects
    bool EnableEqualizer(bool enable);
    bool SetEqualizerBands(const std::vector<EqualizerBand>& bands);
    std::vector<EqualizerBand> GetEqualizerBands();
    bool EnableCompressor(bool enable, float threshold = -20.0f, float ratio = 4.0f);
    bool EnableReverb(bool enable, float level = 0.5f, float time = 1.0f);
    bool EnableBassBoost(bool enable, float level = 0.3f);
    bool EnableVirtualSurround(bool enable, float level = 0.5f);

    // Audio monitoring
    bool StartPeakMonitoring(const std::wstring& deviceId);
    bool StopPeakMonitoring(const std::wstring& deviceId);
    AudioPeakData GetCurrentPeakLevels(const std::wstring& deviceId);

    // Audio recording
    bool StartRecording(const std::wstring& deviceId, const std::wstring& outputFile);
    bool StopRecording();
    bool IsRecording();
    float GetRecordingLevel();

    // Audio playback
    bool StartPlayback(const std::wstring& deviceId, const std::wstring& inputFile);
    bool StopPlayback();
    bool IsPlaying();
    float GetPlaybackPosition();

    // Audio mixing
    bool CreateAudioMix(const std::vector<std::wstring>& inputFiles, const std::wstring& outputFile);
    bool ExtractAudio(const std::wstring& videoFile, const std::wstring& outputFile);
    bool ConvertAudioFormat(const std::wstring& inputFile, const std::wstring& outputFile, 
                           const std::wstring& format, int bitrate = 192000);

    // System audio settings
    bool SetSampleRate(int sampleRate);
    int GetSampleRate();
    bool SetBitDepth(int bitDepth);
    int GetBitDepth();
    bool SetChannelCount(int channels);
    int GetChannelCount();

    // Audio enhancements
    bool EnableLoudnessEqualization(bool enable);
    bool EnableVirtualization(bool enable);
    bool EnableRoomCorrection(bool enable);
    bool EnableNoiseSuppression(bool enable);
    bool EnableEchoCancellation(bool enable);

    // Audio profiles
    bool SaveProfile(const std::wstring& profileName);
    bool LoadProfile(const std::wstring& profileName);
    bool DeleteProfile(const std::wstring& profileName);
    std::vector<std::wstring> GetProfiles();

    // Audio analysis
    struct AudioAnalysis {
        float loudness;
        float dynamicRange;
        float peakLevel;
        float noiseFloor;
        std::vector<float> frequencySpectrum;
        std::vector<float> waveform;
    };
    
    AudioAnalysis AnalyzeAudio(const std::wstring& audioFile);
    bool DetectSilence(const std::wstring& audioFile, float threshold = -60.0f);
    bool NormalizeAudio(const std::wstring& audioFile, float targetLevel = -1.0f);

    // Audio scheduling
    bool ScheduleVolumeChange(const std::wstring& scheduleName, 
                             const std::wstring& deviceId, 
                             float targetVolume, 
                             SYSTEMTIME startTime, 
                             SYSTEMTIME endTime);
    bool RemoveSchedule(const std::wstring& scheduleName);
    std::vector<std::wstring> GetSchedules();

    // Hotkeys
    bool RegisterHotkey(UINT modifiers, UINT vk, const std::wstring& action);
    bool UnregisterHotkey(UINT modifiers, UINT vk);
    void ProcessHotkey(UINT modifiers, UINT vk);

    // Notifications
    void ShowVolumeNotification(float volume, bool isMuted);
    void ShowDeviceChangeNotification(const std::wstring& deviceName, bool connected);
    void ShowAudioEventNotification(const std::wstring& event, const std::wstring& details);

private:
    class Impl;
    std::unique_ptr<Impl> pImpl;
};