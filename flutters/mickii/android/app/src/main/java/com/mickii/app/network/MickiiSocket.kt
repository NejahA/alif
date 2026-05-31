package com.mickii.app.network

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit

private const val TAG = "MickiiSocket"

enum class ConnectionState { DISCONNECTED, CONNECTING, CONNECTED, ERROR }

class MickiiSocket {

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)   // no read timeout (persistent)
        .build()

    private var ws: WebSocket? = null
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _state = MutableStateFlow(ConnectionState.DISCONNECTED)
    val state: StateFlow<ConnectionState> = _state

    private val _lastError = MutableStateFlow<String?>(null)
    val lastError: StateFlow<String?> = _lastError

    // ── Public API ────────────────────────────────────────────────

    fun connect(host: String, port: Int = 9000) {
        if (_state.value == ConnectionState.CONNECTING ||
            _state.value == ConnectionState.CONNECTED) return

        _state.value = ConnectionState.CONNECTING
        _lastError.value = null

        val url = "ws://$host:$port"
        Log.i(TAG, "Connecting to $url")

        val request = Request.Builder().url(url).build()
        ws = client.newWebSocket(request, Listener())
    }

    fun disconnect() {
        ws?.close(1000, "User disconnected")
        ws = null
        _state.value = ConnectionState.DISCONNECTED
    }

    // ── Command senders ───────────────────────────────────────────

    fun sendMouseMove(dx: Float, dy: Float) = send {
        put("cmd", "mouse_move")
        put("dx", dx.toDouble())
        put("dy", dy.toDouble())
    }

    fun sendMouseClick(button: String = "left", double: Boolean = false) = send {
        put("cmd", "mouse_click")
        put("button", button)
        put("double", double)
    }

    fun sendScroll(dx: Float, dy: Float) = send {
        put("cmd", "scroll")
        put("dx", dx.toDouble())
        put("dy", dy.toDouble())
    }

    fun sendKey(key: String, action: String = "tap") = send {
        put("cmd", "key")
        put("key", key)
        put("action", action)
    }

    fun sendText(text: String) = send {
        put("cmd", "text")
        put("text", text)
    }

    fun sendMedia(action: String) = send {
        put("cmd", "media")
        put("action", action)
    }

    // ── Internal ──────────────────────────────────────────────────

    private fun send(block: JSONObject.() -> Unit) {
        val payload = JSONObject().apply(block).toString()
        val sent = ws?.send(payload) ?: false
        if (!sent) Log.w(TAG, "Failed to send: $payload")
    }

    private inner class Listener : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            Log.i(TAG, "Connected")
            _state.value = ConnectionState.CONNECTED
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            Log.e(TAG, "Connection failure: ${t.message}")
            _lastError.value = t.message ?: "Connection failed"
            _state.value = ConnectionState.ERROR
            ws = null
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            Log.i(TAG, "Closed: $reason")
            _state.value = ConnectionState.DISCONNECTED
            ws = null
        }
    }
}
