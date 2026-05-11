import 'dart:io';
import 'package:path_provider/path_provider.dart';

void saveExcelFile(List<int> bytes, String fileName) async {
  final dir = await getDownloadsDirectory();
  if (dir == null) return;
  final file = File('${dir.path}/$fileName');
  await file.writeAsBytes(bytes);
  // Tidak bisa auto-open, user harus buka manual
}
