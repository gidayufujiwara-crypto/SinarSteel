import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { nama: string; total_revenue: number }[]
}

const NeonBarChart: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(157,78,221,0.1)" />
        <XAxis dataKey="nama" stroke="#9090a8" tick={{ fill: '#9090a8' }} />
        <YAxis stroke="#9090a8" tick={{ fill: '#9090a8' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(157,78,221,0.2)', borderRadius: '8px' }}
          labelStyle={{ color: '#9d4edd' }}
          itemStyle={{ color: '#e8e8f0' }}
        />
        <Bar dataKey="total_revenue" fill="#9d4edd" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default NeonBarChart