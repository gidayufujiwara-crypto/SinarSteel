class Category {
  final String id;
  final String name;
  final String? description;

  Category({required this.id, required this.name, this.description});
}

class Unit {
  final String id;
  final String name;
  final String? description;

  Unit({required this.id, required this.name, this.description});
}

class Product {
  final String id;
  final String code;
  final String name;
  final String category;
  final String unit;
  final double costPrice;
  final double sellingPrice;
  final int stock;
  final double? markup;

  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.category,
    required this.unit,
    required this.costPrice,
    required this.sellingPrice,
    required this.stock,
    this.markup,
  });
}

class Supplier {
  final String id;
  final String code;
  final String name;
  final String? contact;
  final String? address;

  Supplier({
    required this.id,
    required this.code,
    required this.name,
    this.contact,
    this.address,
  });
}

class Customer {
  final String id;
  final String code;
  final String name;
  final String type; // 'retail' or 'proyek'
  final String? contact;
  final String? address;

  Customer({
    required this.id,
    required this.code,
    required this.name,
    required this.type,
    this.contact,
    this.address,
  });
}
