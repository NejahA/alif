package com.moony.iotcontrol;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class ChatAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int VIEW_TYPE_SENT = 1;
    private static final int VIEW_TYPE_RECEIVED = 2;

    private List<ChatMessage> messages;

    public ChatAdapter(List<ChatMessage> messages) {
        this.messages = messages;
    }

    public void addMessage(ChatMessage message) {
        messages.add(message);
        notifyItemInserted(messages.size() - 1);
    }

    @Override
    public int getItemViewType(int position) {
        return messages.get(position).isSent() ? VIEW_TYPE_SENT : VIEW_TYPE_RECEIVED;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        if (viewType == VIEW_TYPE_SENT) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_chat_sent, parent, false);
            return new SentMessageViewHolder(view);
        } else {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_chat_received, parent, false);
            return new ReceivedMessageViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ChatMessage message = messages.get(position);

        if (holder instanceof SentMessageViewHolder) {
            ((SentMessageViewHolder) holder).messageContent.setText(message.getContent());
            ((SentMessageViewHolder) holder).messageTime.setText(message.getFormattedTime());
        } else if (holder instanceof ReceivedMessageViewHolder) {
            ((ReceivedMessageViewHolder) holder).senderName.setText(message.getSenderName());
            ((ReceivedMessageViewHolder) holder).messageContent.setText(message.getContent());
            ((ReceivedMessageViewHolder) holder).messageTime.setText(message.getFormattedTime());
        }
    }

    @Override
    public int getItemCount() {
        return messages != null ? messages.size() : 0;
    }

    static class SentMessageViewHolder extends RecyclerView.ViewHolder {
        TextView messageContent;
        TextView messageTime;

        SentMessageViewHolder(View itemView) {
            super(itemView);
            messageContent = itemView.findViewById(R.id.message_content);
            messageTime = itemView.findViewById(R.id.message_time);
        }
    }

    static class ReceivedMessageViewHolder extends RecyclerView.ViewHolder {
        TextView senderName;
        TextView messageContent;
        TextView messageTime;

        ReceivedMessageViewHolder(View itemView) {
            super(itemView);
            senderName = itemView.findViewById(R.id.sender_name);
            messageContent = itemView.findViewById(R.id.message_content);
            messageTime = itemView.findViewById(R.id.message_time);
        }
    }
}