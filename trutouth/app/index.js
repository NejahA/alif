import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Switch,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BleManager } from 'react-native-ble-plx';

export default function Home() {
  const [bleManager] = useState(() => new BleManager());
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [noiseControl, setNoiseControl] = useState('off');
  const [hideUnknownDevices, setHideUnknownDevices] = useState(false);

  useEffect(() => {
    requestPermissions();
    
    return () => {
      if (connectedDevice) {
        connectedDevice.cancelConnection();
      }
      bleManager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          Alert.alert('Permissions required', 'Bluetooth permissions are needed');
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission required', 'Location permission is needed');
        }
      }
    }
  };

  const scanDevices = () => {
    setDevices([]);
    setScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setScanning(false);
        return;
      }

      if (device) {
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const connectToDevice = async (device) => {
    try {
      bleManager.stopDeviceScan();
      setScanning(false);

      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
      
      setConnectedDevice(connected);
      Alert.alert('Success', `Connected to ${device.name}`);
      
      setBatteryLevel(85);
    } catch (error) {
      Alert.alert('Error', `Failed to connect: ${error.message}`);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      await connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setBatteryLevel(null);
      setNoiseControl('off');
      Alert.alert('Disconnected', 'Device disconnected');
    }
  };

  const toggleNoiseControl = (mode) => {
    setNoiseControl(mode);
    Alert.alert('Noise Control', `Switched to ${mode} mode`);
  };

  const getSignalStrength = (rssi) => {
    if (rssi >= -50) return { text: 'Excellent', color: '#4CAF50' };
    if (rssi >= -60) return { text: 'Good', color: '#8BC34A' };
    if (rssi >= -70) return { text: 'Fair', color: '#FF9800' };
    return { text: 'Weak', color: '#F44336' };
  };

  const getFilteredDevices = () => {
    if (hideUnknownDevices) {
      return devices.filter(device => device.name);
    }
    return devices;
  };

  const renderDevice = ({ item }) => {
    const signal = getSignalStrength(item.rssi);
    return (
      <TouchableOpacity
        style={styles.deviceItem}
        onPress={() => connectToDevice(item)}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <Text style={styles.deviceId}>MAC: {item.id}</Text>
          <View style={styles.signalContainer}>
            <Text style={styles.rssi}>{item.rssi} dBm</Text>
            <Text style={[styles.signalText, { color: signal.color }]}>
              {signal.text}
            </Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  if (connectedDevice) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.connectedHeader}>
          <Text style={styles.connectedTitle}>{connectedDevice.name}</Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectDevice}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContainer}>
          {batteryLevel && (
            <View style={styles.settingCard}>
              <Text style={styles.settingTitle}>Battery Level</Text>
              <Text style={styles.batteryText}>{batteryLevel}%</Text>
              <View style={styles.batteryBar}>
                <View style={[styles.batteryFill, { width: `${batteryLevel}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.settingCard}>
            <Text style={styles.settingTitle}>Noise Control</Text>
            <View style={styles.noiseControlButtons}>
              <TouchableOpacity
                style={[
                  styles.noiseButton,
                  noiseControl === 'off' && styles.noiseButtonActive
                ]}
                onPress={() => toggleNoiseControl('off')}
              >
                <Text style={[
                  styles.noiseButtonText,
                  noiseControl === 'off' && styles.noiseButtonTextActive
                ]}>Off</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.noiseButton,
                  noiseControl === 'anc' && styles.noiseButtonActive
                ]}
                onPress={() => toggleNoiseControl('anc')}
              >
                <Text style={[
                  styles.noiseButtonText,
                  noiseControl === 'anc' && styles.noiseButtonTextActive
                ]}>ANC</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.noiseButton,
                  noiseControl === 'transparency' && styles.noiseButtonActive
                ]}
                onPress={() => toggleNoiseControl('transparency')}
              >
                <Text style={[
                  styles.noiseButtonText,
                  noiseControl === 'transparency' && styles.noiseButtonTextActive
                ]}>Transparency</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Ear Detection</Text>
              <Switch value={true} />
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Spatial Audio</Text>
              <Switch value={false} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Earpods Control</Text>
        <Text style={styles.subtitle}>Connect your Bluetooth earpods</Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
        onPress={scanDevices}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>Scan for Devices</Text>
        )}
      </TouchableOpacity>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setHideUnknownDevices(!hideUnknownDevices)}
        >
          <View style={[styles.checkbox, hideUnknownDevices && styles.checkboxChecked]}>
            {hideUnknownDevices && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.filterText}>Hide Unknown Devices</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredDevices()}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning ? 'Scanning...' : 'No devices found. Start scanning.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  connectedHeader: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  disconnectButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  disconnectText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  rssi: {
    fontSize: 14,
    color: '#999',
    marginRight: 5,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 24,
    color: '#ccc',
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24, 
    borderWidth: 2, 
    borderColor: '#2196F3', 
    borderRadius: 4, 
    marginRight: 10, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
  settingsContainer: {
    flex: 1,
    padding: 15,
  },
  settingCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  batteryText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  batteryBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  noiseControlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noiseButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  noiseButtonActive: {
    backgroundColor: '#2196F3',
  },
  noiseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  noiseButtonTextActive: {
    color: '#fff',
  },
});
