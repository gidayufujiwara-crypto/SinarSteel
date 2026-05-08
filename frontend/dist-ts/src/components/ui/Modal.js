import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Button from './Button';
const Modal = ({ open, onClose, title, children, onConfirm, confirmText = 'KONFIRMASI', confirmVariant = 'primary', isLoading, }) => {
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm", children: _jsxs("div", { className: "card-neon p-6 w-full max-w-md mx-4", style: { borderColor: 'rgba(0,245,255,0.3)' }, children: [_jsx("h3", { className: "text-lg font-bold mb-4 uppercase tracking-[2px] font-orbitron", style: { color: 'var(--neon-cyan)' }, children: title }), _jsx("div", { className: "mb-4 text-sm text-text-dim font-rajdhani", children: children }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: onClose, children: "BATAL" }), onConfirm && (_jsx(Button, { variant: confirmVariant, onClick: onConfirm, isLoading: isLoading, children: confirmText }))] })] }) }));
};
export default Modal;
