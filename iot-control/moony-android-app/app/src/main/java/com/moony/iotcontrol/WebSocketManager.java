package com.moony.iotcontrol;

import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

/**
 * Manages the WebSocket connection to the IoT Control Server.
 */
public class WebSocketManager {
    private static final String TAG = "WebSocketManager";

    private WebSocket webSocket;
    private String serverAddress;
    private String deviceId;
    private String deviceName;
    private boolean connected;

    private List<DeviceInfo> devices = new ArrayList<>();
    private List<WebSocketListener> listeners = new ArrayList<>();

    // Singleton instance
    private static WebSocketManager instance;

    private WebSocketManager() {
        deviceId = UUID.randomUUID().toString().substring(0, 8);
    }

    public static synchronized WebSocketManager getInstance() {
        if (instance == null) {
            instance = new WebSocketManager();
        }
        return instance;
    }

    public interface ConnectionListener {
        void onConnected();
        void onDisconnected();
        void onError(String error);
    }

    public interface DeviceListListener {
        void onDeviceListUpdated(List<DeviceInfo> devices);
    }

    public interface ChatListener {
        void onMessageReceived(String from, String fromName, String message, String timestamp);
    }

    public interface CommandListener {
        void onCommandReceived(String from, String command);
    }

    public void connect(String address, String name, ConnectionListener listener) {
        this.serverAddress = address;
        this.deviceName = name;

        String wsUrl = address.startsWith("ws://") || address.startsWith("wss://")
                ? address
                : "ws://" + address;

        OkHttpClient client = new OkHttpClient.Builder()
                .readTimeout(0, TimeUnit.MILLISECONDS)
                .build();

        Request request = new Request.Builder()
                .url(wsUrl)
                .build();

        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket ws, Response response) {
                Log.d(TAG, "Connected to server");
                connected = true;

                // Register this device
                registerDevice();

                if (listener != null) {
                    listener.onConnected();
                }
            }

            @Override
            public void onMessage(WebSocket ws, String text) {
                Log.d(TAG, "Message received: " + text);
                try {
                    JSONObject json = new JSONObject(text);
                    String type = json.optString("type", "");

                    switch (type) {
                        case "device_list":
                            handleDeviceList(json);
                            break;
                        case "chat":
                            handleChatMessage(json);
                            break;
                        case "command":
                            handleCommand(json);
                            break;
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error parsing message", e);
                }
            }

            @Override
            public void onClosing(WebSocket ws, int code, String reason) {
                Log.d(TAG, "Closing: " + reason);
                ws.close(1000, null);
            }

            @Override
            public void onClosed(WebSocket ws, int code, String reason) {
                Log.d(TAG, "Closed: " + reason);
                connected = false;
                if (listener != null) {
                    listener.onDisconnected();
                }
            }

            @Override
            public void onFailure(WebSocket ws, Throwable t, Response response) {
                Log.e(TAG, "Error: " + t.getMessage());
                connected = false;
                if (listener != null) {
                    listener.onError(t.getMessage());
                }
            }
        });
    }

    private void registerDevice() {
        try {
            JSONObject registerMsg = new JSONObject();
            registerMsg.put("type", "register");
            registerMsg.put("deviceId", deviceId);
            registerMsg.put("deviceName", deviceName);
            registerMsg.put("platform", "Android (Moony)");
            registerMsg.put("deviceType", "Android");
            sendMessage(registerMsg.toString());
        } catch (Exception e) {
            Log.e(TAG, "Error registering device", e);
        }
    }

    private void handleDeviceList(JSONObject json) {
        try {
            devices.clear();
            JSONArray deviceArray = json.optJSONArray("devices");
            if (deviceArray != null) {
                for (int i = 0; i < deviceArray.length(); i++) {
                    JSONObject dev = deviceArray.getJSONObject(i);
                    devices.add(new DeviceInfo(
                            dev.optString("deviceId", ""),
                            dev.optString("deviceName", ""),
                            dev.optString("platform", ""),
                            dev.optString("deviceType", "")
                    ));
                }
            }
            notifyDeviceListUpdated();
        } catch (Exception e) {
            Log.e(TAG, "Error parsing device list", e);
        }
    }

    private void handleChatMessage(JSONObject json) {
        String from = json.optString("from", "");
        String fromName = json.optString("fromName", "");
        String message = json.optString("message", "");
        String timestamp = json.optString("timestamp", "");
        notifyChatReceived(from, fromName, message, timestamp);
    }

    private void handleCommand(JSONObject json) {
        String from = json.optString("from", "");
        String command = json.optString("command", "");
        notifyCommandReceived(from, command);
    }

    public void sendChat(String targetDeviceId, String message) {
        try {
            JSONObject chatMsg = new JSONObject();
            chatMsg.put("type", "chat");
            chatMsg.put("to", targetDeviceId);
            chatMsg.put("from", deviceId);
            chatMsg.put("fromName", deviceName);
            chatMsg.put("message", message);
            sendMessage(chatMsg.toString());
        } catch (Exception e) {
            Log.e(TAG, "Error sending chat", e);
        }
    }

    public void sendCommand(String targetDeviceId, String command) {
        try {
            JSONObject cmdMsg = new JSONObject();
            cmdMsg.put("type", "command");
            cmdMsg.put("to", targetDeviceId);
            cmdMsg.put("from", deviceId);
            cmdMsg.put("command", command);
            sendMessage(cmdMsg.toString());
        } catch (Exception e) {
            Log.e(TAG, "Error sending command", e);
        }
    }

    private void sendMessage(String message) {
        if (webSocket != null && connected) {
            webSocket.send(message);
        }
    }

    public void disconnect() {
        if (webSocket != null) {
            webSocket.close(1000, "User disconnected");
            webSocket = null;
        }
        connected = false;
        devices.clear();
    }

    public boolean isConnected() {
        return connected;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public List<DeviceInfo> getDevices() {
        return new ArrayList<>(devices);
    }

    // Listener management
    public void addListener(WebSocketListener listener) {
        listeners.add(listener);
    }

    public void removeListener(WebSocketListener listener) {
        listeners.remove(listener);
    }

    private void notifyDeviceListUpdated() {
        List<DeviceInfo> deviceList = getDevices();
        for (WebSocketListener listener : listeners) {
            listener.onDeviceListUpdated(deviceList);
        }
    }

    private void notifyChatReceived(String from, String fromName, String message, String timestamp) {
        for (WebSocketListener listener : listeners) {
            listener.onMessageReceived(from, fromName, message, timestamp);
        }
    }

    private void notifyCommandReceived(String from, String command) {
        for (WebSocketListener listener : listeners) {
            listener.onCommandReceived(from, command);
        }
    }

    // Abstract listener class
    public static abstract class WebSocketListener
            implements DeviceListListener, ChatListener, CommandListener {
        @Override
        public void onDeviceListUpdated(List<DeviceInfo> devices) {}
        @Override
        public void onMessageReceived(String from, String fromName, String message, String timestamp) {}
        @Override
        public void onCommandReceived(String from, String command) {}
    }
}