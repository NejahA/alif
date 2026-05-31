import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

void main() {
  runApp(const MaterialApp(
    title: 'READER',
    debugShowCheckedModeBanner: false,
    home: PdfApp(),
  ));
}

class PdfApp extends StatefulWidget {
  const PdfApp({super.key});

  @override
  State<PdfApp> createState() => _PdfAppState();
}

class _PdfAppState extends State<PdfApp> {
  String? _filePath;
  bool _isLoading = false;

  final GlobalKey<SfPdfViewerState> _pdfViewerKey = GlobalKey();
  late PdfViewerController _pdfViewerController;

  int _currentPage = 1;
  int _totalPages = 0;

  String? _currentWord;
  String? _currentDefinition;

  String _selectedLanguageCode = 'ar';
  final Map<String, String> _languages = {
    'ar': 'العربية',
    'en': 'English',
    'fr': 'Français',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'hi': 'हिन्दी',
  };

  Map<String, List<int>> _bookmarks = {};

  // Velocity tracking
  double _lastScrollPosition = 0;
  DateTime _lastScrollTime = DateTime.now();
  bool _isManualScrolling = false;

  @override
  void initState() {
    super.initState();
    _pdfViewerController = PdfViewerController();
    _loadLastFile();
    _loadBookmarks();
  }

  Future<void> _loadLastFile() async {
    final prefs = await SharedPreferences.getInstance();
    final lastPath = prefs.getString('last_pdf_path');
    if (lastPath != null && File(lastPath).existsSync()) {
      setState(() => _filePath = lastPath);
    }
  }

