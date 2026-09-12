package com.moony.iotcontrol;

/**
 * Model class representing a chat message.
 */
public class ChatMessage {
    private String content;
    private String senderName;
    private String senderId;
    private String timestamp;
    private boolean isSent;

    public ChatMessage(String content, String senderName, String senderId, String timestamp, boolean isSent) {
        this.content = content;
        this.senderName = senderName;
        this.senderId = senderId;
        this.timestamp = timestamp;
        this.isSent = isSent;
    }

    public String getContent() {
        return content;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public boolean isSent() {
        return isSent;
    }

    public String getFormattedTime() {
        try {
            if (timestamp != null && timestamp.length() >= 16) {
                String time = timestamp.substring(11, 16);
                int hours = Integer.parseInt(time.substring(0, 2));
                String ampm = hours >= 12 ? "PM" : "AM";
                if (hours > 12) hours -= 12;
                if (hours == 0) hours = 12;
                return hours + time.substring(2) + " " + ampm;
            }
        } catch (Exception ignored) {}
        return "";
    }
}