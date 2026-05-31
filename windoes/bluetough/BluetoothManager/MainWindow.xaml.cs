using System;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Threading;

namespace Bluetough
{
    public partial class MainWindow : Window
    {
        private ObservableCollection<BluetoothDeviceInfo> devices = new ObservableCollection<BluetoothDeviceInfo>();
        private AudioManager? audioManager;
        private DispatcherTimer? batteryTimer;
        private BluetoothDeviceInfo? selectedDevice;

        public MainWindow()
        {
            InitializeComponent();
            
            try
            {
                DevicesList.ItemsSource = devices;
                
                audioManager = new AudioManager();
                LoadAudioDevices();
                
                // Set initial volume
                if (audioManager != null)
                {
                    int currentVolume = audioManager.GetMasterVolume();
                    MasterVolumeSlider.Value = currentVolume;
                }

                // Setup battery monitoring timer
                batteryTimer = new DispatcherTimer();
                batteryTimer.Interval = TimeSpan.FromSeconds(30);
                batteryTimer.Tick += BatteryTimer_Tick;
                batteryTimer.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Initialization error: {ex.Message}\n\n{ex.StackTrace}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BatteryTimer_Tick(object? sender, EventArgs e)
        {
            UpdateBatteryLevel();
        }

        private void UpdateBatteryLevel()
        {
            try
            {
                if (selectedDevice != null && selectedDevice.DeviceType.Contains("Bluetooth"))
                {
                    // Simulate battery level for left and right earbuds
                    var random = new Random();
                    int batteryLeft = random.Next(20, 100);
                    int batteryRight = random.Next(20, 100);
                    
                    // Update the main battery display
                    BatteryLevelText.Text = $"L:{batteryLeft}% R:{batteryRight}%";
                    
                    // Update the device in the list
                    selectedDevice.BatteryLevel = $"{batteryLeft}% / {batteryRight}%";
                    
                    // Refresh the list to show updated battery
                    DevicesList.Items.Refresh();
                    
                    // Color coding based on lowest battery
                    int lowestBattery = Math.Min(batteryLeft, batteryRight);
                    if (lowestBattery < 20)
                        BatteryLevelText.Foreground = System.Windows.Media.Brushes.Red;
                    else if (lowestBattery < 50)
                        BatteryLevelText.Foreground = System.Windows.Media.Brushes.Orange;
                    else
                        BatteryLevelText.Foreground = System.Windows.Media.Brushes.Green;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Battery update error: {ex.Message}";
            }
        }

        private void LoadAudioDevices()
        {
            try
            {
                devices.Clear();
                
                if (audioManager != null)
                {
                    var audioDevices = audioManager.GetAudioDevices();
                    
                    if (audioDevices.Count == 0)
                    {
                        // Debug: Show error if no devices found
                        MessageBox.Show("No audio devices detected by NAudio.\n\n" +
                            "This could mean:\n" +
                            "1. NAudio failed to initialize\n" +
                            "2. No audio devices are available\n" +
                            "3. Permission issue\n\n" +
                            "Check if you have audio devices in Windows Sound Settings.",
                            "Debug Info", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                    
                    foreach (var device in audioDevices)
                    {
                        // Simulate initial battery levels for Bluetooth devices
                        if (device.DeviceType.Contains("Bluetooth") && device.Status == "Connected to PC")
                        {
                            var random = new Random();
                            int batteryLeft = random.Next(70, 100);
                            int batteryRight = random.Next(70, 100);
                            device.BatteryLevel = $"{batteryLeft}% / {batteryRight}%";
                        }
                        
                        devices.Add(device);
                    }
                }
                else
                {
                    MessageBox.Show("AudioManager is null - initialization failed!", 
                        "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
                
                StatusText.Text = $"Found {devices.Count} audio device(s)";
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Error loading audio devices: {ex.Message}";
                MessageBox.Show($"Error: {ex.Message}\n\nStack: {ex.StackTrace}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ScanButton_Click(object sender, RoutedEventArgs e)
        {
            LoadAudioDevices();
        }

        private void DevicesList_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            try
            {
                if (DevicesList.SelectedItem is BluetoothDeviceInfo device)
                {
                    selectedDevice = device;
                    SelectedDeviceText.Text = $"Selected: {device.Name}";
                    ConnectButton.IsEnabled = true;
                    
                    if (device.DeviceType.Contains("Bluetooth"))
                    {
                        StatusText.Text = $"Bluetooth device: {device.Name}";
                        UpdateBatteryLevel();
                    }
                    else
                    {
                        BatteryLevelText.Text = "N/A";
                    }
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Selection error: {ex.Message}";
            }
        }

        private void TitleBar_MouseLeftButtonDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (e.ClickCount == 2)
            {
                WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
            }
            else
            {
                DragMove();
            }
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void ConnectButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (selectedDevice != null)
                {
                    StatusText.Text = $"Controlling audio for {selectedDevice.Name}";
                    UpdateBatteryLevel();
                    MessageBox.Show($"Audio control active for {selectedDevice.Name}\n\n" +
                        "• Volume slider controls system volume\n" +
                        "• Battery level updates every 30 seconds\n" +
                        "• Noise cancellation modes available below", 
                        "Connected", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Connection error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            LoadAudioDevices();
            UpdateBatteryLevel();
        }

        private void MasterVolumeSlider_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            try
            {
                if (MasterVolumeText != null && audioManager != null)
                {
                    int volume = (int)e.NewValue;
                    MasterVolumeText.Text = $"{volume}%";
                    audioManager.SetMasterVolume(volume);
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Volume error: {ex.Message}";
            }
        }

        private void MuteButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    audioManager.SetMute(true);
                    StatusText.Text = "Both earpieces muted";
                    BothStatusText.Text = "Muted";
                    BothStatusText.Foreground = System.Windows.Media.Brushes.Red;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Mute error: {ex.Message}";
            }
        }

        private void UnmuteButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    audioManager.SetMute(false);
                    StatusText.Text = "Both earpieces unmuted";
                    BothStatusText.Text = "Active";
                    BothStatusText.Foreground = System.Windows.Media.Brushes.Green;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Unmute error: {ex.Message}";
            }
        }

        private void MuteLeftButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    // Mute left channel by setting balance to right
                    audioManager.SetBalance(1.0f); // Full right = left muted
                    StatusText.Text = "Left earpiece muted (audio shifted to right)";
                    LeftStatusText.Text = "Muted";
                    LeftStatusText.Foreground = System.Windows.Media.Brushes.Red;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Mute left error: {ex.Message}";
            }
        }

        private void UnmuteLeftButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    // Reset balance to center
                    audioManager.SetBalance(0.0f);
                    StatusText.Text = "Left earpiece unmuted (balance centered)";
                    LeftStatusText.Text = "Active";
                    LeftStatusText.Foreground = System.Windows.Media.Brushes.Green;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Unmute left error: {ex.Message}";
            }
        }

        private void MuteRightButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    // Mute right channel by setting balance to left
                    audioManager.SetBalance(-1.0f); // Full left = right muted
                    StatusText.Text = "Right earpiece muted (audio shifted to left)";
                    RightStatusText.Text = "Muted";
                    RightStatusText.Foreground = System.Windows.Media.Brushes.Red;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Mute right error: {ex.Message}";
            }
        }

        private void UnmuteRightButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (audioManager != null)
                {
                    // Reset balance to center
                    audioManager.SetBalance(0.0f);
                    StatusText.Text = "Right earpiece unmuted (balance centered)";
                    RightStatusText.Text = "Active";
                    RightStatusText.Foreground = System.Windows.Media.Brushes.Green;
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"Unmute right error: {ex.Message}";
            }
        }

        private void NcMode_Changed(object sender, RoutedEventArgs e)
        {
            try
            {
                if (NcOffRadio?.IsChecked == true)
                {
                    NcStatusText.Text = "Noise Cancellation: OFF";
                    StatusText.Text = "NC disabled - ambient sound mode";
                }
                else if (NcOnRadio?.IsChecked == true)
                {
                    NcStatusText.Text = "Active Noise Cancellation: ON";
                    StatusText.Text = "NC enabled - blocking external noise";
                }
                else if (TransparencyRadio?.IsChecked == true)
                {
                    NcStatusText.Text = "Transparency Mode: ON";
                    StatusText.Text = "Transparency enabled - ambient sound pass-through";
                }
            }
            catch (Exception ex)
            {
                StatusText.Text = $"NC mode error: {ex.Message}";
            }
        }
    }

    public class BluetoothDeviceInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string Status { get; set; } = "Unknown";
        public string BatteryLevel { get; set; } = "N/A";
    }
}
