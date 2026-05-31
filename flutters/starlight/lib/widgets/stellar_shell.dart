import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:starlight/providers/star_provider.dart';
import 'package:starlight/providers/achievement_provider.dart';
import 'package:starlight/theme/starlight_theme.dart';

class StellarShell extends ConsumerStatefulWidget {
  const StellarShell({super.key});

  @override
  ConsumerState<StellarShell> createState() => _StellarShellState();
}

class _StellarShellState extends ConsumerState<StellarShell> {
  final TextEditingController _controller = TextEditingController();
  final List<String> _log = ['SYSTEM_BOOT::CELESTIAL_SHELL_V3.0.1', 'READY_FOR_NEURAL_LINK_ENGAGEMENT...'];
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  Future<void> _handleCommand(String input) async {
    if (input.isEmpty) return;
    
    setState(() {
      _log.add('> $input');
    });

    final parts = input.split(' ');
    final cmd = parts[0].toLowerCase();

    final notifier = ref.read(starProvider.notifier);

    switch (cmd) {
      case '/engage':
        _log.add('INITIALIZING_STAR_BIRTH_SEQUENCE...');
        final intent = parts.length > 1 ? parts.skip(1).join('_') : 'MISSION_UNNAMED';
        // Smart branch-based duration detection
        final branch = ref.read(starProvider).currentBranch ?? '';
        int smartMins = 25;
        if (branch.startsWith('hotfix/')) smartMins = 15;
        else if (branch.startsWith('feat/')) smartMins = 50;
        else if (branch.startsWith('refactor/')) smartMins = 45;
        else if (branch.startsWith('docs/')) smartMins = 20;
        _log.add('AUTO_DURATION_DETECTED::${smartMins}MIN (BRANCH: $branch)');
        notifier.startFocusWithDuration(intent, smartMins);
        break;
      case '/reset':
        _log.add('TERMINATING_CURRENT_LINK...');
        notifier.reset();
        break;
      case '/uplink':
        _log.add('GENERATING_REMOTE_PROTOCOLS...');
        _log.add('PASTE_IN_ZSHRC/BASHRC:');
        _log.add('  alias ststart="curl \'localhost:8080/start?i=terminal_sync\'"');
        _log.add('  alias ststats="curl \'localhost:8080/stats\'"');
        _log.add('FOR_POWERSHELL:');
        _log.add('  function ststart { iwr "localhost:8080/start?i=terminal_sync" }');
        break;
      case '/git':
        if (parts.length > 1) {
          final subCmd = parts[1].toLowerCase();
          if (subCmd == 'status') {
             _log.add('EXECUTING_REBEL_FETCH::GIT_STATUS...');
             try {
                final result = await Process.run('git', ['status', '-s']);
                final output = result.stdout.toString().split('\n').where((s) => s.isNotEmpty).take(5);
                if (output.isEmpty) { _log.add('STATUS::CLEAN'); }
                else { for (final line in output) { _log.add(' > $line'); } }
             } catch (e) { _log.add('ERROR::FETCH_FAILED'); }
          } else if (subCmd == 'log') {
             _log.add('EXECUTING_REBEL_FETCH::GIT_LOG_3...');
             try {
                final result = await Process.run('git', ['log', '--oneline', '-3']);
                final output = result.stdout.toString().split('\n').where((s) => s.isNotEmpty);
                for (final line in output) { _log.add(' > $line'); }
             } catch (e) { _log.add('ERROR::FETCH_FAILED'); }
          }
        } else {
          _log.add('USAGE: /git [status|log]');
        }
        break;
      case '/capture':
        _log.add('CAPTURING_NEURAL_SNIPPET...');
        notifier.captureSnippet();
        break;
      case '/atmosphere':
        if (parts.length > 1) {
          final preset = parts[1].toUpperCase();
          _log.add('TUNING_CELESTIAL_FREQUENCY::$preset...');
          // Logic for audio_provider will go here
        } else {
          _log.add('USAGE: /atmosphere [void|pulsar|nebula]');
        }
        break;
      case '/help':
        _log.add('AVAILABLE_PROTOCOLS:');
        _log.add('  /engage [intent]  - START (auto-detects duration from branch)');
        _log.add('  /uplink           - SHOW_TERMINAL_ALIASES');
        _log.add('  /git [status|log] - FETCH_REPO_DATA');
        _log.add('  /capture          - VAULT_CLIPBOARD_SNIPPET');
        _log.add('  /streak           - SHOW_STREAK_AND_RANK');
        _log.add('  /achievements     - VIEW_ACHIEVEMENT_VAULT');
        _log.add('  /stats            - SHOW_NEURAL_STARDUST');
        _log.add('  /atmosphere [p]   - SET_ENVIRONMENT');
        _log.add('  /reset            - ABORT_MISSION');
        _log.add('  /clear            - RESET_SHELL_LOG');
        break;
      case '/clear':
        setState(() => _log.clear());
        break;
      case '/stats':
        final state = ref.read(starProvider);
        final achState = ref.read(achievementProvider);
        _log.add('TOTAL_STARDUST:   0x${state.stardust}');
        _log.add('HISTORY_NODES:    ${state.history.length}');
        _log.add('FOCUS_MINUTES:    ${achState.totalFocusMinutes}');
        _log.add('STELLAR_RANK:     ${achState.stellarRank}');
        break;
      case '/streak':
        final achSt = ref.read(achievementProvider);
        _log.add('🔥 CURRENT_STREAK: ${achSt.currentStreak}_DAYS');
        _log.add('🏆 LONGEST_STREAK: ${achSt.longestStreak}_DAYS');
        _log.add('⭐ RANK: ${achSt.stellarRank}');
        break;
      case '/achievements':
        final achS = ref.read(achievementProvider);
        _log.add('--- ACHIEVEMENT_VAULT ---');
        for (final a in achS.achievements) {
          final status = a.isUnlocked ? '✅' : '🔒';
          _log.add('$status ${a.emoji} ${a.title}');
          if (!a.isUnlocked) _log.add('   └─ ${a.description}');
        }
        break;
      default:
        _log.add('ERROR::UNKNOWN_PROTOCOL::${cmd.toUpperCase()}');
    }

    _controller.clear();
    _scrollToBottom();
    _focusNode.requestFocus();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 400,
      height: 250,
      padding: const EdgeInsets.all(16),
      decoration: StarlightTheme.glassDecoration.copyWith(
        color: Colors.black.withOpacity(0.85),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.terminal, size: 12, color: StarlightTheme.stellarBlue),
              const SizedBox(width: 8),
              Text(
                'STELLAR_SHELL',
                style: GoogleFonts.firaCode(fontSize: 10, fontWeight: FontWeight.bold, color: StarlightTheme.stellarBlue, letterSpacing: 2),
              ),
              const Spacer(),
              const Text('CRT_SYNC::ACTIVE', style: TextStyle(fontSize: 8, color: Colors.greenAccent, fontWeight: FontWeight.bold)),
            ],
          ),
          const Divider(color: Colors.white12, height: 20),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _log.length,
              itemBuilder: (context, index) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text(
                  _log[index],
                  style: GoogleFonts.firaCode(fontSize: 10, color: _log[index].startsWith('>') ? StarlightTheme.stellarBlue : Colors.white70),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Text('>', style: TextStyle(color: StarlightTheme.stellarBlue, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  onSubmitted: _handleCommand,
                  cursorColor: StarlightTheme.stellarBlue,
                  style: GoogleFonts.firaCode(fontSize: 12, color: Colors.white),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
