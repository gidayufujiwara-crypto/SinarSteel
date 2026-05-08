class InventoryItem {
  final String id;
  final String code;
  final String name;
  final String category;
  final String unit;
  final double price;
  final int stock;
  final int minStock;

  InventoryItem({
    required this.id,
    required this.code,
    required this.name,
    required this.category,
    required this.unit,
    required this.price,
    required this.stock,
    this.minStock = 10,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id']?.toString() ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      category: json['category_name'] ?? json['category'] ?? '',
      unit: json['unit_name'] ?? json['unit'] ?? '',
      price: (json['selling_price'] ?? json['sellingPrice'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      minStock: json['min_stock'] ?? 10,
    );
  }

  bool get isLowStock => stock <= minStock;
}

class OpnameRecord {
  final String id;
  final String productName;
  final int systemStock;
  final int physicalStock;
  final int difference;
  final String date;
  final String? note;

  OpnameRecord({
    required this.id,
    required this.productName,
    required this.systemStock,
    required this.physicalStock,
    required this.difference,
    required this.date,
    this.note,
  });

  factory OpnameRecord.fromJson(Map<String, dynamic> json) {
    return OpnameRecord(
      id: json['id']?.toString() ?? '',
      productName: json['product_name'] ?? '',
      systemStock: json['system_stock'] ?? 0,
      physicalStock: json['physical_stock'] ?? 0,
      difference: (json['physical_stock'] ?? 0) - (json['system_stock'] ?? 0),
      date: json['created_at'] ?? '',
      note: json['note'],
    );
  }
}

class StockMutation {
  final String id;
  final String productName;
  final String type; // 'in', 'out', 'opname'
  final int qty;
  final String date;
  final String? reference;

  StockMutation({
    required this.id,
    required this.productName,
    required this.type,
    required this.qty,
    required this.date,
    this.reference,
  });

  factory StockMutation.fromJson(Map<String, dynamic> json) {
    return StockMutation(
      id: json['id']?.toString() ?? '',
      productName: json['product_name'] ?? '',
      type: json['mutation_type'] ?? 'in',
      qty: json['quantity'] ?? 0,
      date: json['created_at'] ?? '',
      reference: json['reference'],
    );
  }
}
