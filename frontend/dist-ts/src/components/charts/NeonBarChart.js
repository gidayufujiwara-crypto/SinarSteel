import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const NeonBarChart = ({ data }) => {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data, margin: { top: 5, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(157,78,221,0.1)" }), _jsx(XAxis, { dataKey: "nama", stroke: "#9090a8", tick: { fill: '#9090a8' } }), _jsx(YAxis, { stroke: "#9090a8", tick: { fill: '#9090a8' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#111118', border: '1px solid rgba(157,78,221,0.2)', borderRadius: '8px' }, labelStyle: { color: '#9d4edd' }, itemStyle: { color: '#e8e8f0' } }), _jsx(Bar, { dataKey: "total_revenue", fill: "#9d4edd", radius: [8, 8, 0, 0] })] }) }));
};
export default NeonBarChart;
