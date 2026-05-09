class Employee {
  final String id;
  final String nip;
  final String fullName;
  final String position;
  final String joinDate;
  final double baseSalary;
  final String? phone;
  final bool isActive;

  const Employee({
    required this.id,
    required this.nip,
    required this.fullName,
    required this.position,
    required this.joinDate,
    required this.baseSalary,
    this.phone,
    this.isActive = true,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id']?.toString() ?? '',
      nip: json['nip'] ?? '',
      fullName: json['full_name'] ?? '',
      position: json['position'] ?? '',
      joinDate: json['join_date'] ?? '',
      baseSalary: (json['base_salary'] ?? 0).toDouble(),
      phone: json['phone'],
      isActive: json['is_active'] ?? true,
    );
  }
}

class Attendance {
  final String id;
  final String employeeName;
  final String date;
  final String status; // hadir, izin, sakit, alpha
  final String? checkIn;
  final String? checkOut;
  final String? photoUrl;

  const Attendance({
    required this.id,
    required this.employeeName,
    required this.date,
    required this.status,
    this.checkIn,
    this.checkOut,
    this.photoUrl,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id']?.toString() ?? '',
      employeeName: json['employee_name'] ?? '',
      date: json['date'] ?? '',
      status: json['status'] ?? 'alpha',
      checkIn: json['check_in'],
      checkOut: json['check_out'],
      photoUrl: json['photo_url'],
    );
  }
}

class SalarySlip {
  final String id;
  final String employeeName;
  final String period; // "3/2026"
  final double baseSalary;
  final double bonus;
  final double deduction;
  final double total;
  final String? notes;

  const SalarySlip({
    required this.id,
    required this.employeeName,
    required this.period,
    required this.baseSalary,
    this.bonus = 0,
    this.deduction = 0,
    this.total = 0,
    this.notes,
  });

  factory SalarySlip.fromJson(Map<String, dynamic> json) {
    final base = (json['base_salary'] ?? 0).toDouble();
    final bonus = (json['bonus'] ?? 0).toDouble();
    final deduction = (json['deduction'] ?? 0).toDouble();
    return SalarySlip(
      id: json['id']?.toString() ?? '',
      employeeName: json['employee_name'] ?? '',
      period: json['period'] ?? '',
      baseSalary: base,
      bonus: bonus,
      deduction: deduction,
      total: base + bonus - deduction,
      notes: json['notes'],
    );
  }
}
