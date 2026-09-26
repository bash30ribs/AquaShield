import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../widgets/tactical_app_bar.dart';

class EvacuationScreen extends StatelessWidget {
  const EvacuationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shelters = [
      {
        'name': 'Malabar Hill High-Ground Command Post',
        'elevation': '55 meters ASL',
        'capacity': '3,500 evacuees',
        'distance': '2.1 km',
        'status': 'Open & Verified',
        'features': ['Satellite Telephony', 'Medical Triage Unit', 'Emergency Generators', 'Clean Desalination Tanks']
      },
      {
        'name': 'Worli Sea-Face Coastal Defense Center',
        'elevation': '38 meters ASL',
        'capacity': '2,200 evacuees',
        'distance': '4.5 km',
        'status': 'Open & Verified',
        'features': ['Helipad Access', 'Amphibious Rescue Vehicles', 'First Aid Stockpile']
      },
      {
        'name': 'Bandra Fort Highland Reserve Shelter',
        'elevation': '42 meters ASL',
        'capacity': '1,800 evacuees',
        'distance': '6.8 km',
        'status': 'Open & Verified',
        'features': ['Radio Mesh Repeater', 'Food Rations Stockpile', 'Freshwater Cistern']
      },
      {
        'name': 'Sanjay Gandhi National Park Safe Inland Hub',
        'elevation': '110 meters ASL',
        'capacity': '12,000 evacuees',
        'distance': '18.4 km',
        'status': 'Regional Hub',
        'features': ['Mass Transit Staging Area', 'Regional Field Hospital', 'Army Engineering Logistics']
      },
    ];

    return Scaffold(
      appBar: const TacticalAppBar(
        title: 'Evacuation Corridors',
        subtitle: 'VERIFIED HIGH-GROUND SHELTERS & DISASTER ROUTES',
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: shelters.length,
        itemBuilder: (context, index) {
          final s = shelters[index];
          final features = s['features'] as List<String>;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
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
                        color: AppColors.radarEmeraldBg,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppColors.radarEmerald.withOpacity(0.4)),
                      ),
                      child: Text(
                        (s['status'] as String).toUpperCase(),
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppColors.radarEmerald,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    Text(
                      s['distance'] as String,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.amberPrimary,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  s['name'] as String,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.terrain, size: 14, color: AppColors.horizonSteel),
                    const SizedBox(width: 4),
                    Text('Elevation: ${s['elevation']}', style: const TextStyle(fontSize: 11, color: AppColors.horizonSteel)),
                    const SizedBox(width: 14),
                    const Icon(Icons.people_outline, size: 14, color: AppColors.horizonSteel),
                    const SizedBox(width: 4),
                    Text('Capacity: ${s['capacity']}', style: const TextStyle(fontSize: 11, color: AppColors.horizonSteel)),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: features.map((f) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceElevated,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(f, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                    );
                  }).toList(),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
