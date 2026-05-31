package com.mickii.app

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mickii.app.network.ConnectionState
import com.mickii.app.network.MickiiSocket
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class MainViewModel : ViewModel() {

    val socket = MickiiSocket()

    val connectionState: StateFlow<ConnectionState> = socket.state
        .stateIn(viewModelScope, SharingStarted.Eagerly, ConnectionState.DISCONNECTED)

    val lastError: StateFlow<String?> = socket.lastError
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    fun connect(host: String, port: Int = 9000) = socket.connect(host, port)
    fun disconnect() = socket.disconnect()

    // ── Mouse ──────────────────────────────────────────────────────
    fun mouseMove(dx: Float, dy: Float) = socket.sendMouseMove(dx, dy)
    fun leftClick() = socket.sendMouseClick("left")
    fun rightClick() = socket.sendMouseClick("right")
    fun middleClick() = socket.sendMouseClick("middle")
    fun doubleClick() = socket.sendMouseClick("left", double = true)
    fun scroll(dx: Float, dy: Float) = socket.sendScroll(dx, dy)

    // ── Keyboard ───────────────────────────────────────────────────
    fun typeKey(key: String) = socket.sendKey(key)
    fun typeText(text: String) = socket.sendText(text)

    // ── Media ──────────────────────────────────────────────────────
    fun mediaPlayPause() = socket.sendMedia("play_pause")
    fun mediaNext()      = socket.sendMedia("next")
    fun mediaPrevious()  = socket.sendMedia("previous")
    fun volumeUp()       = socket.sendMedia("volume_up")
    fun volumeDown()     = socket.sendMedia("volume_down")
    fun volumeMute()     = socket.sendMedia("mute")

    override fun onCleared() {
        super.onCleared()
        socket.disconnect()
    }
}
