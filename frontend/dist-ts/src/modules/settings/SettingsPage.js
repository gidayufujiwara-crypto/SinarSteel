import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, Printer, Database } from 'lucide-react';
import apiClient from '../../api/client';
import { settingsApi } from '../../api/pos';
import BackupRestorePage from './BackupRestorePage';
const SettingsPage = () => {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState('general');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'karyawan' });
    const [deleteId, setDeleteId] = useState(null);
    const [printerName, setPrinterName] = useState(localStorage.getItem('printerName') || '');
    const [storeName, setStoreName] = useState(localStorage.getItem('storeName') || '');
    const [storeAddress, setStoreAddress] = useState(localStorage.getItem('storeAddress') || '');
    const [storePhone, setStorePhone] = useState(localStorage.getItem('storePhone') || '');
    const [bank, setBank] = useState('');
    const [rekening, setRekening] = useState('');
    const [atasNama, setAtasNama] = useState('');
    const [qrisUrl, setQrisUrl] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(localStorage.getItem('logoUrl') || '');
    // Telegram config
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const fetchSettings = async () => {
        try {
            const res = await settingsApi.getAll();
            const map = {};
            res.data.forEach((s) => { map[s.key] = s.value; });
            setBank(map.bank_name || '');
            setRekening(map.account_number || '');
            setAtasNama(map.account_holder || '');
            setQrisUrl(map.qris_image_url || '');
            setTelegramToken(map.bot_token || '');
            setTelegramChatId(map.chat_id || '');
        }
        catch { }
    };
    const saveSetting = async (key, value) => {
        try {
            await settingsApi.update(key, value);
        }
        catch (err) {
            console.error(err);
        }
    };
    const saveLocal = (key, value) => {
        localStorage.setItem(key, value);
        switch (key) {
            case 'printerName':
                setPrinterName(value);
                break;
            case 'storeName':
                setStoreName(value);
                break;
            case 'storeAddress':
                setStoreAddress(value);
                break;
            case 'storePhone':
                setStorePhone(value);
                break;
        }
    };
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/auth/users');
            setUsers(res.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchUsers(); fetchSettings(); }, []);
    const testPrint = () => {
        if (window.electronAPI?.printReceipt) {
            window.electronAPI.printReceipt('Test Print - SinarSteel\n');
            alert('Test print berhasil dikirim ke printer.');
        }
        else {
            alert('Printer hanya bisa dites di aplikasi desktop.');
        }
    };
    const handleUploadLogo = async () => {
        if (!logoFile)
            return;
        const formData = new FormData();
        formData.append('file', logoFile);
        try {
            const res = await apiClient.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.url;
            localStorage.setItem('logoUrl', url);
            setLogoUrl(url);
            alert('Logo berhasil diupload!');
        }
        catch (err) {
            alert('Gagal upload logo');
        }
    };
    const savePaymentSettings = () => {
        saveSetting('bank_name', bank);
        saveSetting('account_number', rekening);
        saveSetting('account_holder', atasNama);
        saveSetting('qris_image_url', qrisUrl);
        alert('Pengaturan pembayaran disimpan!');
    };
    const handleCreate = async () => {
        try {
            await apiClient.post('/auth/register', newUser);
            setShowCreate(false);
            setNewUser({ username: '', password: '', full_name: '', role: 'karyawan' });
            fetchUsers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal membuat user');
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        try {
            await apiClient.delete(`/auth/users/${deleteId}`);
            setDeleteId(null);
            fetchUsers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Gagal menghapus user');
        }
    };
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-6", children: "PENGATURAN SISTEM" }), user?.role === 'super_admin' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2 mb-6 border-b border-[rgba(0,245,255,0.15)] pb-2", children: [_jsx("button", { onClick: () => setActiveTab('general'), className: `px-4 py-2 rounded-t-lg transition-colors text-sm font-semibold tracking-wide ${activeTab === 'general'
                                    ? 'bg-bg-card text-neon-cyan border border-[rgba(0,245,255,0.3)] border-b-transparent shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                                    : 'text-text-dim hover:text-neon-cyan hover:bg-[rgba(0,245,255,0.04)]'}`, children: "UMUM" }), _jsxs("button", { onClick: () => setActiveTab('backup'), className: `px-4 py-2 rounded-t-lg transition-colors text-sm font-semibold tracking-wide flex items-center gap-2 ${activeTab === 'backup'
                                    ? 'bg-bg-card text-neon-cyan border border-[rgba(0,245,255,0.3)] border-b-transparent shadow-[0_0_10px_rgba(0,245,255,0.1)]'
                                    : 'text-text-dim hover:text-neon-cyan hover:bg-[rgba(0,245,255,0.04)]'}`, children: [_jsx(Database, { className: "w-4 h-4" }), "BACKUP & RESTORE"] })] }), activeTab === 'general' ? (_jsxs(_Fragment, { children: [_jsxs(Card, { title: "MANAJEMEN USER", glow: "cyan", children: [_jsx("div", { className: "flex justify-between mb-4", children: _jsxs(Button, { onClick: () => setShowCreate(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-1" }), " TAMBAH USER"] }) }), _jsxs("table", { className: "table-neon w-full", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Username" }), _jsx("th", { children: "Nama Lengkap" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Aktif" }), _jsx("th", { children: "Aksi" })] }) }), _jsxs("tbody", { children: [loading && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "MEMUAT..." }) }), !loading && users.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-4 text-text-dim", children: "TIDAK ADA USER" }) }), users.map(u => (_jsxs("tr", { children: [_jsx("td", { className: "font-mono", children: u.username }), _jsx("td", { children: u.full_name }), _jsx("td", { children: _jsx("span", { className: `tag ${u.role === 'super_admin' ? 'tag-pink' : u.role === 'manager' ? 'tag-orange' : 'tag-cyan'}`, children: u.role.replace('_', ' ') }) }), _jsx("td", { children: u.is_active ? '✅' : '❌' }), _jsx("td", { children: _jsx("button", { onClick: () => setDeleteId(u.id), className: "text-[var(--neon-pink)] hover:text-red-400", children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, u.id)))] })] })] }), _jsx(Card, { title: "PENGATURAN PRINTER", glow: "cyan", className: "mt-6", children: _jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx(Input, { label: "Nama Printer Thermal", value: printerName, onChange: e => saveLocal('printerName', e.target.value) }), _jsxs(Button, { variant: "primary", onClick: testPrint, children: [_jsx(Printer, { className: "w-4 h-4 mr-1" }), " TEST PRINT"] }), _jsx("p", { className: "text-text-dim text-xs", children: "Pastikan printer thermal terhubung dan driver terinstal." })] }) }), _jsx(Card, { title: "INFORMASI TOKO", glow: "cyan", className: "mt-6", children: _jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx(Input, { label: "Nama Toko", value: storeName, onChange: e => saveLocal('storeName', e.target.value) }), _jsx(Input, { label: "Alamat", value: storeAddress, onChange: e => saveLocal('storeAddress', e.target.value) }), _jsx(Input, { label: "Telepon / WA", value: storePhone, onChange: e => saveLocal('storePhone', e.target.value) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Logo Toko" }), _jsx("input", { type: "file", accept: "image/*", onChange: e => setLogoFile(e.target.files?.[0] || null), className: "mt-1" }), _jsx(Button, { variant: "secondary", onClick: handleUploadLogo, className: "mt-2", children: "UPLOAD LOGO" }), logoUrl && _jsx("img", { src: logoUrl, alt: "Logo", className: "w-24 h-24 object-contain mt-2 border border-[rgba(0,245,255,0.2)] rounded" })] })] }) }), _jsx(Card, { title: "PENGATURAN PEMBAYARAN", glow: "cyan", className: "mt-6", children: _jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx(Input, { label: "Nama Bank", value: bank, onChange: e => setBank(e.target.value) }), _jsx(Input, { label: "Nomor Rekening", value: rekening, onChange: e => setRekening(e.target.value) }), _jsx(Input, { label: "Atas Nama", value: atasNama, onChange: e => setAtasNama(e.target.value) }), _jsx(Input, { label: "URL Gambar QRIS", value: qrisUrl, onChange: e => setQrisUrl(e.target.value) }), qrisUrl && _jsx("img", { src: qrisUrl, alt: "QRIS", className: "w-24 h-24 object-contain border border-[rgba(0,245,255,0.2)] rounded-lg" }), _jsx(Button, { variant: "primary", onClick: savePaymentSettings, children: "SIMPAN" })] }) }), _jsx(Card, { title: "PENGATURAN NOTIFIKASI TELEGRAM", glow: "cyan", className: "mt-6", children: _jsxs("div", { className: "space-y-4 max-w-md", children: [_jsx(Input, { label: "Bot Token", value: telegramToken, onChange: e => {
                                                setTelegramToken(e.target.value);
                                                saveSetting('bot_token', e.target.value);
                                            }, placeholder: "Masukkan token dari @BotFather" }), _jsx(Input, { label: "Chat ID", value: telegramChatId, onChange: e => {
                                                setTelegramChatId(e.target.value);
                                                saveSetting('chat_id', e.target.value);
                                            }, placeholder: "Masukkan Chat ID Telegram Anda" }), _jsxs("p", { className: "text-text-dim text-xs", children: ["Panduan: Buka Telegram, cari @BotFather, buat bot baru. Dapatkan token. Lalu cari bot Anda, kirim pesan, dan akses ", _jsx("code", { children: "https://api.telegram.org/bot<TOKEN>/getUpdates" }), " untuk mendapatkan Chat ID."] })] }) })] })) : (_jsx(BackupRestorePage, {}))] })), _jsx(Modal, { open: showCreate, onClose: () => setShowCreate(false), title: "TAMBAH USER", onConfirm: handleCreate, confirmText: "SIMPAN", children: _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { label: "Username", value: newUser.username, onChange: e => setNewUser({ ...newUser, username: e.target.value }) }), _jsx(Input, { label: "Password", type: "password", value: newUser.password, onChange: e => setNewUser({ ...newUser, password: e.target.value }) }), _jsx(Input, { label: "Nama Lengkap", value: newUser.full_name, onChange: e => setNewUser({ ...newUser, full_name: e.target.value }) }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: "Role" }), _jsxs("select", { value: newUser.role, onChange: e => setNewUser({ ...newUser, role: e.target.value }), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "super_admin", children: "Super Admin" }), _jsx("option", { value: "kasir", children: "Kasir" }), _jsx("option", { value: "checker", children: "Checker" }), _jsx("option", { value: "gudang", children: "Gudang" }), _jsx("option", { value: "supir", children: "Supir" }), _jsx("option", { value: "kernet", children: "Kernet" })] })] })] }) }), _jsx(Modal, { open: !!deleteId, onClose: () => setDeleteId(null), title: "HAPUS USER", onConfirm: handleDelete, confirmText: "HAPUS", confirmVariant: "danger", children: "Yakin ingin menghapus user ini?" })] }));
};
export default SettingsPage;
