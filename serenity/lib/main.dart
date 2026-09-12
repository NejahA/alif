import 'package:flutter/material.dart';

void main() => runApp(const SerenityApp());

class SerenityApp extends StatelessWidget {
  const SerenityApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF6F4EE),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFEE6A4A)),
        fontFamily: 'Arial',
      ),
      home: const SerenityHomePage(),
    );
  }
}

class SerenityHomePage extends StatefulWidget {
  const SerenityHomePage({super.key});

  @override
  State<SerenityHomePage> createState() => _SerenityHomePageState();
}

class _SerenityHomePageState extends State<SerenityHomePage> {
  int _selectedNav = 0;
  int _currentStep = 0;

  final List<_GuideStep> _steps = const [
    _GuideStep('01', 'Meet your editor', 'Learn where your files, panels, and terminal live.', Icons.space_dashboard_outlined, '4 min'),
    _GuideStep('02', 'Make it yours', 'Shape VS Code around the way your brain works.', Icons.tune_rounded, '6 min'),
    _GuideStep('03', 'Find your flow', 'A gentle tour of shortcuts that remove friction.', Icons.waves_rounded, '8 min'),
  ];

  void _advanceStep() => setState(() => _currentStep = (_currentStep + 1) % _steps.length);

  @override
  Widget build(BuildContext context) {
    final compact = MediaQuery.sizeOf(context).width < 760;
    return Scaffold(
      body: SafeArea(
        child: Row(
          children: [
            _NavigationRail(selectedIndex: _selectedNav, compact: compact, onSelected: (index) => setState(() => _selectedNav = index)),
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(compact ? 24 : 54, 34, compact ? 24 : 54, 44),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1180),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      _TopBar(compact: compact),
                      const SizedBox(height: 42),
                      _HeroSection(compact: compact, step: _steps[_currentStep], onContinue: _advanceStep),
                      const SizedBox(height: 42),
                      Text('A quiet place to start', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: const Color(0xFF1D2927), fontWeight: FontWeight.w700)),
                      const SizedBox(height: 18),
                      _GuideGrid(steps: _steps, activeIndex: _currentStep, compact: compact, onStepSelected: (index) => setState(() => _currentStep = index)),
                      const SizedBox(height: 34),
                      _BottomNote(compact: compact),
                    ]),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavigationRail extends StatelessWidget {
  const _NavigationRail({required this.selectedIndex, required this.compact, required this.onSelected});
  final int selectedIndex;
  final bool compact;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: compact ? 74 : 92,
      color: const Color(0xFF1D2927),
      child: Column(children: [
        const SizedBox(height: 28),
        Container(width: 40, height: 40, decoration: const BoxDecoration(color: Color(0xFFEE6A4A), shape: BoxShape.circle), child: const Icon(Icons.spa_rounded, color: Colors.white, size: 22)),
        const SizedBox(height: 54),
        _NavItem(icon: Icons.home_filled, label: 'Today', selected: selectedIndex == 0, onTap: () => onSelected(0)),
        _NavItem(icon: Icons.menu_book_rounded, label: 'Guide', selected: selectedIndex == 1, onTap: () => onSelected(1)),
        _NavItem(icon: Icons.bookmark_border_rounded, label: 'Saved', selected: selectedIndex == 2, onTap: () => onSelected(2)),
        const Spacer(),
        _NavItem(icon: Icons.settings_outlined, label: 'Settings', selected: selectedIndex == 3, onTap: () => onSelected(3)),
        const SizedBox(height: 22),
      ]),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.label, required this.selected, required this.onTap});
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7, horizontal: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 11),
          decoration: BoxDecoration(color: selected ? const Color(0xFF344541) : Colors.transparent, borderRadius: BorderRadius.circular(14)),
          child: Column(children: [
            Icon(icon, color: selected ? const Color(0xFFF3C98B) : const Color(0xFF9CAAA5), size: 21),
            const SizedBox(height: 5),
            Text(label, style: TextStyle(color: selected ? Colors.white : const Color(0xFF9CAAA5), fontSize: 10, fontWeight: FontWeight.w600)),
          ]),
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.compact});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      const Text('SATURDAY, SEPTEMBER 12', style: TextStyle(letterSpacing: 1.5, fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF75827D))),
      const Spacer(),
      if (!compact) const Text('Your progress  ', style: TextStyle(color: Color(0xFF75827D), fontSize: 12)),
      SizedBox(width: compact ? 52 : 86, child: const LinearProgressIndicator(value: .32, minHeight: 6, borderRadius: BorderRadius.all(Radius.circular(10)), backgroundColor: Color(0xFFE5E1D8), color: Color(0xFFEE6A4A))),
      const SizedBox(width: 12),
      const Text('1 / 3', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF1D2927))),
    ]);
  }
}

