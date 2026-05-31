using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using NAudio.CoreAudioApi;

namespace Bluetough
{
    public class AudioManager
    {
        private MMDeviceEnumerator? deviceEnumerator;
        private bool isInitialized = false;

        public AudioManager()
        {
            try
            {
                deviceEnumerator = new MMDeviceEnumerator();
                isInitialized = true;
                Console.WriteLine("AudioManager initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to initialize audio: {ex.Message}");
                isInitialized = false;
            }
        }

        public List<BluetoothDeviceInfo> GetAudioDevices()
        {
            var devices = new List<BluetoothDeviceInfo>();
            
            if (!isInitialized || deviceEnumerator == null)
            {
                Console.WriteLine("Device enumerator is not initialized - returning mock device");
                
                // Return mock device when NAudio fails
                devices.Add(new BluetoothDeviceInfo
                {
                    Name = "Casque (inkax-T3) - Mock",
                    Address = "{0.0.0.00000000}.{85ee97a8-f3ae}",
                    DeviceType = "Bluetooth Audio",
                    Status = "Connected to PC",
                    BatteryLevel = "85% / 90%"
                });
                
                return devices;
            }

            try
            {
                Console.WriteLine("Starting device enumeration...");
                
                var allDevices = deviceEnumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.All);
                
                Console.WriteLine($"Found {allDevices.Count} total devices");
                
                foreach (var device in allDevices)
                {
                    try
                    {
                        Console.WriteLine($"Device: {device.FriendlyName}, State: {device.State}");
                        
                        string nameLower = device.FriendlyName.ToLower();
                        string descLower = device.DeviceFriendlyName.ToLower();
                        string idLower = device.ID.ToLower();
                        
                        // Detect Bluetooth devices by multiple indicators
                        bool isBluetooth = nameLower.Contains("bluetooth") || 
                                          descLower.Contains("bluetooth") ||
                                          idLower.Contains("bluetooth") ||
                                          nameLower.Contains("inkax") ||
                                          nameLower.Contains("casque") ||
                                          nameLower.Contains("headset") ||
                                          nameLower.Contains("headphone") ||
                                          nameLower.Contains("earbuds") ||
                                          nameLower.Contains("airpods") ||
                                          nameLower.Contains("buds") ||
                                          nameLower.Contains("wireless");
                        
                        // SHOW ALL DEVICES FOR NOW (remove filter)
                        string deviceType = isBluetooth ? "Bluetooth Audio" : "Audio Device";
                        
                        string status = device.State switch
                        {
                            DeviceState.Active => "Connected to PC",
                            DeviceState.Disabled => "Disabled",
                            DeviceState.NotPresent => "Not Present",
                            DeviceState.Unplugged => "Disconnected",
                            _ => "Unknown"
                        };
                        
                        devices.Add(new BluetoothDeviceInfo
                        {
                            Name = device.FriendlyName,
                            Address = device.ID.Length > 40 ? device.ID.Substring(0, 40) + "..." : device.ID,
                            DeviceType = deviceType,
                            Status = status,
                            BatteryLevel = isBluetooth && device.State == DeviceState.Active ? "N/A" : "N/A"
                        });
                        
                        Console.WriteLine($"Added device: {device.FriendlyName} as {deviceType}");
                    }
                    catch (Exception deviceEx)
                    {
                        Console.WriteLine($"Error processing device: {deviceEx.Message}");
                    }
                }
                
                Console.WriteLine($"Returning {devices.Count} devices");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error enumerating devices: {ex.Message}");
            }

            return devices;
        }

        public void SetMasterVolume(int volumePercent)
        {
            if (!isInitialized || deviceEnumerator == null)
                return;

            try
            {
                var defaultDevice = deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                if (defaultDevice != null)
                {
                    float volume = volumePercent / 100f;
                    defaultDevice.AudioEndpointVolume.MasterVolumeLevelScalar = volume;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting volume: {ex.Message}");
            }
        }

        public void SetMute(bool mute)
        {
            if (!isInitialized || deviceEnumerator == null)
                return;

            try
            {
                var defaultDevice = deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                if (defaultDevice != null)
                {
                    defaultDevice.AudioEndpointVolume.Mute = mute;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting mute: {ex.Message}");
            }
        }

        public void SetBalance(float balance)
        {
            if (!isInitialized || deviceEnumerator == null)
                return;

            try
            {
                var defaultDevice = deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                if (defaultDevice != null)
                {
                    // Balance: -1.0 (full left) to 1.0 (full right), 0.0 is center
                    var channels = defaultDevice.AudioEndpointVolume.Channels;
                    
                    Console.WriteLine($"Device has {channels.Count} channels");
                    
                    if (channels.Count >= 2)
                    {
                        // Get current master volume to maintain it
                        float masterVolume = defaultDevice.AudioEndpointVolume.MasterVolumeLevelScalar;
                        
                        float leftVolume = masterVolume;
                        float rightVolume = masterVolume;
                        
                        if (balance > 0) // Shift to right, mute/reduce left
                        {
                            leftVolume = masterVolume * (1.0f - balance);
                        }
                        else if (balance < 0) // Shift to left, mute/reduce right
                        {
                            rightVolume = masterVolume * (1.0f + balance);
                        }
                        
                        // Apply volumes to each channel
                        channels[0].VolumeLevelScalar = leftVolume;
                        channels[1].VolumeLevelScalar = rightVolume;
                        
                        Console.WriteLine($"Balance set: Left={leftVolume:F2}, Right={rightVolume:F2}, Master={masterVolume:F2}");
                        
                        System.Windows.MessageBox.Show(
                            $"Balance adjusted:\n\n" +
                            $"Left Channel: {(leftVolume * 100):F0}%\n" +
                            $"Right Channel: {(rightVolume * 100):F0}%\n\n" +
                            $"Note: This controls the audio balance. If you don't hear a difference, " +
                            $"your device may not support per-channel control.",
                            "Balance Control", 
                            System.Windows.MessageBoxButton.OK, 
                            System.Windows.MessageBoxImage.Information);
                    }
                    else
                    {
                        System.Windows.MessageBox.Show(
                            $"This audio device only has {channels.Count} channel(s).\n\n" +
                            $"Stereo balance control requires at least 2 channels (left/right).\n\n" +
                            $"Try selecting a different audio device or check your audio settings.",
                            "Mono Device", 
                            System.Windows.MessageBoxButton.OK, 
                            System.Windows.MessageBoxImage.Warning);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting balance: {ex.Message}");
                System.Windows.MessageBox.Show(
                    $"Error adjusting balance: {ex.Message}\n\n" +
                    $"This may happen if:\n" +
                    $"• The device doesn't support per-channel control\n" +
                    $"• The device is not the active audio output\n" +
                    $"• Windows audio service has issues",
                    "Balance Error", 
                    System.Windows.MessageBoxButton.OK, 
                    System.Windows.MessageBoxImage.Error);
            }
        }

        public int GetMasterVolume()
        {
            if (!isInitialized || deviceEnumerator == null)
                return 50;

            try
            {
                var defaultDevice = deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                if (defaultDevice != null)
                {
                    return (int)(defaultDevice.AudioEndpointVolume.MasterVolumeLevelScalar * 100);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting volume: {ex.Message}");
            }

            return 50;
        }
    }
}
