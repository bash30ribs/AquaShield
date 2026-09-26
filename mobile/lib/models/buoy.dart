class BuoyTelemetry {
  final String id;
  final String name;
  final double lat;
  final double lng;
  final double waveHeight;
  final double waterTemp;
  final double windSpeed;
  final double batteryPct;
  final String status;

  BuoyTelemetry({
    required this.id,
    required this.name,
    required this.lat,
    required this.lng,
    required this.waveHeight,
    required this.waterTemp,
    required this.windSpeed,
    required this.batteryPct,
    required this.status,
  });

  factory BuoyTelemetry.fromJson(Map<String, dynamic> json) {
    return BuoyTelemetry(
      id: json['id'] ?? 'BUOY-00',
      name: json['name'] ?? 'Smart Buoy',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      waveHeight: (json['wave_height'] as num?)?.toDouble() ?? 1.2,
      waterTemp: (json['water_temp'] as num?)?.toDouble() ?? 28.5,
      windSpeed: (json['wind_speed'] as num?)?.toDouble() ?? 14.0,
      batteryPct: (json['battery'] as num?)?.toDouble() ?? 98.0,
      status: json['status'] ?? 'Optimal',
    );
  }
}
