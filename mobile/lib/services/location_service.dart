import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class LocationService {
  static Future<LatLng?> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Fallback default coordinate (Mumbai / Arabian Sea)
      return const LatLng(18.9600, 72.8200);
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return const LatLng(18.9600, 72.8200);
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return const LatLng(18.9600, 72.8200);
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 6),
      );
      return LatLng(position.latitude, position.longitude);
    } catch (e) {
      return const LatLng(18.9600, 72.8200);
    }
  }
}
