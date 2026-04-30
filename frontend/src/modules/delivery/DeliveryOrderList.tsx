import React, { useEffect, useState } from 'react'
import { deliveryApi } from '../../api/delivery'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Check, Eye, ArrowRight } from 'lucide-react'

const NEXT_STATUS: Record<string, string> = {
  disiapkan: 'diambil_driver',
  diambil_driver: 'dalam_perjalanan',
  dalam_perjalanan: 'sampai',
  sampai: 'selesai',
}

const DeliveryOrderList: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assignModal, setAssignModal] = useState<string | null>(null)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [error, setError] = useState('')
  const [detailOrder, setDetailOrder] = useState<any>(null)
  const [updateModal, setUpdateModal] = useState<string | null>(null)
  const user = useAuthStore(state => state.user)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await deliveryApi.getOrders()
      setOrders(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleAssignDriver = async (orderId: string) => {
    try {
      await deliveryApi.assignDriver(orderId, selectedDriver)
      setAssignModal(null)
      fetchOrders()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal assign driver')
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await deliveryApi.updateStatus(orderId, { status: newStatus })
      setUpdateModal(null)
      fetchOrders()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal update status')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      disiapkan: 'tag-cyan',
      diambil_driver: 'tag-cyan',
      dalam_perjalanan: 'tag-orange',
      sampai: 'tag-green',
      selesai: 'tag-green',
    }
    return colors[status] || 'tag-cyan'
  }

  const canUpdateStatus = (order: any) => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    if (user.role === 'driver' && order.driver_id === user.id) return true
    return false
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
                  <div className="flex gap-1">
                    {order.status === 'disiapkan' && (user?.role === 'super_admin' || user?.role === 'manager') && (
                      <Button variant="secondary" onClick={() => setAssignModal(order.id)}>
                        <Check className="w-3 h-3 mr-1" /> ASSIGN
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => setDetailOrder(order)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    {canUpdateStatus(order) && NEXT_STATUS[order.status] && (
                      <Button variant="primary" onClick={() => setUpdateModal(order.id)}>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Assign Driver */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="ASSIGN DRIVER" onConfirm={() => handleAssignDriver(assignModal!)} confirmText="ASSIGN">
        {error && <p className="text-[var(--neon-pink)] mb-2">{error}</p>}
        <div>
          <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Pilih Driver</label>
          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="input-neon w-full mt-1">
            <option value="">-- Pilih --</option>
            {/* driver list bisa diambil dari hrApi.getKaryawan, untuk contoh biarkan kosong dulu */}
          </select>
        </div>
      </Modal>

      {/* Modal Detail */}
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`DETAIL ORDER: ${detailOrder?.no_order || ''}`}>
        {detailOrder && (
          <div className="text-sm space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-text-dim">No Order</div><div className="font-mono text-neon-cyan">{detailOrder.no_order}</div>
              <div className="text-text-dim">Tanggal</div><div>{new Date(detailOrder.created_at).toLocaleString('id-ID')}</div>
              <div className="text-text-dim">Penerima</div><div>{detailOrder.nama_penerima}</div>
              <div className="text-text-dim">Alamat</div><div className="whitespace-pre-wrap">{detailOrder.alamat_pengiriman}</div>
              <div className="text-text-dim">Kota</div><div>{detailOrder.kota}</div>
              <div className="text-text-dim">Telepon</div><div>{detailOrder.telepon || '-'}</div>
              <div className="text-text-dim">COD</div><div>{detailOrder.nominal_cod ? `Rp ${Number(detailOrder.nominal_cod).toLocaleString()}` : '-'}</div>
              <div className="text-text-dim">Status</div><div><span className={`tag ${getStatusBadge(detailOrder.status)}`}>{detailOrder.status.replace('_', ' ').toUpperCase()}</span></div>
              <div className="text-text-dim">Driver</div><div className="text-text-dim">{detailOrder.driver_id || 'Belum diassign'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Update Status */}
      <Modal open={!!updateModal} onClose={() => setUpdateModal(null)} title="UPDATE STATUS">
        <p className="text-text-dim mb-4">Pilih status berikutnya:</p>
        <div className="flex flex-col gap-2">
          {orders.find(o => o.id === updateModal) && NEXT_STATUS[orders.find(o => o.id === updateModal)!.status] && (
            <Button variant="primary" onClick={() => handleUpdateStatus(updateModal!, NEXT_STATUS[orders.find(o => o.id === updateModal)!.status])}>
              {NEXT_STATUS[orders.find(o => o.id === updateModal)!.status].replace('_', ' ').toUpperCase()}
            </Button>
          )}
        </div>
      </Modal>
    </Card>
  )
}

export default DeliveryOrderList