import React, { useEffect, useState } from 'react'
import { deliveryApi } from '../../api/delivery'
import { hrApi } from '../../api/hr'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Check } from 'lucide-react'

const DeliveryOrderList: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<any[]>([])
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await deliveryApi.getOrders()
      setOrders(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrders()
    hrApi.getKaryawan().then(res => setDrivers(res.data))
  }, [])

  const handleAssignDriver = async (orderId: string) => {
    try {
      await deliveryApi.assignDriver(orderId, selectedDriver)
      setAssignModal(null)
      fetchOrders()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal assign driver')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      disiapkan: 'tag-cyan',
      diambil_driver: 'tag-cyan',
      dalam_perjalanan: 'tag-orange',
      sampai: 'tag-green',
      selesai: 'tag-green',
    }
    return map[status] || 'tag-cyan'
  }

  return (
    <Card title="DAFTAR PENGIRIMAN" glow="cyan">
      <div className="overflow-x-auto">
        <table className="table-neon w-full">
          <thead>
            <tr>
              <th>No Order</th>
              <th>Nama Penerima</th>
              <th>Kota</th>
              <th>COD</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
            {orders.map(order => (
              <tr key={order.id}>
                <td className="font-mono">{order.no_order}</td>
                <td>{order.nama_penerima}</td>
                <td>{order.kota}</td>
                <td>{order.nominal_cod ? `Rp ${Number(order.nominal_cod).toLocaleString()}` : '-'}</td>
                <td className="text-text-dim">{order.driver_id ? 'Terassign' : '-'}</td>
                <td><span className={`tag ${getStatusBadge(order.status)}`}>{order.status.replace('_', ' ').toUpperCase()}</span></td>
                <td>
                  {order.status === 'disiapkan' && (
                    <Button variant="secondary" onClick={() => setAssignModal(order.id)}>
                      <Check className="w-3 h-3 mr-1" /> ASSIGN DRIVER
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="ASSIGN DRIVER"
        onConfirm={() => handleAssignDriver(assignModal!)}
        confirmText="ASSIGN"
      >
        {error && <p className="text-[var(--neon-pink)] mb-2 text-sm font-semibold">{error}</p>}
        <div>
          <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Pilih Driver</label>
          <select
            value={selectedDriver}
            onChange={e => setSelectedDriver(e.target.value)}
            className="input-neon w-full mt-1"
          >
            <option value="">-- Pilih --</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
          </select>
        </div>
      </Modal>
    </Card>
  )
}

export default DeliveryOrderList