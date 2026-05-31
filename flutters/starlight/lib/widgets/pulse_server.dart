import 'dart:convert';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:starlight/providers/star_provider.dart';

class LocalPulseServer {
  final WidgetRef ref;
  HttpServer? _server;

  LocalPulseServer(this.ref);

  Future<void> start() async {
    try {
      _server = await HttpServer.bind(InternetAddress.loopbackIPv4, 8080);
      print('STARLIGHT_PULSE_SERVER_ACTIVE_AT_PORT_8080');

      await for (HttpRequest request in _server!) {
        _handleRequest(request);
      }
    } catch (e) {
      print('ERROR::PULSE_SERVER_INITIALIZATION_FAILED::$e');
    }
  }

  void _handleRequest(HttpRequest request) {
    try {
      if (request.uri.path == '/start') {
        final duration = int.tryParse(request.uri.queryParameters['d'] ?? '25') ?? 25;
        final intent = request.uri.queryParameters['i'] ?? 'REMOTE_FOCUS_LINK';
        
        final notifier = ref.read(starProvider.notifier);
        notifier.openBriefing(Duration(minutes: duration));
        // Auto-engage from API
        notifier.startFocus(intent);

        request.response
          ..statusCode = HttpStatus.ok
          ..write(jsonEncode({'status': 'ENGAGED', 'intent': intent, 'duration': duration}))
          ..close();
      } else if (request.uri.path == '/stats') {
        final state = ref.read(starProvider);
        request.response
          ..statusCode = HttpStatus.ok
          ..write(jsonEncode({
            'stardust': state.stardust,
            'history_count': state.history.length,
            'current_phase': state.phase.name,
          }))
          ..close();
      } else {
        request.response
          ..statusCode = HttpStatus.notFound
          ..write('ERROR::INVALID_PULSE_ENDPOINT')
          ..close();
      }
    } catch (e) {
      request.response
          ..statusCode = HttpStatus.internalServerError
          ..write('ERROR::INTERNAL_PULSE_ERROR')
          ..close();
    }
  }

  void stop() {
    _server?.close();
  }
}
