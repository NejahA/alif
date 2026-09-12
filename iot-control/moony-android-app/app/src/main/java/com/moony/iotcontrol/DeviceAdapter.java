package com.moony.iotcontrol;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class DeviceAdapter extends RecyclerView.Adapter<DeviceAdapter.DeviceViewHolder> {

    private List<DeviceInfo> devices;

    public DeviceAdapter(List<DeviceInfo> devices) {
        this.devices = devices;
    }

    public void updateDevices(List<DeviceInfo> newDevices) {
        this.devices = newDevices;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public DeviceViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_device, parent, false);
        return new DeviceViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull DeviceViewHolder holder, int position) {
        DeviceInfo device = devices.get(position);
        holder.deviceName.setText(device.getDeviceName());
        holder.devicePlatform.setText(device.getPlatform());

        // Set appropriate icon based on platform
        String platform = device.getPlatform().toLowerCase();
        if (platform.contains("android")) {
            holder.deviceIcon.setText("📱");
        } else if (platform.contains("windows") || platform.contains("pc")) {
            holder.deviceIcon.setText("💻");
        } else if (platform.contains("mac") || platform.contains("ios")) {
            holder.deviceIcon.setText("🍎");
        } else if (platform.contains("linux")) {
            holder.deviceIcon.setText("🐧");
        } else {
            holder.deviceIcon.setText("📡");
        }
    }

    @Override
    public int getItemCount() {
        return devices != null ? devices.size() : 0;
    }

    static class DeviceViewHolder extends RecyclerView.ViewHolder {
        TextView deviceName;
        TextView devicePlatform;
        TextView deviceIcon;

        DeviceViewHolder(View itemView) {
            super(itemView);
            deviceName = itemView.findViewById(R.id.device_name);
            devicePlatform = itemView.findViewById(R.id.device_platform);
            deviceIcon = itemView.findViewById(R.id.device_icon);
        }
    }
}