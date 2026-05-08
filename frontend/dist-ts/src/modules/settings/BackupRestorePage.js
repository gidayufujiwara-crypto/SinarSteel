import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import apiClient from '../../api/client';
import { Download, Upload, Database, FileSpreadsheet } from 'lucide-react';
const BackupRestorePage = () => {
    const [mode, setMode] = useState(null);
    const [tableName, setTableName] = useState('');
    const [format, setFormat] = useState('xlsx');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileRef = useRef(null);
    const handleBackup = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await apiClient.post('/system/backup');
            const { filename } = res.data;
            // Download file
            window.open(`/api/system/download-backup/${filename}`, '_blank');
            setMessage('Backup berhasil dibuat dan sedang didownload.');
        }
        catch (err) {
            setMessage('Gagal: ' + (err.response?.data?.detail || err.message));
        }
        finally {
            setLoading(false);
        }
    };
    const handleRestore = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) {
            setMessage('Pilih file backup terlebih dahulu.');
            return;
        }
        setLoading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/system/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message || 'Restore berhasil.');
        }
        catch (err) {
            setMessage('Gagal: ' + (err.response?.data?.detail || err.message));
        }
        finally {
            setLoading(false);
            setMode(null);
        }
    };
    const handleExport = async () => {
        if (!tableName) {
            setMessage('Masukkan nama tabel.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const res = await apiClient.post('/system/export', null, {
                params: { table_name: tableName, format }
            });
            window.open(`/api/system/download-export/${res.data.filename}`, '_blank');
            setMessage(`Tabel ${tableName} berhasil diexport.`);
        }
        catch (err) {
            setMessage('Gagal: ' + (err.response?.data?.detail || err.message));
        }
        finally {
            setLoading(false);
            setMode(null);
        }
    };
    const handleImport = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file || !tableName) {
            setMessage('Pilih file dan masukkan nama tabel tujuan.');
            return;
        }
        setLoading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/system/import', formData, {
                params: { table_name: tableName },
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message || 'Import berhasil.');
        }
        catch (err) {
            setMessage('Gagal: ' + (err.response?.data?.detail || err.message));
        }
        finally {
            setLoading(false);
            setMode(null);
        }
    };
    const renderModal = () => {
        if (!mode)
            return null;
        return (_jsxs(Modal, { open: true, onClose: () => { setMode(null); setMessage(''); }, title: mode === 'backup' ? 'BACKUP DATABASE' : mode === 'restore' ? 'RESTORE DATABASE' : mode === 'export' ? 'EXPORT TABEL' : 'IMPORT TABEL', onConfirm: mode === 'backup' ? handleBackup : mode === 'restore' ? handleRestore : mode === 'export' ? handleExport : handleImport, confirmText: mode === 'backup' ? 'BACKUP' : mode === 'restore' ? 'RESTORE' : mode === 'export' ? 'EXPORT' : 'IMPORT', isLoading: loading, children: [message && _jsx("p", { className: "mb-3 text-sm text-neon-cyan", children: message }), mode === 'restore' && (_jsx("input", { type: "file", accept: ".sql,.dump", ref: fileRef, className: "mb-2" })), (mode === 'export' || mode === 'import') && (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { label: "Nama Tabel", value: tableName, onChange: e => setTableName(e.target.value), placeholder: "contoh: produk, users, transaksi" }), mode === 'export' && (_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase text-text-dim", children: "Format" }), _jsxs("select", { value: format, onChange: e => setFormat(e.target.value), className: "input-neon w-full mt-1", children: [_jsx("option", { value: "xlsx", children: "Excel (.xlsx)" }), _jsx("option", { value: "csv", children: "CSV" })] })] })), mode === 'import' && (_jsx("input", { type: "file", accept: ".csv,.xlsx,.xls", ref: fileRef, className: "mb-2" }))] }))] }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { title: "BACKUP & RESTORE DATABASE", glow: "cyan", children: [_jsx("p", { className: "text-text-dim text-sm mb-4", children: "Kelola backup database, restore, export/import data dengan mudah." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center", children: [_jsx(Database, { className: "w-8 h-8 text-neon-cyan mx-auto mb-2" }), _jsx("p", { className: "font-bold mb-2", children: "Backup Database" }), _jsx("p", { className: "text-text-dim text-xs mb-3", children: "Simpan salinan database ke file SQL" }), _jsxs(Button, { variant: "primary", onClick: () => { setMode('backup'); setMessage(''); }, children: [_jsx(Download, { className: "w-4 h-4 mr-1" }), " BACKUP"] })] }), _jsxs("div", { className: "p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center", children: [_jsx(Upload, { className: "w-8 h-8 text-neon-cyan mx-auto mb-2" }), _jsx("p", { className: "font-bold mb-2", children: "Restore Database" }), _jsx("p", { className: "text-text-dim text-xs mb-3", children: "Kembalikan database dari file backup" }), _jsxs(Button, { variant: "secondary", onClick: () => { setMode('restore'); setMessage(''); }, children: [_jsx(Upload, { className: "w-4 h-4 mr-1" }), " RESTORE"] })] }), _jsxs("div", { className: "p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center", children: [_jsx(FileSpreadsheet, { className: "w-8 h-8 text-neon-cyan mx-auto mb-2" }), _jsx("p", { className: "font-bold mb-2", children: "Export Data" }), _jsx("p", { className: "text-text-dim text-xs mb-3", children: "Ekspor tabel ke file Excel atau CSV" }), _jsxs(Button, { variant: "secondary", onClick: () => { setMode('export'); setMessage(''); }, children: [_jsx(Download, { className: "w-4 h-4 mr-1" }), " EXPORT"] })] }), _jsxs("div", { className: "p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center", children: [_jsx(Upload, { className: "w-8 h-8 text-neon-cyan mx-auto mb-2" }), _jsx("p", { className: "font-bold mb-2", children: "Import Data" }), _jsx("p", { className: "text-text-dim text-xs mb-3", children: "Impor data dari file Excel atau CSV" }), _jsxs(Button, { variant: "secondary", onClick: () => { setMode('import'); setMessage(''); }, children: [_jsx(Upload, { className: "w-4 h-4 mr-1" }), " IMPORT"] })] })] })] }), renderModal()] }));
};
export default BackupRestorePage;
