import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Modal from './ui/Modal';
const UpdateNotifier = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        if (!window.electronAPI)
            return;
        window.electronAPI.onUpdateAvailable((info) => {
            console.log('Update available:', info);
            setUpdateAvailable(true);
            setShowModal(true);
        });
        window.electronAPI.onDownloadProgress((percent) => {
            setDownloadProgress(Math.round(percent));
        });
        window.electronAPI.onUpdateDownloaded((info) => {
            setUpdateDownloaded(true);
            setUpdateAvailable(false);
            setShowModal(true);
        });
    }, []);
    const handleCheckUpdate = async () => {
        if (!window.electronAPI) {
            alert('Fitur update hanya tersedia di aplikasi desktop.');
            return;
        }
        try {
            await window.electronAPI.checkForUpdate();
        }
        catch (err) {
            console.error('Gagal mengecek update:', err);
            alert('Gagal mengecek update.');
        }
    };
    const handleInstallUpdate = () => {
        if (window.electronAPI)
            window.electronAPI.installUpdate();
    };
    return (_jsx(_Fragment, { children: _jsxs(Modal, { open: showModal, onClose: () => setShowModal(false), title: updateDownloaded ? 'UPDATE SIAP DIPASANG' : 'UPDATE TERSEDIA', onConfirm: updateDownloaded ? handleInstallUpdate : handleCheckUpdate, confirmText: updateDownloaded ? 'INSTALL SEKARANG' : 'DOWNLOAD', confirmVariant: "primary", children: [updateAvailable && !updateDownloaded && (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-text-primary", children: "Versi baru tersedia. Ingin mendownload sekarang?" }), downloadProgress > 0 && (_jsx("div", { className: "w-full bg-bg-tertiary rounded-full h-2", children: _jsx("div", { className: "bg-neon-cyan h-2 rounded-full transition-all", style: { width: `${downloadProgress}%` } }) }))] })), updateDownloaded && (_jsx("p", { className: "text-text-primary", children: "Update telah didownload dan siap dipasang. Aplikasi akan dimulai ulang." }))] }) }));
};
export default UpdateNotifier;
