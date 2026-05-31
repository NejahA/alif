import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';

class ServiceBellWidget extends ConsumerWidget {
  const ServiceBellWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(serviceBellProvider);
    final unreadCount = ref.read(serviceBellProvider.notifier).unreadCount;

    return PopupMenuButton<String>(
      offset: const Offset(0, 48),
      color: CuisineTheme.charredAmber,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: CuisineTheme.saffron.withValues(alpha: 0.2)),
      ),
      onOpened: () {
        ref.read(serviceBellProvider.notifier).markAllRead();
      },
      itemBuilder: (context) {
        if (notifications.isEmpty) {
          return [
            PopupMenuItem(
              enabled: false,
              child: SizedBox(
                width: 260,
                child: Column(
                  children: [
                    Icon(LucideIcons.bellOff,
                        size: 24,
                        color: CuisineTheme.cream.withValues(alpha: 0.2)),
                    const SizedBox(height: 8),
                    Text(
                      "All Clear",
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: CuisineTheme.cream.withValues(alpha: 0.3),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Kitchen is running smoothly, Chef.",
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: CuisineTheme.cream.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ];
        }

        return [
          PopupMenuItem(
            enabled: false,
            child: SizedBox(
              width: 260,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Notifications",
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.saffron,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      ref.read(serviceBellProvider.notifier).clear();
                      Navigator.pop(context);
                    },
                    child: Text(
                      "Clear",
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: CuisineTheme.terracotta.withValues(alpha: 0.7),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          ...notifications.take(10).map((n) => PopupMenuItem(
                enabled: false,
                child: SizedBox(
                  width: 260,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: CuisineTheme.cream.withValues(alpha: 0.05),
                        ),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          n.isRead ? LucideIcons.bellOff : LucideIcons.bell,
                          size: 12,
                          color: n.isRead
                              ? CuisineTheme.cream.withValues(alpha: 0.2)
                              : CuisineTheme.saffron,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                n.message,
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: n.isRead
                                      ? CuisineTheme.cream
                                          .withValues(alpha: 0.4)
                                      : CuisineTheme.cream,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _formatTime(n.timestamp),
                                style: GoogleFonts.inter(
                                  fontSize: 8,
                                  color: CuisineTheme.cream
                                      .withValues(alpha: 0.3),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )),
        ];
      },
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: CuisineTheme.darkWalnut.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              LucideIcons.bell,
              size: 18,
              color: unreadCount > 0
                  ? CuisineTheme.saffron
                  : CuisineTheme.cream.withValues(alpha: 0.4),
            ),
          ),
          if (unreadCount > 0)
            Positioned(
              right: 2,
              top: 2,
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: CuisineTheme.cranberry,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: CuisineTheme.cranberry.withValues(alpha: 0.6),
                      blurRadius: 6,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    return "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}:${dt.second.toString().padLeft(2, '0')}";
  }
}
