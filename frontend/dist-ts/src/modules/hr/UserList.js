import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { hrApi } from '../../api/hr';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'kasir' });
    const [deleteId, setDeleteId] = useState(null);
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await hrApi.getUsers();
            setUsers(res.data);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchUsers(); }, []);
    const handleCreate = async () => {
        try {
            await hrApi.createUser(newUser);
            setShowForm(false);
            setNewUser({ username: '', password: '', full_name: '', role: 'kasir' });
            fetchUsers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal');
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await hrApi.deleteUser(deleteId);
            setDeleteId(null);
            fetchUsers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal');
        }
    };
    return (_jsxs(Card, { title: "MANAJEMEN USER & AKSES", glow: "cyan", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Button, { onClick: () => setShowForm(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH USER"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Username" }), _jsx("th", { children: "Nama Lengkap" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Aktif" }), _jsx("th", { children: "Aksi" })] }) }), _jsx("tbody", { children: loading ? _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4", children: "Memuat..." }) }) :
                            users.map(u => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: u.username }), _jsx("td", { children: u.full_name }), _jsx("td", { children: _jsx("span", { className: "tag tag-cyan", children: u.role }) }), _jsx("td", { children: u.is_active ? '✅' : '❌' }), _jsx("td", { children: _jsx("button", { onClick: () => setDeleteId(u.id), className: "text-[var(--neon-pink)]", children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, u.id))) })] }), _jsx(Modal, { open: showForm, onClose: () => setShowForm(false), title: "TAMBAH USER", onConfirm: handleCreate, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { label: "Username", value: newUser.username, onChange: e => setNewUser({ ...newUser, username: e.target.value }) }), _jsx(Input, { label: "Password", type: "password", value: newUser.password, onChange: e => setNewUser({ ...newUser, password: e.target.value }) }), _jsx(Input, { label: "Nama Lengkap", value: newUser.full_name, onChange: e => setNewUser({ ...newUser, full_name: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase", children: "Role" }), _jsxs("select", { value: newUser.role, onChange: e => setNewUser({ ...newUser, role: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "super_admin", children: "Super Admin" }), _jsx("option", { value: "kasir", children: "Kasir" }), _jsx("option", { value: "checker", children: "Checker" }), _jsx("option", { value: "gudang", children: "Gudang" }), _jsx("option", { value: "supir", children: "Supir" }), _jsx("option", { value: "kernet", children: "Kernet" })] })] })] }) }), _jsx(Modal, { open: !!deleteId, onClose: () => setDeleteId(null), title: "HAPUS USER", onConfirm: handleDelete, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus user ini?" })] }));
};
export default UserList;
