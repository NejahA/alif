import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import '../models/wiki_model.dart';
import '../api_service.dart';

class ArticleScreen extends StatefulWidget {
  final WikiSummary article;

  const ArticleScreen({super.key, required this.article});

  @override
  State<ArticleScreen> createState() => ArticleScreenState();
}

class ArticleScreenState extends State<ArticleScreen> {
  final ApiService _apiService = ApiService();
  String? _fullContent;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchFullArticle();
  }

  Future<void> _fetchFullArticle() async {
    final content = await _apiService.fetchFullHtmlContent(widget.article.title);
    if (mounted) {
      setState(() {
        _fullContent = content;
        _isLoading = false;
      });
    }
  }

  Future<void> _launchUrl(String url) async {
    final Uri uri = Uri.parse(url);
    try {
      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
        throw 'Could not launch $url';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111111),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.article.displayTitle,
              style: GoogleFonts.outfit(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            if (widget.article.thumbnailSource != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: CachedNetworkImage(
                  imageUrl: widget.article.thumbnailSource!,
                  width: double.infinity,
                  height: 250,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(height: 20),
            ],
            Linkify(
              text: widget.article.extract ?? '',
              onOpen: (link) => _launchUrl(link.url),
              style: GoogleFonts.inter(
                fontSize: 18,
                fontStyle: FontStyle.italic,
                color: Colors.white70,
                height: 1.6,
              ),
              linkStyle: const TextStyle(color: Colors.blueAccent),
            ),
            const SizedBox(height: 30),
            const Divider(color: Colors.white24, thickness: 1),
            const SizedBox(height: 20),
            if (_isLoading)
              const Center(child: CircularProgressIndicator(color: Colors.white))
            else if (_fullContent != null)
              Html(
                data: _fullContent,
                style: {
                  "body": Style(
                    color: Colors.white,
                    fontFamily: 'Inter',
                    fontSize: FontSize(16.0),
                    lineHeight: LineHeight(1.6),
                  ),
                  "a": Style(
                    color: Colors.blueAccent,
                    textDecoration: TextDecoration.none,
                  ),
                  "h2": Style(
                    color: Colors.white,
                    fontSize: FontSize(24.0),
                    margin: Margins.only(top: 24, bottom: 12),
                  ),
                  "h3": Style(
                    color: Colors.white,
                    fontSize: FontSize(20.0),
                    margin: Margins.only(top: 20, bottom: 10),
                  ),
                },
                onLinkTap: (url, attributes, element) {
                  if (url != null) {
                    if (url.startsWith('/wiki/')) {
                      url = 'https://en.wikipedia.org$url';
                    }
                    _launchUrl(url);
                  }
                },
              )
            else
              Center(
                child: Text(
                  'Failed to load full content.',
                  style: GoogleFonts.inter(color: Colors.white54),
                ),
              ),
            const SizedBox(height: 40),
            Center(
              child: ElevatedButton.icon(
                onPressed: () {
                  if (widget.article.contentUrl != null) {
                    _launchUrl(widget.article.contentUrl!);
                  }
                },
                icon: const Icon(Icons.open_in_new),
                label: const Text('Read on Wikipedia'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent.withOpacity(0.2),
                  foregroundColor: Colors.blueAccent,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
