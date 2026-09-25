import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ColonyeLogoWidget extends StatelessWidget {
  final double size;
  final bool showText;

  const ColonyeLogoWidget({
    super.key,
    this.size = 36.0,
    this.showText = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget logoIcon = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppTheme.quantumCyan.withOpacity(0.4),
            blurRadius: size * 0.4,
            spreadRadius: size * 0.05,
          ),
        ],
      ),
      child: ClipOval(
        child: Image.asset(
          'assets/images/colonye_logo.jpg',
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            // Fallback Vector Logo Custom Painter
            return Container(
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.quantumCyan,
                    AppTheme.nebulaViolet,
                    AppTheme.voidBlack,
                  ],
                ),
              ),
              child: const Icon(
                Icons.blur_on_rounded,
                color: Colors.white,
                size: 20,
              ),
            );
          },
        ),
      ),
    );

    if (!showText) return logoIcon;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        logoIcon,
        const SizedBox(width: 10),
        Text(
          'COLONYE',
          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                letterSpacing: 4.0,
                fontSize: size * 0.7,
                foreground: Paint()
                  ..shader = const LinearGradient(
                    colors: [AppTheme.quantumCyan, AppTheme.nebulaViolet],
                  ).createShader(const Rect.fromLTWH(0, 0, 160, 30)),
              ),
        ),
      ],
    );
  }
}
