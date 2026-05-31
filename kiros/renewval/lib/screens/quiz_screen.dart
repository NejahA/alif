import 'package:flutter/material.dart';
import 'dart:math';
import '../models/flashcard.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_linkify/flutter_linkify.dart';

class QuizScreen extends StatefulWidget {
  final List<Flashcard> cards;
  final String title;

  const QuizScreen({Key? key, required this.cards, required this.title}) : super(key: key);

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFront = true;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  void _flipCard() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    _isFront = !_isFront;
  }

  Future<void> _launchUrl(String url) async {
    final Uri uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch $url')),
        );
      }
    }
  }

  void _previousCard() {
    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
        _isFront = true;
      });
      _controller.reset();
    }
  }

  void _nextCard(int reviewLevel) {
    // Determine spaced repetition value (stub logic)
    widget.cards[_currentIndex].reviewLevel = reviewLevel;

    if (_currentIndex < widget.cards.length - 1) {
      setState(() {
        _currentIndex++;
        _isFront = true;
      });
      _controller.reset();
    } else {
      // Quiz finished
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: const Color(0xFF2A2A3D),
          title: Text('Deck Completed!', style: TextStyle(color: Colors.white)),
          content: Text('You have reviewed all cards in this deck.', style: TextStyle(color: Colors.white70)),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Back to Home', style: TextStyle(color: Color(0xFFE94057))),
            ),
          ],
        ),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.cards.isEmpty) return const Scaffold(body: Center(child: Text("No Cards")));

    final card = widget.cards[_currentIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF1E1E2C),
      appBar: AppBar(
        title: Text('${widget.title} (${_currentIndex + 1}/${widget.cards.length})', style: GoogleFonts.outfit()),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Bar
            LinearProgressIndicator(
              value: (_currentIndex + 1) / widget.cards.length,
              backgroundColor: Colors.white12,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFE94057)),
            ),
            const SizedBox(height: 40),
            
            // Card Area
            Expanded(
              child: GestureDetector(
                onTap: _flipCard,
                onHorizontalDragEnd: (details) {
                  if (details.primaryVelocity! < -300) {
                    // Swipe Left (Next)
                    _nextCard(1); // Using default 'Medium' rating
                  } else if (details.primaryVelocity! > 300) {
                    // Swipe Right (Back)
                    _previousCard();
                  }
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: AnimatedBuilder(
                    animation: _animation,
                    builder: (context, child) {
                      final angle = _animation.value * pi;
                      final transform = Matrix4.identity()
                        ..setEntry(3, 2, 0.001)
                        ..rotateY(angle);

                      return Transform(
                        transform: transform,
                        alignment: Alignment.center,
                        child: angle < pi / 2
                            ? _buildFrontCard(card)
                            : Transform(
                                transform: Matrix4.identity()..rotateY(pi),
                                alignment: Alignment.center,
                                child: _buildBackCard(card),
                              ),
                      );
                    },
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 40),
            
            // Controls (Only visible if back is shown)
            AnimatedOpacity(
              opacity: !_isFront ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: Padding(
                padding: const EdgeInsets.only(bottom: 40.0, left: 24, right: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildFeedbackButton('Forgot', Colors.redAccent, () => _nextCard(0)),
                    _buildFeedbackButton('Hard', Colors.orangeAccent, () => _nextCard(1)),
                    _buildFeedbackButton('Easy', Colors.greenAccent, () => _nextCard(2)),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildFrontCard(Flashcard card) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF2A2A3D),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black26, blurRadius: 15, offset: Offset(0, 10)),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Question', style: GoogleFonts.inter(color: Colors.white54, fontSize: 16)),
            const SizedBox(height: 20),
            Text(
              card.question,
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 60),
            Text('Tap to flip', style: GoogleFonts.inter(color: Colors.white38, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildBackCard(Flashcard card) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF2E2E48), // Slightly different shade for the back
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE94057).withOpacity(0.5), width: 2),
        boxShadow: [
          BoxShadow(color: Colors.black26, blurRadius: 15, offset: Offset(0, 10)),
        ],
      ),
      padding: const EdgeInsets.all(32),
      child: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Answer', style: GoogleFonts.inter(color: Colors.white54, fontSize: 16)),
              const SizedBox(height: 20),
              Linkify(
                text: card.answer,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(color: Colors.white, fontSize: 20),
                linkStyle: const TextStyle(color: Color(0xFFE94057), decoration: TextDecoration.underline),
                onOpen: (link) => _launchUrl(link.url),
              ),
              if (card.wikipediaUrl != null) ...[
                const SizedBox(height: 20),
                TextButton.icon(
                  onPressed: () => _launchUrl(card.wikipediaUrl!),
                  icon: const Icon(Icons.open_in_new, size: 18, color: Colors.blueAccent),
                  label: Text(
                    'Read on Wikipedia',
                    style: GoogleFonts.inter(color: Colors.blueAccent, fontWeight: FontWeight.w600),
                  ),
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.blueAccent.withOpacity(0.1),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
              if (card.codeSnippet != null) ...[
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E2C),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    card.codeSnippet!,
                    style: const TextStyle(fontFamily: 'monospace', color: Colors.greenAccent, fontSize: 14),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeedbackButton(String text, Color color, VoidCallback onTap) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withOpacity(0.2),
        foregroundColor: color,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
      onPressed: !_isFront ? onTap : null, // Disable if front is shown
      child: Text(text, style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
    );
  }
}
