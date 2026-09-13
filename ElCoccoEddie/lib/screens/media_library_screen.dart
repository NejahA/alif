import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/media_storage.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class MediaLibraryScreen extends StatefulWidget {
  const MediaLibraryScreen({super.key});

  @override
  State<MediaLibraryScreen> createState() => _MediaLibraryScreenState();
}

class _MediaLibraryScreenState extends State<MediaLibraryScreen> {
  late Future<List<SavedMedia>> _mediaFuture;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _mediaType = 'ALL';
  String _sortMode = 'NEWEST';

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _mediaFuture = listSavedMedia();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _deleteMedia(SavedMedia media) async {
    final deleted = await deleteSavedMedia(media);
    if (!mounted) return;
    setState(_reload);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(deleted ? 'MEDIA DELETED' : 'MEDIA COULD NOT BE DELETED')),
    );
  }

  Future<void> _deleteFilteredMedia() async {
    final allMedia = await _mediaFuture;
    final matching = allMedia
        .where((item) => item.name.toLowerCase().contains(_searchQuery))
        .where((item) => _mediaType == 'ALL' || (_mediaType == 'VIDEOS' ? item.isVideo : !item.isVideo))
        .toList();
    if (!mounted || matching.isEmpty) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('DELETE MEDIA?'),
        content: Text('Remove ${matching.length} matching capture${matching.length == 1 ? '' : 's'}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('CANCEL')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('DELETE')),
        ],
      ),
    );
    if (confirmed != true) return;
    for (final media in matching) {
      await deleteSavedMedia(media);
    }
    if (!mounted) return;
    setState(_reload);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('MATCHING MEDIA DELETED')));
  }

  Future<void> _previewPhoto(SavedMedia media) async {
    final bytes = await readSavedMedia(media);
    if (!mounted || bytes == null) return;
    await showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: IlluminatiTheme.voidDark,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.memory(bytes, fit: BoxFit.contain),
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('CLOSE')),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: Text(
            'MEDIA VAULT',
            style: GoogleFonts.cinzel(color: IlluminatiTheme.sacredGold, fontSize: 18),
          ),
          actions: [
            IconButton(
              tooltip: 'Reset media filters',
              onPressed: () => setState(() {
                _searchController.clear();
                _searchQuery = '';
                _mediaType = 'ALL';
                _sortMode = 'NEWEST';
              }),
              icon: const Icon(Icons.filter_alt_off, color: IlluminatiTheme.sacredGold),
            ),
            IconButton(
              tooltip: 'Delete filtered media',
              onPressed: _deleteFilteredMedia,
              icon: const Icon(Icons.delete_sweep, color: IlluminatiTheme.crimsonSeal),
            ),
            IconButton(
              tooltip: 'Refresh media vault',
              onPressed: () => setState(_reload),
              icon: const Icon(Icons.refresh, color: IlluminatiTheme.sacredGold),
            ),
          ],
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: TextField(
                controller: _searchController,
                onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
                style: GoogleFonts.orbitron(color: Colors.white, fontSize: 11),
                decoration: InputDecoration(
                  hintText: 'SEARCH SAVED MEDIA',
                  prefixIcon: const Icon(Icons.search, color: IlluminatiTheme.sacredGold),
                  filled: true,
                  fillColor: IlluminatiTheme.slateCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Text('MEDIA TYPE', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  const Spacer(),
                  DropdownButton<String>(
                    value: _mediaType,
                    underline: const SizedBox.shrink(),
                    dropdownColor: IlluminatiTheme.slateCard,
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 10),
                    onChanged: (value) => setState(() => _mediaType = value ?? _mediaType),
                    items: const [
                      DropdownMenuItem(value: 'ALL', child: Text('ALL')),
                      DropdownMenuItem(value: 'PHOTOS', child: Text('PHOTOS')),
                      DropdownMenuItem(value: 'VIDEOS', child: Text('VIDEOS')),
                    ],
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Text('SORT BY', style: TextStyle(color: Colors.white60, fontSize: 10)),
                  const Spacer(),
                  DropdownButton<String>(
                    value: _sortMode,
                    underline: const SizedBox.shrink(),
                    dropdownColor: IlluminatiTheme.slateCard,
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 10),
                    onChanged: (value) => setState(() => _sortMode = value ?? _sortMode),
                    items: const [
                      DropdownMenuItem(value: 'NEWEST', child: Text('NEWEST')),
                      DropdownMenuItem(value: 'OLDEST', child: Text('OLDEST')),
                      DropdownMenuItem(value: 'NAME', child: Text('NAME')),
                      DropdownMenuItem(value: 'TYPE', child: Text('TYPE')),
                      DropdownMenuItem(value: 'SIZE', child: Text('SIZE')),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: FutureBuilder<List<SavedMedia>>(
                future: _mediaFuture,
                builder: (context, snapshot) {
                  if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                  final allMedia = snapshot.data!;
                  final totalBytes = allMedia.fold<int>(0, (sum, item) => sum + item.sizeBytes);
                  final photoCount = allMedia.where((item) => !item.isVideo).length;
                  final videoCount = allMedia.where((item) => item.isVideo).length;
                  final media = snapshot.data!
                      .where((item) => item.name.toLowerCase().contains(_searchQuery))
                      .where((item) => _mediaType == 'ALL' || (_mediaType == 'VIDEOS' ? item.isVideo : !item.isVideo))
                      .toList();
                  media.sort((left, right) {
                    switch (_sortMode) {
                      case 'OLDEST':
                        return left.name.compareTo(right.name);
                      case 'NAME':
                        return left.name.toLowerCase().compareTo(right.name.toLowerCase());
                      case 'TYPE':
                        return (left.isVideo ? 1 : 0).compareTo(right.isVideo ? 1 : 0);
                      case 'SIZE':
                        return right.sizeBytes.compareTo(left.sizeBytes);
                      default:
                        return right.name.compareTo(left.name);
                    }
                  });
                  if (media.isEmpty) {
                    return const Center(
                      child: Text('NO MATCHING CAPTURES', style: TextStyle(color: Colors.white60)),
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: media.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Row(
                              children: [
                                const Icon(Icons.storage, color: IlluminatiTheme.sacredGold),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    '$photoCount PHOTOS  •  $videoCount VIDEOS\n${_formatSize(totalBytes)} USED  •  ${media.length} SHOWN',
                                    style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10, height: 1.6),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }
                      final item = media[index - 1];
                      return Card(
                        child: ListTile(
                          onTap: item.isVideo ? null : () => _previewPhoto(item),
                          leading: Icon(
                            item.isVideo ? Icons.video_file : Icons.image,
                            color: item.isVideo ? IlluminatiTheme.crimsonSeal : IlluminatiTheme.cyberCyan,
                          ),
                          title: Text(item.name, style: GoogleFonts.orbitron(fontSize: 10)),
                          subtitle: Text('${item.isVideo ? 'VIDEO' : 'PHOTO'}  •  ${_formatSize(item.sizeBytes)}'),
                          trailing: PopupMenuButton<String>(
                            onSelected: (action) async {
                              if (action == 'copy') {
                                await Clipboard.setData(ClipboardData(text: item.path));
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('MEDIA PATH COPIED')),
                                  );
                                }
                              } else if (action == 'delete') {
                                await _deleteMedia(item);
                              }
                            },
                            itemBuilder: (_) => const [
                              PopupMenuItem(value: 'copy', child: Text('COPY PATH')),
                              PopupMenuItem(value: 'delete', child: Text('DELETE')),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
