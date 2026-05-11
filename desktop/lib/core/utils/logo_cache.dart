import 'package:shared_preferences/shared_preferences.dart';

class LogoCache {
  static const _key = 'cached_logo_url';

  static Future<void> save(String? url) async {
    final prefs = await SharedPreferences.getInstance();
    if (url != null && url.isNotEmpty) {
      await prefs.setString(_key, url);
    } else {
      await prefs.remove(_key);
    }
  }

  static Future<String?> get() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key);
  }
}
