class AISVessel {
  final String mmsi;
  final String name;
  final String type;
  final double lat;
  final double lng;
  final double speed;
  final int heading;
  final String status;

  AISVessel({
    required this.mmsi,
    required this.name,
    required this.type,
    required this.lat,
    required this.lng,
    required this.speed,
    required this.heading,
    required this.status,
  });

  factory AISVessel.fromJson(Map<String, dynamic> json) {
    return AISVessel(
      mmsi: json['mmsi'] ?? '000000000',
      name: json['name'] ?? 'Vessel',
      type: json['type'] ?? 'Cargo',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      speed: (json['speed'] as num?)?.toDouble() ?? 0.0,
      heading: (json['heading'] as num?)?.toInt() ?? 0,
      status: json['status'] ?? 'Underway',
    );
  }
}
