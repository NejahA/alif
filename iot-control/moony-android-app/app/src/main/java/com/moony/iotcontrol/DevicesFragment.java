package com.moony.iotcontrol;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class DevicesFragment extends Fragment {

    private RecyclerView recyclerView;
    private TextView noDevicesText;
    private DeviceAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_devices, container, false);

        recyclerView = view.findViewById(R.id.devices_recycler);
        noDevicesText = view.findViewById(R.id.no_devices_text);

        adapter = new DeviceAdapter(WebSocketManager.getInstance().getDevices());
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);

        // Listen for device updates
        WebSocketManager.getInstance().addListener(new WebSocketManager.WebSocketListener() {
            @Override
            public void onDeviceListUpdated(List<DeviceInfo> devices) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        adapter.updateDevices(devices);
                        updateEmptyState(devices.isEmpty());
                    });
                }
            }
        });

        updateEmptyState(WebSocketManager.getInstance().getDevices().isEmpty());

        return view;
    }

    private void updateEmptyState(boolean empty) {
        if (empty) {
            recyclerView.setVisibility(View.GONE);
            noDevicesText.setVisibility(View.VISIBLE);
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            noDevicesText.setVisibility(View.GONE);
        }
    }
}