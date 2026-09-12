package com.moony.iotcontrol;

/**
 * Model class representing a connected device.
 */
public class DeviceInfo {
    private String deviceId;
    private String deviceName;
    private String platform;
    private String deviceType;

    public DeviceInfo(String deviceId, String deviceName, String platform, String deviceType) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.platform = platform;
        this.deviceType = deviceType;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getPlatform() {
        return platform;
    }

    public String getDeviceType() {
        return deviceType;
    }

    @Override
    public String toString() {
        return deviceName;
    }
}