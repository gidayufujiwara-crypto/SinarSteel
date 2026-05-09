class Driver {
  final String id;
  final String name;
  final String role; // 'supir' or 'kernet'

  Driver({required this.id, required this.name, required this.role});

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id']?.toString() ?? '',
      name: json['full_name'] ?? json['name'] ?? '',
      role: json['role'] ?? 'supir',
    );
  }
}

class DeliveryOrder {
  final String id;
  final String orderNumber;
  final String customerName;
  final String address;
  final String? phone;
  final String status; // pending, dikirim, selesai, batal
  final String? driverId;
  final String? driverName;
  final String? coDriverId;
  final String? coDriverName;
  final double totalAmount;
  final String? notes;
  final String createdAt;
  final String? updatedAt;

  DeliveryOrder({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.address,
    this.phone,
    required this.status,
    this.driverId,
    this.driverName,
    this.coDriverId,
    this.coDriverName,
    required this.totalAmount,
    this.notes,
    required this.createdAt,
    this.updatedAt,
  });

  factory DeliveryOrder.fromJson(Map<String, dynamic> json) {
    return DeliveryOrder(
      id: json['id']?.toString() ?? '',
      orderNumber: json['order_number'] ?? json['id']?.toString() ?? '',
      customerName: json['customer_name'] ?? '',
      address: json['address'] ?? '',
      phone: json['phone'],
      status: json['status'] ?? 'pending',
      driverId: json['driver_id']?.toString(),
      driverName: json['driver_name'],
      coDriverId: json['co_driver_id']?.toString(),
      coDriverName: json['co_driver_name'],
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      notes: json['notes'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'dikirim':
        return 'Dikirim';
      case 'selesai':
        return 'Selesai';
      case 'batal':
        return 'Batal';
      default:
        return status;
    }
  }
}
