/// Connection status enum
enum ConnectionStatus {
  disconnected,
  connecting,
  connected,
  reconnecting,
  failed,
}

/// Session state for live mode
/// Requirements: 3.1, 3.2, 3.3
class SessionState {
  final String? sessionId;
  final String? sessionCode;
  final bool isHost;
  final String? partnerId;
  final bool isConnected;
  final ConnectionStatus connectionStatus;

  const SessionState({
    this.sessionId,
    this.sessionCode,
    this.isHost = false,
    this.partnerId,
    this.isConnected = false,
    this.connectionStatus = ConnectionStatus.disconnected,
  });

  SessionState copyWith({
    String? sessionId,
    String? sessionCode,
    bool? isHost,
    String? partnerId,
    bool? isConnected,
    ConnectionStatus? connectionStatus,
  }) {
    return SessionState(
      sessionId: sessionId ?? this.sessionId,
      sessionCode: sessionCode ?? this.sessionCode,
      isHost: isHost ?? this.isHost,
      partnerId: partnerId ?? this.partnerId,
      isConnected: isConnected ?? this.isConnected,
      connectionStatus: connectionStatus ?? this.connectionStatus,
    );
  }
}
