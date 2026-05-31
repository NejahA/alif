import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../providers/usage_provider.dart';

class UsageChart extends StatelessWidget {
  const UsageChart({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UsageProvider>(context);
    final stats = provider.usageStats.take(5).toList();

    if (stats.isEmpty) {
      return const Center(child: Text('No usage data yet', style: TextStyle(color: Colors.white24)));
    }

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: int.parse(stats.first.totalTimeInForeground ?? '0').toDouble() * 1.2,
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipBgColor: Colors.blueGrey,
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              final minutes = (rod.toY / (1000 * 60)).toStringAsFixed(1);
              return BarTooltipItem(
                '${stats[groupIndex].packageName?.split('.').last}\n$minutes min',
                const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= stats.length) return const SizedBox();
                final name = stats[value.toInt()].packageName?.split('.').last ?? '';
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    name.length > 5 ? name.substring(0, 5) : name,
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                );
              },
            ),
          ),
          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        barGroups: stats.asMap().entries.map((entry) {
          return BarChartGroupData(
            x: entry.key,
            barRods: [
              BarChartRodData(
                toY: int.parse(entry.value.totalTimeInForeground ?? '0').toDouble(),
                gradient: LinearGradient(
                  colors: [Theme.of(context).primaryColor, Theme.of(context).colorScheme.secondary],
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                ),
                width: 22,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(6),
                  topRight: Radius.circular(6),
                ),
                backDrawRodData: BackgroundBarChartRodData(
                  show: true,
                  toY: int.parse(stats.first.totalTimeInForeground ?? '0').toDouble(),
                  color: Colors.white.withOpacity(0.05),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
