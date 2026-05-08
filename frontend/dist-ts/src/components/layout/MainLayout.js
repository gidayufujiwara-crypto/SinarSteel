import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
const MainLayout = () => {
    return (_jsxs("div", { className: "flex h-screen overflow-hidden", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col", style: { marginLeft: '72px' }, children: [_jsx(Topbar, {}), _jsx("main", { className: "flex-1 overflow-y-auto p-6", style: { background: 'var(--bg-dark)' }, children: _jsx(Outlet, {}) })] })] }));
};
export default MainLayout;
