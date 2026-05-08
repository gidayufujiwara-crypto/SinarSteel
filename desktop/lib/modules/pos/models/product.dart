class Product {
  final String id;
  final String code;
  final String name;
  final String category;
  final double price;
  final double cost;
  final int stock;
  final String unit;

  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.category,
    required this.price,
    required this.cost,
    required this.stock,
    required this.unit,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      cost: (json['cost'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      unit: json['unit'] ?? 'pcs',
    );
  }
}
