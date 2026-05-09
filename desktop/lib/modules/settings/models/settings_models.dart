class User {
  final String id;
  final String username;
  final String fullName;
  final String role;
  final bool isActive;

  const User({
    required this.id,
    required this.username,
    required this.fullName,
    required this.role,
    this.isActive = true,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      fullName: json['full_name'] ?? '',
      role: json['role'] ?? 'kasir',
      isActive: json['is_active'] ?? true,
    );
  }
}

class StoreSettings {
  final String storeName;
  final String address;
  final String phone;
  final String footer;
  final String? logoUrl;

  const StoreSettings({
    required this.storeName,
    required this.address,
    required this.phone,
    required this.footer,
    this.logoUrl,
  });

  factory StoreSettings.fromJson(Map<String, dynamic> json) {
    return StoreSettings(
      storeName: json['store_name'] ?? '',
      address: json['store_address'] ?? '',
      phone: json['store_phone'] ?? '',
      footer: json['receipt_footer'] ?? '',
      logoUrl: json['logo_url'],
    );
  }
}

class PrinterSettings {
  final String type;
  final String? path;

  const PrinterSettings({required this.type, this.path});

  factory PrinterSettings.fromJson(Map<String, dynamic> json) {
    return PrinterSettings(
      type: json['printer_type'] ?? 'usb',
      path: json['printer_path'],
    );
  }
}

class BankAccount {
  final String id;
  final String bankName;
  final String accountNumber;
  final String accountHolder;
  final String? qrisUrl;

  const BankAccount({
    required this.id,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolder,
    this.qrisUrl,
  });

  factory BankAccount.fromJson(Map<String, dynamic> json) {
    return BankAccount(
      id: json['id']?.toString() ?? '',
      bankName: json['bank_name'] ?? '',
      accountNumber: json['account_number'] ?? '',
      accountHolder: json['account_holder'] ?? '',
      qrisUrl: json['qris_url'],
    );
  }
}
