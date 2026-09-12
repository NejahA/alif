package com.moony.iot.ui

import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.moony.iot.R
import com.moony.iot.databinding.ActivityMainBinding
import com.moony.iot.network.WebSocketManager
import com.moony.iot.network.Device
import com.moony.iot.adapter.DeviceAdapter
import kotlinx.coroutines.launch
import java.util.UUID

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var webSocketManager: WebSocketManager
    private lateinit var deviceAdapter: DeviceAdapter
    private var selectedDeviceId: String? = null
    private val deviceId = UUID.randomUUID().toString().take(8)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.title = getString(R.string.app_name)

        setupRecyclerView()
        setupWebSocket()
        setupListeners()

        // Set device ID in UI
        binding.deviceIdText.text = deviceId
    }

    private fun setupRecyclerView() {
        deviceAdapter = DeviceAdapter { device ->
            selectedDeviceId = device.deviceId
            Toast.makeText(this, "Selected: ${device.deviceName}", Toast.LENGTH_SHORT).show()
        }
        binding.devicesList.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = deviceAdapter
        }
    }

    private fun setupWebSocket() {
        webSocketManager = WebSocketManager(
            url = getString(R.string.server_url),
            onConnectionChanged = { connected ->
                runOnUiThread {
                    updateConnectionStatus(connected)
                }
            },
            onDevicesUpdated = { devices ->
                runOnUiThread {
                    updateDevicesList(devices)
                }
            },
            onCommandReceived = { from, command ->
                runOnUiThread {
                    handleCommandReceived(from, command)
                }
            }
        )

        lifecycleScope.launch {
            webSocketManager.connect()
            // Register this device
            webSocketManager.registerDevice(
                deviceId = deviceId,
                deviceName = getString(R.string.device_name),
                platform = "Android"
            )
        }
    }

    private fun setupListeners() {
        binding.sendButton.setOnClickListener {
            val command = binding.commandInput.text.toString().trim()
            if (command.isEmpty()) {
                Toast.makeText(this, "Enter a command", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (selectedDeviceId == null) {
                Toast.makeText(this, R.string.select_device, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                webSocketManager.sendCommand(
                    to = selectedDeviceId!!,
                    from = deviceId,
                    command = command
                )
                binding.commandInput.text?.clear()
                Toast.makeText(
                    this@MainActivity,
                    getString(R.string.command_sent, selectedDeviceId),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun updateConnectionStatus(connected: Boolean) {
        if (connected) {
            binding.statusText.text = getString(R.string.connected)
            binding.statusText.setTextColor(resources.getColor(R.color.connected_green, null))
            binding.statusIndicator.setBackgroundResource(R.drawable.status_indicator_connected)
            binding.sendButton.isEnabled = true
        } else {
            binding.statusText.text = getString(R.string.disconnected)
            binding.statusText.setTextColor(resources.getColor(R.color.disconnected_red, null))
            binding.statusIndicator.setBackgroundResource(R.drawable.status_indicator_disconnected)
            binding.sendButton.isEnabled = false
        }
    }

    private fun updateDevicesList(devices: List<Device>) {
        if (devices.isEmpty()) {
            binding.devicesList.visibility = android.view.View.GONE
            binding.emptyText.visibility = android.view.View.VISIBLE
        } else {
            binding.devicesList.visibility = android.view.View.VISIBLE
            binding.emptyText.visibility = android.view.View.GONE
            deviceAdapter.submitList(devices)
        }
    }

    private fun handleCommandReceived(fromDeviceId: String, command: String) {
        binding.lastCommandText.text = getString(R.string.received_command, fromDeviceId, command)
        binding.lastCommandLayout.visibility = android.view.View.VISIBLE
        Toast.makeText(this, "Command from $fromDeviceId: $command", Toast.LENGTH_LONG).show()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_reconnect -> {
                lifecycleScope.launch {
                    webSocketManager.reconnect()
                }
                true
            }
            R.id.action_disconnect -> {
                webSocketManager.disconnect()
                true
            }
            R.id.action_about -> {
                Toast.makeText(
                    this,
                    "Moony v${getString(R.string.app_version)}\nIoT Control Client",
                    Toast.LENGTH_LONG
                ).show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        webSocketManager.disconnect()
    }
}
