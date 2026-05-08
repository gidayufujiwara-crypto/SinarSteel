import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [label && (_jsx("label", { className: "text-xs font-semibold tracking-[1px] uppercase text-text-dim", children: label })), _jsx("input", { ref: ref, className: `input-neon ${error ? 'border-[var(--neon-pink)]' : ''} ${className}`, ...props }), error && (_jsx("span", { className: "text-[10px] text-[var(--neon-pink)] mt-1", children: error }))] }));
});
Input.displayName = 'Input';
export default Input;
