import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const NeonLineChart = ({ data }) => {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: data, margin: { top: 5, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(0,245,255,0.1)" }), _jsx(XAxis, { dataKey: "month", stroke: "#9090a8", tick: { fill: '#9090a8' } }), _jsx(YAxis, { stroke: "#9090a8", tick: { fill: '#9090a8' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#111118', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px' }, labelStyle: { color: '#00f5ff' }, itemStyle: { color: '#e8e8f0' } }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#00f5ff", strokeWidth: 2, dot: { r: 4, fill: '#00f5ff' } })] }) }));
};
export default NeonLineChart;
