package com.moony.iot.network

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonParser
import kotlinx.coroutines.*
import org.java_websocket.WebSocket
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.net.URI

class WebSocketManager(
    private val url: String,
    private val onConnectionChanged: (Boolean) -> Unit,
    private val onDevicesUpdated: (List<Device>) -> Unit,
    private val onCommandReceived: (String, String) -> Unit
) {
    private var webSocket: WebSocketClient? = null
    private val gson = Gson()
    private var isConnected = false

    suspend fun connect() {
        withContext(Dispatchers.Main) {
            try {
                val uri = URI(url)
                webSocket = object : WebSocketClient(uri) {
                    override fun onOpen(handshakedata: ServerHandshake?) {
                        Log.d(TAG, "WebSocket connected")
                        isConnected = true
                        onConnectionChanged(true)
                    }

                    override fun onMessage(message: String?) {
                        if (message != null) {
                            handleMessage(message)
                        }
                    }

                    override fun onClose(code: Int, reason: String?, remote: Boolean) {
                        Log.d(TAG, "WebSocket closed: $reason")
                        isConnected = false
                        onConnectionChanged(false)
                    }

                    override fun onError(ex: Exception?) {
                        Log.e(TAG, "WebSocket error: ${ex?.message}")
                        isConnected = false
                        onConnectionChanged(false)
                    }
                }
                webSocket?.connectBlocking()
            } catch (e: Exception) {
                Log.e(TAG, "Connection error: ${e.message}")
                isConnected = false
                onConnectionChanged(false)
            }
        }
    }

    suspend fun reconnect() {
        withContext(Dispatchers.IO) {
            disconnect()
            delay(1000)
            connect()
        }
    }

    fun disconnect() {
        try {
            webSocket?.close()
            isConnected = false
        } catch (e: Exception) {
            Log.e(TAG, "Disconnect error: ${e.message}")
        }
    }

    suspend fun registerDevice(deviceId: String, deviceName: String, platform: String) {
        withContext(Dispatchers.IO) {
            try {
                val message = RegisterMessage(
                    deviceId = deviceId,
                    deviceName = deviceName,
                    platform = platform
                )
                val json = gson.toJson(message)
                webSocket?.send(json)
                Log.d(TAG, "Device registered: $deviceId")
            } catch (e: Exception) {
                Log.e(TAG, "Registration error: ${e.message}")
            }
        }
    }

    suspend fun sendCommand(to: String, from: String, command: String) {
        withContext(Dispatchers.IO) {
            try {
                val message = CommandMessage(
                    to = to,
                    from = from,
                    command = command
                )
                val json = gson.toJson(message)
                webSocket?.send(json)
                Log.d(TAG, "Command sent to $to: $command")
            } catch (e: Exception) {
                Log.e(TAG, "Send command error: ${e.message}")
            }
        }
    }

    private fun handleMessage(messageJson: String) {
        try {
            val jsonObject = JsonParser.parseString(messageJson).asJsonObject
            val type = jsonObject.get("type").asString

            when (type) {
                "device_list" -> {
                    val message = gson.fromJson(messageJson, DeviceListMessage::class.java)
                    onDevicesUpdated(message.devices)
                    Log.d(TAG, "Devices updated: ${message.devices.size}")
                }
                "command" -> {
                    val message = gson.fromJson(messageJson, CommandMessage::class.java)
                    onCommandReceived(message.from, message.command)
                    Log.d(TAG, "Command received from ${message.from}: ${message.command}")
                }
                else -> {
                    Log.d(TAG, "Unknown message type: $type")
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Message handling error: ${e.message}")
        }
    }

    companion object {
        private const val TAG = "WebSocketManager"
    }
}
