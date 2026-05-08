import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Button = ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }) => {
    const baseClass = 'font-orbitron text-xs font-bold tracking-wider uppercase py-2 px-5 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none';
    const variants = {
        primary: 'bg-neon-cyan text-black shadow-[0_0_16px_rgba(0,245,255,0.4)] hover:shadow-[0_0_28px_rgba(0,245,255,0.7),0_0_60px_rgba(0,245,255,0.2)] hover:-translate-y-px',
        secondary: 'bg-transparent text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-[0_0_12px_rgba(0,245,255,0.2)]',
        danger: 'bg-[rgba(255,45,120,0.12)] text-neon-pink border border-[rgba(255,45,120,0.25)] hover:bg-[rgba(255,45,120,0.18)] hover:shadow-[0_0_12px_rgba(255,45,120,0.3)]',
    };
    const classes = `${baseClass} ${variants[variant]} ${className}`;
    return (_jsx("button", { className: classes, disabled: disabled || isLoading, ...props, children: isLoading ? (_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" }), "LOADING"] })) : (children) }));
};
export default Button;
