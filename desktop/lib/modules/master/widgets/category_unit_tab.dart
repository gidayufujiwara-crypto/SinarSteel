import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/master_provider.dart';
import '../models/master_models.dart';

class CategoryUnitTab extends ConsumerWidget {
  const CategoryUnitTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        // Kategori (kiri)
        Expanded(
          child: _EntityPanel<Category>(
            title: 'KATEGORI',
            items: ref.watch(masterProvider).filteredCategories,
            searchHint: 'Cari kategori...',
            onSearch: (q) =>
                ref.read(masterProvider.notifier).setCategorySearch(q),
            nameField: (item) => item.name,
            descField: (item) => item.description ?? '',
            onAdd: (name, desc) => ref
                .read(masterProvider.notifier)
                .addCategory(Category(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    name: name,
                    description: desc.isEmpty ? null : desc)),
            onUpdate: (index, name, desc) {
              final old = ref.read(masterProvider).categories[index];
              ref.read(masterProvider.notifier).updateCategory(
                  index,
                  Category(
                      id: old.id,
                      name: name,
                      description: desc.isEmpty ? null : desc));
            },
            onDelete: (index) =>
                ref.read(masterProvider.notifier).deleteCategory(index),
          ),
        ),
        const VerticalDivider(width: 1, color: AppColors.borderNeon),
        // Satuan (kanan)
        Expanded(
          child: _EntityPanel<Unit>(
            title: 'SATUAN',
            items: ref.watch(masterProvider).filteredUnits,
            searchHint: 'Cari satuan...',
            onSearch: (q) => ref.read(masterProvider.notifier).setUnitSearch(q),
            nameField: (item) => item.name,
            descField: (item) => item.description ?? '',
            onAdd: (name, desc) => ref.read(masterProvider.notifier).addUnit(
                Unit(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    name: name,
                    description: desc.isEmpty ? null : desc)),
            onUpdate: (index, name, desc) {
              final old = ref.read(masterProvider).units[index];
              ref.read(masterProvider.notifier).updateUnit(
                  index,
                  Unit(
                      id: old.id,
                      name: name,
                      description: desc.isEmpty ? null : desc));
            },
            onDelete: (index) =>
                ref.read(masterProvider.notifier).deleteUnit(index),
          ),
        ),
      ],
    );
  }
}

class _EntityPanel<T> extends StatefulWidget {
  final String title;
  final List<T> items;
  final String searchHint;
  final void Function(String) onSearch;
  final String Function(T) nameField;
  final String Function(T) descField;
  final void Function(String name, String desc) onAdd;
  final void Function(int index, String name, String desc) onUpdate;
  final void Function(int index) onDelete;

  const _EntityPanel({
    required this.title,
    required this.items,
    required this.searchHint,
    required this.onSearch,
    required this.nameField,
    required this.descField,
    required this.onAdd,
    required this.onUpdate,
    required this.onDelete,
  });

  @override
  State<_EntityPanel> createState() => _EntityPanelState<T>();
}

class _EntityPanelState<T> extends State<_EntityPanel<T>> {
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  int? _editingIndex;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _clear() {
    _nameCtrl.clear();
    _descCtrl.clear();
    setState(() => _editingIndex = null);
  }

  void _submit() {
    final name = _nameCtrl.text.trim();
    if (name.isEmpty) return;
    if (_editingIndex != null) {
      widget.onUpdate(_editingIndex!, name, _descCtrl.text.trim());
    } else {
      widget.onAdd(name, _descCtrl.text.trim());
    }
    _clear();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(10),
          color: AppColors.bgCard,
          child: Text(widget.title,
              style: const TextStyle(
                  color: AppColors.neonCyan,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1)),
        ),
        // Search
        Padding(
          padding: const EdgeInsets.all(8),
          child: TextField(
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
            decoration: InputDecoration(
              hintText: widget.searchHint,
              hintStyle:
                  const TextStyle(color: AppColors.textDim, fontSize: 12),
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              fillColor: AppColors.bgDark,
              filled: true,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: const BorderSide(color: AppColors.borderNeon)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4),
                  borderSide: const BorderSide(color: AppColors.neonCyan)),
            ),
            onChanged: widget.onSearch,
          ),
        ),
        // List
        Expanded(
          child: ListView.builder(
            itemCount: widget.items.length,
            itemBuilder: (ctx, i) {
              final item = widget.items[i];
              return ListTile(
                dense: true,
                title: Text(widget.nameField(item),
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13)),
                subtitle: widget.descField(item).isNotEmpty
                    ? Text(widget.descField(item),
                        style: const TextStyle(
                            color: AppColors.textDim, fontSize: 11))
                    : null,
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline, size: 16),
                  color: AppColors.neonPink,
                  onPressed: () => widget.onDelete(i),
                ),
                onTap: () {
                  _nameCtrl.text = widget.nameField(item);
                  _descCtrl.text = widget.descField(item);
                  setState(() => _editingIndex = i);
                },
              );
            },
          ),
        ),
        // Form Add
        Container(
          padding: const EdgeInsets.all(10),
          color: AppColors.bgCard,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _nameCtrl,
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Nama',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 12),
                    isDense: true,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: TextField(
                  controller: _descCtrl,
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'Deskripsi',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 12),
                    isDense: true,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.neonCyan,
                    foregroundColor: AppColors.bgDark,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10)),
                child: Text(_editingIndex != null ? 'EDIT' : '+',
                    style: const TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