class _HeroSection extends StatelessWidget {
  const _HeroSection({required this.compact, required this.step, required this.onContinue});
  final bool compact;
  final _GuideStep step;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(compact ? 26 : 42),
      decoration: BoxDecoration(color: const Color(0xFFDCE9E2), borderRadius: BorderRadius.circular(28)),
      child: Flex(
        direction: compact ? Axis.vertical : Axis.horizontal,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: compact ? 0 : 3,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const _Eyebrow(label: 'YOUR NEXT MOMENT'),
              const SizedBox(height: 18),
              Text('Let’s make VS Code\nfeel like home.', style: TextStyle(fontSize: compact ? 36 : 50, height: 1.02, fontWeight: FontWeight.w800, color: Color(0xFF1D2927))),
              const SizedBox(height: 18),
              const Text('A gentle, practical path to confident coding.\nNo jargon. No rush. Just one useful thing at a time.', style: TextStyle(fontSize: 15, height: 1.5, color: Color(0xFF53645D))),
              const SizedBox(height: 28),
              FilledButton.icon(onPressed: onContinue, icon: const Icon(Icons.arrow_forward_rounded, size: 18), label: Text('Continue: ${step.title}'), style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1D2927), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)))),
            ]),
          ),
          if (!compact) const SizedBox(width: 40),
          if (compact) const SizedBox(height: 32),
          Expanded(
            flex: compact ? 0 : 2,
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: const Color(0xFFF6F4EE).withValues(alpha: .78), borderRadius: BorderRadius.circular(20)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [Container(width: 42, height: 42, decoration: const BoxDecoration(color: Color(0xFFF3C98B), shape: BoxShape.circle), child: Icon(step.icon, color: const Color(0xFF1D2927))), const Spacer(), Text(step.duration, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF75827D)))]),
                const SizedBox(height: 32),
                Text(step.number, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Color(0xFFEE6A4A))),
                const SizedBox(height: 7),
                Text(step.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF1D2927))),
                const SizedBox(height: 10),
                Text(step.description, style: const TextStyle(fontSize: 13, height: 1.45, color: Color(0xFF53645D))),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _GuideGrid extends StatelessWidget {
  const _GuideGrid({required this.steps, required this.activeIndex, required this.compact, required this.onStepSelected});
  final List<_GuideStep> steps;
  final int activeIndex;
  final bool compact;
  final ValueChanged<int> onStepSelected;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: steps.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: compact ? 1 : 3, crossAxisSpacing: 16, mainAxisSpacing: 16, childAspectRatio: compact ? 2.2 : 1.2),
      itemBuilder: (context, index) {
        final step = steps[index];
        final active = index == activeIndex;
        return InkWell(
          onTap: () => onStepSelected(index),
          borderRadius: BorderRadius.circular(18),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(color: active ? const Color(0xFFFFE8DB) : Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: active ? const Color(0xFFEE6A4A) : const Color(0xFFE8E4DB))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [Text(step.number, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFEE6A4A))), const Spacer(), Icon(step.icon, size: 21, color: active ? const Color(0xFFEE6A4A) : const Color(0xFF75827D))]),
              const Spacer(),
              Text(step.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17, color: Color(0xFF1D2927))),
              const SizedBox(height: 6),
              Text(step.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, height: 1.35, color: Color(0xFF75827D))),
            ]),
          ),
        );
      },
    );
  }
}

class _BottomNote extends StatelessWidget {
  const _BottomNote({required this.compact});
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Icon(Icons.wb_sunny_outlined, size: 20, color: Color(0xFFEE6A4A)),
      const SizedBox(width: 12),
      Expanded(child: Text(compact ? 'Small steps count. Come back whenever you are ready.' : 'Small steps count. Serenity remembers where you are, so you can come back whenever you are ready.', style: const TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF75827D)))),
    ]);
  }
}

class _Eyebrow extends StatelessWidget {
  const _Eyebrow({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) => Text(label, style: const TextStyle(letterSpacing: 1.8, fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFEE6A4A)));
}

class _GuideStep {
  const _GuideStep(this.number, this.title, this.description, this.icon, this.duration);
  final String number;
  final String title;
  final String description;
  final IconData icon;
  final String duration;
}
