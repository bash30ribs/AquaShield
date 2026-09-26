import 'package:flutter/material.dart';
import '../models/report.dart';
import '../theme/app_colors.dart';

class IncidentCard extends StatelessWidget {
  final Report report;
  final VoidCallback? onTap;

  const IncidentCard({
    super.key,
    required this.report,
    this.onTap,
  });

  Color _getSeverityColor(String severity) {
    switch (severity.toLowerCase()) {
      case 'critical':
        return AppColors.crisisRed;
      case 'high':
        return AppColors.amberPrimary;
      case 'moderate':
      case 'medium':
        return AppColors.skyCyan;
      default:
        return AppColors.radarEmerald;
    }
  }

  @override
  Widget build(BuildContext context) {
    final sevColor = _getSeverityColor(report.severity);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderDefault),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: sevColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: sevColor.withOpacity(0.4)),
                  ),
                  child: Text(
                    report.severity.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: sevColor,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                Text(
                  report.createdAt,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textMuted,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              report.title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              report.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: AppColors.amberPrimary),
                const SizedBox(width: 4),
                Text(
                  '${report.latitude.toStringAsFixed(4)}° N, ${report.longitude.toStringAsFixed(4)}° E',
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.amberPrimary,
                    fontFamily: 'monospace',
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceElevated,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    report.category,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.horizonSteel,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
