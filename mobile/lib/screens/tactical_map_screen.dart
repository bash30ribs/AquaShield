import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../models/report.dart';
import '../models/buoy.dart';
import '../models/vessel.dart';
import '../widgets/tactical_app_bar.dart';

class TacticalMapScreen extends StatefulWidget {
  const TacticalMapScreen({super.key});

  @override
  State<TacticalMapScreen> createState() => _TacticalMapScreenState();
}

class _TacticalMapScreenState extends State<TacticalMapScreen> {
  final MapController _mapController = MapController();
  String _activeLayer = 'dark'; // 'dark', 'sat', 'ocean', 'osm'

  List<Report> _reports = [];
  List<BuoyTelemetry> _buoys = [];
  List<AISVessel> _vessels = [];
  bool _isLoading = true;

  // Selected marker details modal
  dynamic _selectedItem;

  // Layer Tile URLs (100% Watermark-free & Zero API Key)
  final Map<String, String> _tileUrls = {
    'dark': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    'sat': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    'ocean': 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    'osm': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  @override
  void initState() {
    super.initState();
    _loadMapData();
  }

  Future<void> _loadMapData() async {
    setState(() => _isLoading = true);
    final reports = await ApiService.fetchReports();
    final buoys = ApiService.getSmartBuoys();
    final vessels = ApiService.getAISVessels();

    if (mounted) {
      setState(() {
        _reports = reports;
        _buoys = buoys;
        _vessels = vessels;
        _isLoading = false;
      });
    }
  }

  void _recenter() {
    _mapController.move(const LatLng(18.9600, 72.8200), 10.0);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: TacticalAppBar(
        title: 'Tactical GIS Map',
        subtitle: 'LIVE AIS · TELEMETRY BUOYS · FIELD REPORTS',
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: AppColors.amberPrimary, size: 20),
            tooltip: 'Recenter Sector',
            onPressed: _recenter,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary, size: 20),
            tooltip: 'Refresh Feed',
            onPressed: _loadMapData,
          ),
        ],
      ),
      body: Stack(
        children: [
          // 1. FlutterMap Engine
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(18.9600, 72.8200),
              initialZoom: 10.0,
              minZoom: 3.0,
              maxZoom: 18.0,
            ),
            children: [
              TileLayer(
                urlTemplate: _tileUrls[_activeLayer]!,
                userAgentPackageName: 'org.aquashield.mobile',
              ),
              MarkerLayer(
                markers: [
                  // Telemetry Buoy Markers (Amber Pulsing Dot)
                  ..._buoys.map((b) => Marker(
                        point: LatLng(b.lat, b.lng),
                        width: 36,
                        height: 36,
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedItem = b),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.amberPrimary,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.amberPrimary.withOpacity(0.6),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.sensors, color: AppColors.background, size: 18),
                          ),
                        ),
                      )),
                  // AIS Vessel Markers (Directional Triangle)
                  ..._vessels.map((v) => Marker(
                        point: LatLng(v.lat, v.lng),
                        width: 32,
                        height: 32,
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedItem = v),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.amberPrimary, width: 1.5),
                            ),
                            child: const Icon(Icons.navigation, color: AppColors.amberPrimary, size: 18),
                          ),
                        ),
                      )),
                  // Field Reports (Red Alert Marker)
                  ..._reports.map((r) => Marker(
                        point: LatLng(r.latitude, r.longitude),
                        width: 36,
                        height: 36,
                        child: GestureDetector(
                          onTap: () => setState(() => _selectedItem = r),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.crisisRed,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.crisisRed.withOpacity(0.6),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 20),
                          ),
                        ),
                      )),
                ],
              ),
            ],
          ),

          // 2. Floating Layer Switcher (Top Right)
          Positioned(
            top: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.background.withOpacity(0.92),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderDefault),
                boxShadow: const [
                  BoxShadow(color: Colors.black54, blurRadius: 12),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildLayerButton('dark', 'Dark'),
                  _buildLayerButton('sat', 'Satellite'),
                  _buildLayerButton('ocean', 'Ocean'),
                  _buildLayerButton('osm', 'Daylight'),
                ],
              ),
            ),
          ),

          // 3. Bottom Telemetry Sheet / Marker Detail Popup
          if (_selectedItem != null)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: _buildItemDetailCard(_selectedItem),
            ),
        ],
      ),
    );
  }

  Widget _buildLayerButton(String key, String label) {
    final isActive = _activeLayer == key;
    return GestureDetector(
      onTap: () => setState(() => _activeLayer = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? AppColors.amberPrimary : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: isActive ? AppColors.background : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildItemDetailCard(dynamic item) {
    if (item is BuoyTelemetry) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.amberPrimary),
          boxShadow: const [BoxShadow(color: Colors.black88, blurRadius: 20)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.sensors, color: AppColors.amberPrimary, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      item.name,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() => _selectedItem = null),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _telemetryMini('WAVE SWELL', '${item.waveHeight} m'),
                _telemetryMini('WATER TEMP', '${item.waterTemp} °C'),
                _telemetryMini('WIND SPEED', '${item.windSpeed} kts'),
                _telemetryMini('POWER', '${item.batteryPct.toInt()}%'),
              ],
            ),
          ],
        ),
      );
    } else if (item is AISVessel) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderDefault),
          boxShadow: const [BoxShadow(color: Colors.black88, blurRadius: 20)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary)),
                IconButton(
                  icon: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() => _selectedItem = null),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              'MMSI: ${item.mmsi} · Type: ${item.type} · Speed: ${item.speed} kts · Heading: ${item.heading}°',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontFamily: 'monospace'),
            ),
          ],
        ),
      );
    } else if (item is Report) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.crisisRed),
          boxShadow: const [BoxShadow(color: Colors.black88, blurRadius: 20)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(item.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary)),
                IconButton(
                  icon: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() => _selectedItem = null),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(item.description, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _telemetryMini(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 8, color: AppColors.textMuted, fontFamily: 'monospace')),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.amberPrimary, fontFamily: 'monospace')),
      ],
    );
  }
}
