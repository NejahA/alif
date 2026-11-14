import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart'; // <-- was missing: fixes Scaffold/Theme/Icons/Text/widget errors
import 'package:flutter/rendering.dart'; // RenderRepaintBoundary
import 'package:flutter/scheduler.dart'; // Ticker

import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
// If you have share_plus installed you can import it, otherwise the share button will be a placeholder.
// import 'package:share_plus/share_plus.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';
import '../widgets/mini_map.dart';
import '../widgets/neural_canvas.dart';

/// The main screen for the Hiro garden editor.
///
/// Features:
///   * tooltips for all top-bar icons
///   * dark-mode toggle
///   * status bar (zoom, selection count, saved indicator)
///   * help / about dialog
///   * settings panel (grid-snap, multi-select, animation speed)
///   * PNG screenshot, PDF export and printing
///   * undo/redo history panel
///   * shortcut overlay
///   * performance monitor (FPS)
///   * batch-action toolbar (duplicate, move front/back)
class GardenScreen extends StatefulWidget {
  final GardenService service;
  const GardenScreen({Key? key, required this.service}) : super(key: key);

  @override
  State<GardenScreen> createState() => _GardenScreenState();
}

class _GardenScreenState extends State<GardenScreen>
    with TickerProviderStateMixin {
  // ----- Core controllers ---------------------------------------------------
  final TransformationController _zoomController = TransformationController();
  final GlobalKey _screenshotKey = GlobalKey();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // ----- UI state -----------------------------------------------------------
  bool _isDarkMode = false;
  bool _showHelpOverlay = false;
  bool _showPerformanceOverlay = false;
  bool _largeText = false; // accessibility toggle

  // ----- FPS counter --------------------------------------------------------
  int _frameCount = 0;
  double _fps = 0.0;
  Duration _lastFpsUpdate = Duration.zero;
  late final Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onTick)..start();
    widget.service.addListener(_onServiceChanged);
  }

  void _onTick(Duration elapsed) {
    _frameCount++;
    if (elapsed - _lastFpsUpdate >= const Duration(seconds: 1)) {
      _lastFpsUpdate = elapsed;
      final fps = _frameCount.toDouble();
      _frameCount = 0;
      // Only rebuild when the overlay is actually visible.
      if (_showPerformanceOverlay && mounted) {
        setState(() => _fps = fps);
      } else {
        _fps = fps;
      }
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    widget.service.removeListener(_onServiceChanged);
    _zoomController.dispose();
    super.dispose();
  }

  // ----- Service callbacks --------------------------------------------------
  void _onServiceChanged() {
    if (mounted) setState(() {});
  }

  // ----- UI helpers ---------------------------------------------------------
  void _toggleDarkMode() => setState(() => _isDarkMode = !_isDarkMode);
  void _toggleAccessibility() => setState(() => _largeText = !_largeText);
  void _toggleShortcutOverlay() =>
      setState(() => _showHelpOverlay = !_showHelpOverlay);
  void _togglePerformanceOverlay() =>
      setState(() => _showPerformanceOverlay = !_showPerformanceOverlay);

  void _snack(String message, {SnackBarAction? action}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), action: action),
    );
  }

  void _notImplemented(String feature) => _snack('$feature is not implemented yet.');

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hiro Garden Editor - Help & About'),
        content: const Text(
          '- Use the top-bar icons for common actions.\n'
          '- Keyboard shortcuts are listed in the shortcut overlay (press ?).\n'
          '- Settings can be accessed via the gear icon.\n'
          '- Export a PNG screenshot with the camera icon.\n'
          '- Undo/Redo history is available in the history panel.\n'
          '- For more information visit the documentation site.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showSettingsPanel() {
    showModalBottomSheet(
      context: context,
      builder: (_) {
        return StatefulBuilder(builder: (ctx, setStateModal) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SwitchListTile(
                  title: const Text('Grid-snap'),
                  value: widget.service.gridSnapEnabled,
                  onChanged: (v) => setStateModal(() {
                    widget.service.toggleGridSnap();
                  }),
                ),
                SwitchListTile(
                  title: const Text('Multi-select'),
                  value: widget.service.multiSelectEnabled,
                  onChanged: (v) => setStateModal(() {
                    widget.service.toggleMultiSelectMode();
                  }),
                ),
                ListTile(
                  title: const Text('Animation speed'),
                  trailing: DropdownButton<double>(
                    value: widget.service.animationSpeed,
                    items: const [
                      DropdownMenuItem(value: 0.5, child: Text('Slow')),
                      DropdownMenuItem(value: 1.0, child: Text('Normal')),
                      DropdownMenuItem(value: 2.0, child: Text('Fast')),
                    ],
                    onChanged: (v) => setStateModal(() {
                      if (v != null) widget.service.animationSpeed = v;
                    }),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  icon: const Icon(Icons.close),
                  label: const Text('Close'),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  // ----- Capture / export ---------------------------------------------------
  /// Renders the canvas area to PNG bytes.
  Future<Uint8List?> _capturePngBytes() async {
    final renderObject = _screenshotKey.currentContext?.findRenderObject();
    if (renderObject is! RenderRepaintBoundary) return null;
    final pixelRatio = MediaQuery.of(context).devicePixelRatio;
    final image = await renderObject.toImage(pixelRatio: pixelRatio);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    if (byteData == null) return null;
    return byteData.buffer
        .asUint8List(byteData.offsetInBytes, byteData.lengthInBytes);
  }

  Future<void> _captureScreenshot() async {
    final bytes = await _capturePngBytes();
    if (bytes == null) return;
    final dir = await getTemporaryDirectory();
    final file = await File(
            '${dir.path}/hiro_screenshot_${DateTime.now().millisecondsSinceEpoch}.png')
        .writeAsBytes(bytes);
    _snack(
      'Screenshot saved to ${file.path}',
      action: SnackBarAction(
        label: 'Open',
        onPressed: () => openFile(file.path),
      ),
    );
    // Placeholder for share - uncomment when share_plus is added.
    // await Share.shareXFiles([XFile(file.path)], text: 'Hiro garden screenshot');
  }

  /// Builds a one-page PDF containing a snapshot of the garden.
  Future<pw.Document?> _buildGardenPdf() async {
    final bytes = await _capturePngBytes();
    if (bytes == null) return null;
    final doc = pw.Document();
    final image = pw.MemoryImage(bytes);
    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4.landscape,
        build: (_) => pw.Center(
          child: pw.Image(image, fit: pw.BoxFit.contain),
        ),
      ),
    );
    return doc;
  }

  Future<void> _exportPdf() async {
    final doc = await _buildGardenPdf();
    if (doc == null) {
      _snack('Nothing to export.');
      return;
    }
    final dir = await getTemporaryDirectory();
    final file = await File(
            '${dir.path}/hiro_garden_${DateTime.now().millisecondsSinceEpoch}.pdf')
        .writeAsBytes(await doc.save());
    _snack(
      'PDF saved to ${file.path}',
      action: SnackBarAction(
        label: 'Open',
        onPressed: () => openFile(file.path),
      ),
    );
  }

  Future<void> _printGarden() async {
    final doc = await _buildGardenPdf();
    if (doc == null) {
      _snack('Nothing to print.');
      return;
    }
    await Printing.layoutPdf(onLayout: (_) async => doc.save());
  }

  // Helper to open a file with the default OS program.
  Future<void> openFile(String path) async {
    if (Platform.isWindows) {
      await Process.run('cmd', ['/c', 'start', '', path]);
    } else if (Platform.isMacOS) {
      await Process.run('open', [path]);
    } else if (Platform.isLinux) {
      await Process.run('xdg-open', [path]);
    }
    // On Android/iOS use the open_filex package if you need this.
  }

  // ----- Placeholders for features that still need implementing -------------
  // These were referenced in the app bar but never defined, which caused the
  // "getter '_xxx' isn't defined" errors. Replace the bodies as you build them.
  void _importJson() => _notImplemented('Import JSON');
  void _exportJson() => _notImplemented('Export JSON');
  void _showCollaborationDialog() => _notImplemented('Live collaboration');
  void _showNodePalettePanel() => _notImplemented('Node palettes');
  void _autoLayout() => _notImplemented('Auto-layout');
  void _exportSvg() => _notImplemented('Export SVG');
  void _showThemeEditor() => _notImplemented('Theme editor');
  void _showShortcutEditor() => _notImplemented('Shortcut editor');

  // ----- Batch actions ------------------------------------------------------
  void _duplicateSelection() => widget.service.duplicateSelectedNodes();
  void _moveSelectionToFront() => widget.service.moveSelectionToFront();
  void _moveSelectionToBack() => widget.service.moveSelectionToBack();

  // ----- Undo/Redo history panel -------------------------------------------
  void _openHistoryPanel() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) {
        final history = widget.service.undoRedoHistory; // assumed List<String>
        return SizedBox(
          height: MediaQuery.of(context).size.height * 0.6,
          child: ListView.builder(
            itemCount: history.length,
            itemBuilder: (ctx, i) => ListTile(
              title: Text(history[i]),
              onTap: () {
                widget.service.jumpToHistory(i);
                Navigator.of(ctx).pop();
              },
            ),
          ),
        );
      },
    );
  }

  // ----- Build --------------------------------------------------------------
  @override
  Widget build(BuildContext context) {
    final systemTheme = Theme.of(context);
    final isDark = _isDarkMode || systemTheme.brightness == Brightness.dark;
    // HiroTheme has no `lightTheme` member; falling back to the default light theme.
    // Replace ThemeData.light() with whatever light theme your hiro_theme.dart defines.
    final themeData = isDark ? HiroTheme.darkTheme : ThemeData.light();

    final zoomScale = _zoomController.value.getMaxScaleOnAxis();
    final selectionCount = widget.service.selectedNodes.length;
    final isSaved = widget.service.isSaved;

    return Theme(
      data: themeData,
      // Builder so that Theme.of(context) below resolves to `themeData`.
      child: Builder(builder: (context) {
        final theme = Theme.of(context);
        final mq = MediaQuery.of(context);

        return MediaQuery(
          data: mq.copyWith(
            textScaler: _largeText ? const TextScaler.linear(1.3) : mq.textScaler,
          ),
          child: Scaffold(
            key: _scaffoldKey,
            appBar: AppBar(
              title: const Text('Hiro Garden'),
              actions: [
                IconButton(
                  tooltip: 'Undo',
                  icon: const Icon(Icons.undo),
                  onPressed: widget.service.undo,
                ),
                IconButton(
                  tooltip: 'Redo',
                  icon: const Icon(Icons.redo),
                  onPressed: widget.service.redo,
                ),
                IconButton(
                  tooltip: 'Zoom In',
                  icon: const Icon(Icons.zoom_in),
                  onPressed: () =>
                      _zoomController.value = _zoomController.value.scaled(1.2),
                ),
                IconButton(
                  tooltip: 'Zoom Out',
                  icon: const Icon(Icons.zoom_out),
                  onPressed: () =>
                      _zoomController.value = _zoomController.value.scaled(0.8),
                ),
                IconButton(
                  tooltip: 'Fit to Content',
                  icon: const Icon(Icons.fit_screen),
                  onPressed: () => _zoomController.value = Matrix4.identity(),
                ),
                IconButton(
                  tooltip: 'Multi-select',
                  icon: Icon(
                    Icons.select_all,
                    color: widget.service.multiSelectEnabled
                        ? theme.colorScheme.secondary
                        : null,
                  ),
                  onPressed: widget.service.toggleMultiSelectMode,
                ),
                IconButton(
                  tooltip: 'Grid-snap',
                  icon: Icon(
                    Icons.grid_on,
                    color: widget.service.gridSnapEnabled
                        ? theme.colorScheme.secondary
                        : null,
                  ),
                  onPressed: widget.service.toggleGridSnap,
                ),
                IconButton(
                  tooltip: 'Screenshot',
                  icon: const Icon(Icons.camera_alt),
                  onPressed: _captureScreenshot,
                ),
                IconButton(
                  tooltip: 'History',
                  icon: const Icon(Icons.history),
                  onPressed: _openHistoryPanel,
                ),
                IconButton(
                  tooltip: 'Settings',
                  icon: const Icon(Icons.settings),
                  onPressed: _showSettingsPanel,
                ),
                IconButton(
                  tooltip: 'Help / About',
                  icon: const Icon(Icons.help_outline),
                  onPressed: _showHelpDialog,
                ),
                IconButton(
                  tooltip: isDark ? 'Light mode' : 'Dark mode',
                  icon: Icon(isDark ? Icons.wb_sunny : Icons.nightlight_round),
                  onPressed: _toggleDarkMode,
                ),
                IconButton(
                  tooltip: 'Shortcuts',
                  icon: const Icon(Icons.keyboard),
                  onPressed: _toggleShortcutOverlay,
                ),
                IconButton(
                  tooltip: 'Performance',
                  icon: const Icon(Icons.speed),
                  onPressed: _togglePerformanceOverlay,
                ),
                // ----- PDF & Print -----
                IconButton(
                  tooltip: 'Export PDF',
                  icon: const Icon(Icons.picture_as_pdf),
                  onPressed: _exportPdf,
                ),
                IconButton(
                  tooltip: 'Print',
                  icon: const Icon(Icons.print),
                  onPressed: _printGarden,
                ),
                // ----- Other feature icons -----
                IconButton(
                  tooltip: 'Import JSON',
                  icon: const Icon(Icons.upload_file),
                  onPressed: _importJson,
                ),
                IconButton(
                  tooltip: 'Export JSON',
                  icon: const Icon(Icons.download),
                  onPressed: _exportJson,
                ),
                IconButton(
                  tooltip: 'Live Collaboration',
                  icon: const Icon(Icons.people),
                  onPressed: _showCollaborationDialog,
                ),
                IconButton(
                  tooltip: 'Node Palettes',
                  icon: const Icon(Icons.palette),
                  onPressed: _showNodePalettePanel,
                ),
                IconButton(
                  tooltip: 'Auto-layout',
                  icon: const Icon(Icons.auto_fix_high),
                  onPressed: _autoLayout,
                ),
                IconButton(
                  tooltip: 'Export SVG',
                  icon: const Icon(Icons.save_alt),
                  onPressed: _exportSvg,
                ),
                IconButton(
                  tooltip: 'Theme editor',
                  icon: const Icon(Icons.color_lens),
                  onPressed: _showThemeEditor,
                ),
                IconButton(
                  tooltip: 'Shortcut editor',
                  icon: const Icon(Icons.edit),
                  onPressed: _showShortcutEditor,
                ),
                IconButton(
                  tooltip: 'Accessibility (large text)',
                  icon: Icon(
                    Icons.accessibility,
                    color: _largeText ? theme.colorScheme.secondary : null,
                  ),
                  onPressed: _toggleAccessibility,
                ),
              ],
            ),
            drawer: const Drawer(
                // You may add navigation items here.
                ),
            body: Stack(
              children: [
                // Main canvas area wrapped for screenshot capability.
                RepaintBoundary(
                  key: _screenshotKey,
                  child: InteractiveViewer(
                    transformationController: _zoomController,
                    constrained: false,
                    // NOTE: `transformationController` was removed from
                    // NeuralCanvas - it isn't a parameter of that widget.
                    // The InteractiveViewer above already owns the controller.
                    child: NeuralCanvas(
                      service: widget.service,
                      onSelectSynapse: (_) {}, // required by NeuralCanvas; hook up as needed
                      onOpenTemplateSelector: () {}, // required by NeuralCanvas; hook up as needed
                    ),
                  ),
                ),
                // Mini-map overlay (bottom-left)
                Positioned(
                  left: 8,
                  bottom: 40, // keep clear of the status bar
                  child: MiniMap(
                    service: widget.service,
                    zoomController: _zoomController,
                  ),
                ),
                // Batch-action toolbar (shown when multi-select active)
                if (widget.service.multiSelectEnabled)
                  Positioned(
                    bottom: 32, // sits just above the status bar
                    left: 0,
                    right: 0,
                    child: Material(
                      elevation: 4,
                      color: theme.canvasColor,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          IconButton(
                            tooltip: 'Delete selection',
                            icon: const Icon(Icons.delete),
                            onPressed: widget.service.deleteSelectedNodes,
                          ),
                          IconButton(
                            tooltip: 'Change hue',
                            icon: const Icon(Icons.format_color_fill),
                            onPressed: widget.service.changeHueOfSelection,
                          ),
                          IconButton(
                            tooltip: 'Duplicate selection',
                            icon: const Icon(Icons.copy_all),
                            onPressed: _duplicateSelection,
                          ),
                          IconButton(
                            tooltip: 'Move to front',
                            icon: const Icon(Icons.vertical_align_top),
                            onPressed: _moveSelectionToFront,
                          ),
                          IconButton(
                            tooltip: 'Move to back',
                            icon: const Icon(Icons.vertical_align_bottom),
                            onPressed: _moveSelectionToBack,
                          ),
                          IconButton(
                            tooltip: 'Clear selection',
                            icon: const Icon(Icons.clear_all),
                            onPressed: widget.service.clearSelection,
                          ),
                        ],
                      ),
                    ),
                  ),
                // Status bar (bottom) - always visible.
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    color: (theme.bottomAppBarTheme.color ??
                            theme.colorScheme.surface)
                        .withValues(alpha: 0.9),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Zoom: ${zoomScale.toStringAsFixed(2)}x'),
                        Text('Selected: $selectionCount'),
                        Text(isSaved ? 'Saved' : 'Unsaved'),
                      ],
                    ),
                  ),
                ),
                // Shortcut overlay (full-screen translucent)
                if (_showHelpOverlay)
                  Positioned.fill(
                    child: GestureDetector(
                      onTap: _toggleShortcutOverlay,
                      child: Container(
                        color: Colors.black54,
                        child: const Center(
                          child: Card(
                            margin: EdgeInsets.all(32),
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                'Keyboard shortcuts:\n'
                                '- Ctrl+Z / Ctrl+Y : Undo / Redo\n'
                                '- Ctrl+F : Find / Search\n'
                                '- ? : Toggle this help overlay\n'
                                '- D : Toggle dark mode\n'
                                '- S : Screenshot\n',
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                // Performance overlay (top-right corner)
                if (_showPerformanceOverlay)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Card(
                      color: Colors.black87,
                      child: Padding(
                        padding: const EdgeInsets.all(4.0),
                        child: Text(
                          'FPS: ${_fps.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      }),
    );
  }
}