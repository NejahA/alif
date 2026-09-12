package com.moony.iot.network

import com.google.gson.annotations.SerializedName

sealed class Message {
    abstract val type: String
}

data class RegisterMessage(
    @SerializedName("type")
    override val type: String = "register",
    
    @SerializedName("deviceId")
    val deviceId: String,
    
    @SerializedName("deviceName")
    val deviceName: String,
    
    @SerializedName("platform")
    val platform: String,
    
    @SerializedName("deviceType")
    val deviceType: String? = null
) : Message()

data class CommandMessage(
    @SerializedName("type")
    override val type: String = "command",
    
    @SerializedName("to")
    val to: String? = null,
    
    @SerializedName("from")
    val from: String,
    
    @SerializedName("command")
    val command: String
) : Message()

data class DeviceListMessage(
    @SerializedName("type")
    override val type: String = "device_list",
    
    @SerializedName("devices")
    val devices: List<Device> = emptyList()
) : Message()

data class GenericMessage(
    @SerializedName("type")
    override val type: String,
    
    val data: Map<String, Any>? = null
) : Message()
