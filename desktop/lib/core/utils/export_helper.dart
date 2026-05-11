import 'export_helper_stub.dart'
    if (dart.library.html) 'export_helper_web.dart'
    if (dart.library.io) 'export_helper_io.dart';

void saveExcel(List<int> bytes, String fileName) =>
    saveExcelFile(bytes, fileName);
