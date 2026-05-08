import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
const COLORS = ['#00f5ff', '#00ff88', '#9d4edd', '#ff7c00', '#ff006e', '#4361ee'];
const NeonDonutChart = ({ data }) => {
    return (_jsx(ResponsiveContainer, { width: "100%", height: 250, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, fill: "#8884d8", paddingAngle: 5, dataKey: "count", nameKey: "status", label: ({ status, count }) => `${status} (${count})`, children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#111118', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px' }, labelStyle: { color: '#00f5ff' }, itemStyle: { color: '#e8e8f0' } })] }) }));
};
export default NeonDonutChart;
