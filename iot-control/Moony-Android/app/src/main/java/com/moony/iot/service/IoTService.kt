package com.moony.iot.service

import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.util.Log
import androidx.lifecycle.lifecycleScope
import com.moony.iot.network.WebSocketManager
import kotlinx.coroutines.launch
import java.util.UUID

class IoTService : Service() {

    private val binder = LocalBinder()
    private lateinit var webSocketManager: WebSocketManager
    private val deviceId = UUID.randomUUID().toString().take(8)

    inner class LocalBinder : Binder() {
        fun getService(): IoTService = this@IoTService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "Service started")
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
        if (::webSocketManager.isInitialized) {
            webSocketManager.disconnect()
        }
    }

    companion object {
        private const val TAG = "IoTService"
    }
}
