package com.moony.iotcontrol;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;

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

public class ChatFragment extends Fragment {

    private Spinner deviceSpinner;
    private RecyclerView chatRecycler;
    private TextInputEditText chatInput;
    private MaterialButton sendButton;

    private ChatAdapter chatAdapter;
    private List<ChatMessage> messages = new ArrayList<>();
    private List<DeviceInfo> deviceList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_chat, container, false);

        deviceSpinner = view.findViewById(R.id.chat_device_spinner);
        chatRecycler = view.findViewById(R.id.chat_recycler);
        chatInput = view.findViewById(R.id.chat_input);
        sendButton = view.findViewById(R.id.send_chat_btn);

        chatAdapter = new ChatAdapter(messages);
        chatRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        chatRecycler.setAdapter(chatAdapter);

        // Setup device spinner
        updateDeviceSpinner();

        // Listen for device updates and incoming chat messages
        WebSocketManager.getInstance().addListener(new WebSocketManager.WebSocketListener() {
            @Override
            public void onDeviceListUpdated(List<DeviceInfo> devices) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> updateDeviceSpinner());
                }
            }

            @Override
            public void onMessageReceived(String from, String fromName, String message, String timestamp) {
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> {
                        ChatMessage chatMsg = new ChatMessage(
                                message, fromName, from, timestamp, false
                        );
                        chatAdapter.addMessage(chatMsg);
                        chatRecycler.smoothScrollToPosition(messages.size() - 1);
                    });
                }
            }
        });

        // Send button click
        sendButton.setOnClickListener(v -> sendChatMessage());

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

    private void sendChatMessage() {
        String message = chatInput.getText().toString().trim();
        if (message.isEmpty()) return;

        int selectedPos = deviceSpinner.getSelectedItemPosition();
        if (selectedPos < 0 || selectedPos >= deviceList.size()) return;

        DeviceInfo targetDevice = deviceList.get(selectedPos);
        if (targetDevice.getDeviceId().equals(WebSocketManager.getInstance().getDeviceId())) return;

        WebSocketManager.getInstance().sendChat(targetDevice.getDeviceId(), message);

        // Add sent message to UI
        String timestamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).format(new Date());
        ChatMessage sentMsg = new ChatMessage(message,
                WebSocketManager.getInstance().getDeviceName(),
                WebSocketManager.getInstance().getDeviceId(),
                timestamp, true);
        chatAdapter.addMessage(sentMsg);
        chatRecycler.smoothScrollToPosition(messages.size() - 1);
        chatInput.setText("");
    }
}