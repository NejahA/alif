package com.moony.iot.network

import com.google.gson.annotations.SerializedName

data class Device(
    @SerializedName("deviceId")
    val deviceId: String,
    
    @SerializedName("deviceName")
    val deviceName: String,
    
    @SerializedName("platform")
    val platform: String,
    
    @SerializedName("deviceType")
    val deviceType: String? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Device) return false
        return deviceId == other.deviceId
    }

    override fun hashCode(): Int {
        return deviceId.hashCode()
    }
}
