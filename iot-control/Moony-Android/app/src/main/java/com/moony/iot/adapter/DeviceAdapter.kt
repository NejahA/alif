package com.moony.iot.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.moony.iot.databinding.ItemDeviceBinding
import com.moony.iot.network.Device

class DeviceAdapter(private val onDeviceSelected: (Device) -> Unit) :
    ListAdapter<Device, DeviceAdapter.DeviceViewHolder>(DeviceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DeviceViewHolder {
        val binding = ItemDeviceBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return DeviceViewHolder(binding, onDeviceSelected)
    }

    override fun onBindViewHolder(holder: DeviceViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class DeviceViewHolder(
        private val binding: ItemDeviceBinding,
        private val onDeviceSelected: (Device) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(device: Device) {
            binding.apply {
                deviceNameText.text = device.deviceName
                deviceIdText.text = binding.root.context.getString(
                    com.moony.iot.R.string.device_id,
                    device.deviceId
                )
                devicePlatformText.text = binding.root.context.getString(
                    com.moony.iot.R.string.device_platform,
                    device.platform
                )

                if (!device.deviceType.isNullOrEmpty()) {
                    deviceTypeText.visibility = android.view.View.VISIBLE
                    deviceTypeText.text = binding.root.context.getString(
                        com.moony.iot.R.string.device_type,
                        device.deviceType
                    )
                } else {
                    deviceTypeText.visibility = android.view.View.GONE
                }

                selectButton.setOnClickListener {
                    onDeviceSelected(device)
                }

                root.setOnClickListener {
                    onDeviceSelected(device)
                }
            }
        }
    }

    private class DeviceDiffCallback : DiffUtil.ItemCallback<Device>() {
        override fun areItemsTheSame(oldItem: Device, newItem: Device): Boolean {
            return oldItem.deviceId == newItem.deviceId
        }

        override fun areContentsTheSame(oldItem: Device, newItem: Device): Boolean {
            return oldItem == newItem
        }
    }
}
