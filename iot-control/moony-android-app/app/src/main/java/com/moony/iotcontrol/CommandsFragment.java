package com.moony.iotcontrol;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class CommandsFragment extends Fragment {

    private Spinner deviceSpinner;
    private RecyclerView commandHistory;
    private TextInputEditText commandInput;
    private MaterialButton sendButton, btnOn, btnOff, btnRestart;

    private List<String> commands = new ArrayList<>();
    private List<DeviceInfo> deviceList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_commands, container, false);

        deviceSpinner = view.findViewById(R.id.command_device_spinner);
        commandHistory = view.findViewById(R.id.command_history);
        commandInput = view.findViewById(R.id.command_input);
        sendButton = view.findViewById(R.id.send_command_btn);
        btnOn = view.findViewById(R.id.btn_on);
        btnOff = view.findViewById(R.id.btn_off);
        btnRestart = view.findViewById(R.id.btn_restart);

        // Setup command history list
        CommandHistoryAdapter adapter = new CommandHistoryAdapter(commands);
        commandHistory.setLayoutManager(new LinearLayoutManager(getContext()));
        commandHistory.setAdapter(adapter);

        updateDeviceSpinner();

        // Listen for device updates
        WebSocketManager.getInstance().addListener(new WebSocketManager.WebSocketListener() {
            @Override
            public void onDeviceListUpdated(List<DeviceInfo> devices) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> updateDeviceSpinner());
                }
            }
        });

        // Quick command buttons
        btnOn.setOnClickListener(v -> sendQuickCommand("ON"));
        btnOff.setOnClickListener(v -> sendQuickCommand("OFF"));
        btnRestart.setOnClickListener(v -> sendQuickCommand("RESTART"));

        // Custom command send
        sendButton.setOnClickListener(v -> {
            String cmd = commandInput.getText().toString().trim();
            if (!cmd.isEmpty()) {
                sendCommand(cmd);
                commandInput.setText("");
            }
        });

        return view;
    }

    private void updateDeviceSpinner() {
        deviceList = WebSocketManager.getInstance().getDevices();
        List<String> deviceNames = new ArrayList<>();
        for (DeviceInfo device : deviceList) {
            if (!device.getDeviceId().equals(WebSocketManager.getInstance().getDeviceId())) {
                deviceNames.add(device.getDeviceName());
            }
        }

        if (deviceNames.isEmpty()) {
            deviceNames.add("No other devices");
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                getContext(), android.R.layout.simple_spinner_item, deviceNames
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        deviceSpinner.setAdapter(adapter);
    }

    private void sendQuickCommand(String cmd) {
        int selectedPos = deviceSpinner.getSelectedItemPosition();
        if (selectedPos < 0 || selectedPos >= deviceList.size()) return;

        DeviceInfo targetDevice = deviceList.get(selectedPos);
        if (targetDevice.getDeviceId().equals(WebSocketManager.getInstance().getDeviceId())) return;

        WebSocketManager.getInstance().sendCommand(targetDevice.getDeviceId(), cmd);
        commands.add("→ " + targetDevice.getDeviceName() + ": " + cmd);
        ((CommandHistoryAdapter) commandHistory.getAdapter()).notifyDataSetChanged();
        commandHistory.smoothScrollToPosition(commands.size() - 1);
    }

    private void sendCommand(String cmd) {
        int selectedPos = deviceSpinner.getSelectedItemPosition();
        if (selectedPos < 0 || selectedPos >= deviceList.size()) return;

        DeviceInfo targetDevice = deviceList.get(selectedPos);
        if (targetDevice.getDeviceId().equals(WebSocketManager.getInstance().getDeviceId())) return;

        WebSocketManager.getInstance().sendCommand(targetDevice.getDeviceId(), cmd);
        commands.add("→ " + targetDevice.getDeviceName() + ": " + cmd);
        ((CommandHistoryAdapter) commandHistory.getAdapter()).notifyDataSetChanged();
        commandHistory.smoothScrollToPosition(commands.size() - 1);
    }

    private static class CommandHistoryAdapter extends RecyclerView.Adapter<CommandHistoryAdapter.ViewHolder> {
        private List<String> commands;

        CommandHistoryAdapter(List<String> commands) {
            this.commands = commands;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            TextView textView = new TextView(parent.getContext());
            textView.setPadding(16, 12, 16, 12);
            textView.setTextSize(14);
            textView.setTextColor(0xFFE0E0E0);
            textView.setLayoutParams(new RecyclerView.LayoutParams(
                    RecyclerView.LayoutParams.MATCH_PARENT,
                    RecyclerView.LayoutParams.WRAP_CONTENT
            ));
            return new ViewHolder(textView);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            holder.textView.setText(commands.get(position));
        }

        @Override
        public int getItemCount() {
            return commands.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView textView;

            ViewHolder(TextView itemView) {
                super(itemView);
                textView = itemView;
            }
        }
    }
}