  Future<void> _saveLastFile(String path) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('last_pdf_path', path);
  }

  Future<void> _loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final json = prefs.getString('pdf_bookmarks');
    if (json != null) {
      final decoded = jsonDecode(json) as Map<String, dynamic>;
      setState(() {
        _bookmarks = decoded.map((k, v) => MapEntry(k, (v as List).cast<int>()));
      });
    }
  }

  Future<void> _saveBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('pdf_bookmarks', jsonEncode(_bookmarks));
  }

  Future<void> _pickAndLoadPdf() async {
    setState(() => _isLoading = true);

    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result != null && result.files.single.path != null) {
        final path = result.files.single.path!;
        setState(() {
          _filePath = path;
          _currentPage = 1;
          _totalPages = 0;
          _currentDefinition = null;
        });
        await _saveLastFile(path);
      }
    } catch (e) {
      debugPrint("File picker error: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error opening file: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ────────────────────────────────────────────────
  // Bookmark functions
  // ────────────────────────────────────────────────

  Future<void> _toggleBookmark() async {
    if (_filePath == null || _currentPage < 1) return;

    setState(() {
      _bookmarks.putIfAbsent(_filePath!, () => []);
      final pages = _bookmarks[_filePath!]!;

      if (pages.contains(_currentPage)) {
        pages.remove(_currentPage);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Bookmark removed from page $_currentPage')),
        );
      } else {
        pages.add(_currentPage);
        pages.sort();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Bookmark added at page $_currentPage')),
        );
      }
    });

    await _saveBookmarks();
  }

  Future<void> _showBookmarksDialog() async {
    if (_filePath == null || !_bookmarks.containsKey(_filePath!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No bookmarks for this document')),
      );
      return;
    }

    final pages = _bookmarks[_filePath!]!;

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bookmarks'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: pages.length,
            itemBuilder: (context, index) {
              final page = pages[index];
              return ListTile(
                leading: const Icon(Icons.bookmark),
                title: Text('Page $page'),
                trailing: IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () {
                    setState(() => pages.remove(page));
                    _saveBookmarks();
                    Navigator.pop(context);
                    _showBookmarksDialog();
                  },
                ),
                onTap: () {
                  _pdfViewerController.jumpToPage(page);
                  Navigator.pop(context);
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  // ────────────────────────────────────────────────
  // Dictionary function
  // ────────────────────────────────────────────────

  Future<void> _showWordMeaning(String selectedText) async {
    final trimmed = selectedText.trim();
    if (trimmed.isEmpty) return;

    String cleanWord = trimmed.split(RegExp(r'[\s;:{},.\-–—()[\]"""''!?]+')).firstWhere(
          (e) => e.isNotEmpty,
          orElse: () => "",
        );

    if (cleanWord.length < 2) return;

    String queryWord = (_selectedLanguageCode != 'ar') ? cleanWord.toLowerCase() : cleanWord;

    setState(() {
      _currentWord = cleanWord;
      _currentDefinition = null;
    });

    try {
      final uri = Uri.parse('https://freedictionaryapi.com/api/v1/entries/$_selectedLanguageCode/$queryWord');
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data['entries'] is List) {
          final entries = data['entries'] as List;
          for (var entry in entries) {
            final senses = entry['senses'] as List? ?? [];
            for (var sense in senses) {
              final def = sense['definition'] as String?;
              if (def != null && def.trim().isNotEmpty) {
                setState(() => _currentDefinition = def.trim());
                return;
              }
            }
          }
        }
      }

      setState(() {
        _currentDefinition = "تعريف غير موجود لـ «$cleanWord» في القاموس ${_languages[_selectedLanguageCode]}.";
      });
    } catch (e) {
      debugPrint("Dictionary error: $e");
      setState(() {
        _currentDefinition = "خطأ في الاتصال بخدمة القاموس.";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('READ PDF Viewer'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: DropdownButton<String>(
              value: _selectedLanguageCode,
              icon: const Icon(Icons.language, color: Colors.blueAccent),
              underline: Container(),
              onChanged: (newValue) {
                if (newValue == null) return;
                setState(() {
                  _selectedLanguageCode = newValue;
                  _currentDefinition = null;
                });
              },
              items: _languages.entries.map((e) => DropdownMenuItem(
                    value: e.key,
                    child: Text(e.value),
                  )).toList(),
            ),
          ),
          if (_filePath != null) ...[
            IconButton(
              icon: const Icon(Icons.bookmark_add),
              tooltip: 'Add Bookmark',
              onPressed: _toggleBookmark,
            ),
            IconButton(
              icon: const Icon(Icons.bookmarks),
              tooltip: 'Show Bookmarks',
              onPressed: _showBookmarksDialog,
            ),
            IconButton(
              icon: const Icon(Icons.folder_open),
              tooltip: 'Open PDF',
              onPressed: _pickAndLoadPdf,
            ),
          ],
        ],
      ),

      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _filePath == null
              ? GestureDetector(
                  onTap: _pickAndLoadPdf,
                  child: Container(
                    color: Colors.grey.shade50,
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(
                            Icons.picture_as_pdf_outlined,
                            size: 80,
                            color: Colors.blueGrey,
                          ),
                          SizedBox(height: 24),
                          Text(
                            'Tap here to open a PDF file',
                            style: TextStyle(
                              fontSize: 20,
                              color: Colors.blueGrey,
                              fontWeight: FontWeight.w500,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'or use the folder icon in the top bar',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: Stack(
                        children: [
                          GestureDetector(
                            onVerticalDragStart: (details) {
                              _isManualScrolling = true;
                              _lastScrollPosition = details.globalPosition.dy;
                              _lastScrollTime = DateTime.now();
                            },
                            onVerticalDragUpdate: (details) {
                              if (_isManualScrolling) {
                                _lastScrollPosition = details.globalPosition.dy;
                                _lastScrollTime = DateTime.now();
                              }
                            },
                            onVerticalDragEnd: (details) {
                              if (!_isManualScrolling) return;
                              
                              // Get velocity from the drag end event
                              final velocity = details.velocity.pixelsPerSecond.dy.abs();
                              
                              // Calculate pages to scroll based on velocity
                              // Higher velocity = more pages
                              int pagesToJump = 1;
                              
                              if (velocity > 5000) {
                                pagesToJump = 15;
                              } else if (velocity > 3500) {
                                pagesToJump = 10;
                              } else if (velocity > 2500) {
                                pagesToJump = 7;
                              } else if (velocity > 1500) {
                                pagesToJump = 5;
                              } else if (velocity > 800) {
                                pagesToJump = 3;
                              } else if (velocity > 400) {
                                pagesToJump = 2;
                              }
                              
                              // Determine direction
                              final isScrollingDown = details.velocity.pixelsPerSecond.dy > 0;
                              
                              // Calculate target page
                              int targetPage = _currentPage;
                              if (isScrollingDown) {
                                targetPage = _currentPage - pagesToJump;
                              } else {
                                targetPage = _currentPage + pagesToJump;
                              }
                              
                              // Clamp to valid range
                              if (targetPage < 1) targetPage = 1;
                              if (targetPage > _totalPages && _totalPages > 0) targetPage = _totalPages;
                              
                              // Jump to page if we calculated a different page
                              if (targetPage != _currentPage && pagesToJump > 1) {
                                _pdfViewerController.jumpToPage(targetPage);
                              }
                              
                              _isManualScrolling = false;
                            },
                            child: SfPdfViewer.file(
                              File(_filePath!),
                              key: _pdfViewerKey,
                              controller: _pdfViewerController,
                              enableTextSelection: true,
                              pageLayoutMode: PdfPageLayoutMode.continuous,
                              scrollDirection: PdfScrollDirection.vertical,
                              pageSpacing: 4.0,
                              initialZoomLevel: 1.0,
                              onTextSelectionChanged: (details) {
                                if (details.selectedText != null &&
                                    details.selectedText!.trim().isNotEmpty) {
                                  _showWordMeaning(details.selectedText!);
                                }
                              },
                              onPageChanged: (details) {
                                setState(() => _currentPage = details.newPageNumber);
                              },
                              onDocumentLoaded: (details) {
                                setState(() => _totalPages = details.document.pages.count);
                              },
                            ),
                          ),
                          Positioned(
                            bottom: 12,
                            right: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.65),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '$_currentPage / $_totalPages',
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (_currentDefinition != null)
                      SafeArea(
                        top: false,
                        bottom: true,
                        child: Container(
                          width: double.infinity,
                          color: Colors.black87,
                          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    (_currentWord ?? '').toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.blueAccent,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                                    onPressed: () => setState(() => _currentDefinition = null),
                                    padding: EdgeInsets.zero,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _currentDefinition!,
                                style: const TextStyle(color: Colors.white, fontSize: 13.5),
                                maxLines: 5,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
    );
  }

  @override
  void dispose() {
    _pdfViewerController.dispose();
    super.dispose();
  }
}