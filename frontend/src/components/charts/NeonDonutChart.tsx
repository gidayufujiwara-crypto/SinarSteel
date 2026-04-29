import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#00f5ff', '#00ff88', '#9d4edd', '#ff7c00', '#ff006e', '#4361ee']

interface Props {
  data: { status: string; count: number }[]
}

const NeonDonutChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="count"
          nameKey="status"
          label={({ status, count }) => `${status} (${count})`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px' }}
          labelStyle={{ color: '#00f5ff' }}
          itemStyle={{ color: '#e8e8f0' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default NeonDonutChart