import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { month: string; revenue: number }[]
}

const NeonLineChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.1)" />
        <XAxis dataKey="month" stroke="#9090a8" tick={{ fill: '#9090a8' }} />
        <YAxis stroke="#9090a8" tick={{ fill: '#9090a8' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px' }}
          labelStyle={{ color: '#00f5ff' }}
          itemStyle={{ color: '#e8e8f0' }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#00f5ff" strokeWidth={2} dot={{ r: 4, fill: '#00f5ff' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default NeonLineChart