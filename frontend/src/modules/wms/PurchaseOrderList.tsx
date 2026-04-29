import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { wmsApi } from '../../api/wms'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Check } from 'lucide-react'

const PurchaseOrderList: React.FC = () => {
  const [poList, setPoList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [showReceive, setShowReceive] = useState(false)
  const [receiveItems, setReceiveItems] = useState<any[]>([])
  const [error, setError] = useState('')

  const fetchPO = async () => {
    setLoading(true)
    try {
      const res = await wmsApi.getPOList()
      setPoList(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPO()
  }, [])

  const handleReceiveOpen = (po: any) => {
    setSelectedPO(po)
    setReceiveItems(po.items?.map((item: any) => ({
      ...item,
      qty_receive: 0,
    })) || [])
    setShowReceive(true)
  }

  const handleReceiveSubmit = async () => {
    if (!selectedPO) return
    const itemsPayload = receiveItems
      .filter(it => it.qty_receive > 0)
      .map(it => ({
        item_id: it.id,
        qty_received: it.qty_receive,
      }))
    if (itemsPayload.length === 0) {
      setError('Tidak ada item diterima')
      return
    }
    try {
      await wmsApi.receivePO(selectedPO.id, { items: itemsPayload })
      setShowReceive(false)
      fetchPO()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menerima')
    }
  }

  const updateReceiveQty = (itemId: string, qty: number) => {
    setReceiveItems(prev => prev.map(it => it.id === itemId ? { ...it, qty_receive: qty } : it))
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'tag-cyan',
      ordered: 'tag-cyan',
      partial: 'tag-orange',
      received: 'tag-green',
    }
    return colors[status] || 'tag-cyan'
  }

  return (
    <Card title="PURCHASE ORDER" glow="cyan">
      <div className="flex justify-end mb-4">
        <Link to="/wms/po/tambah">
          <Button><Plus className="w-4 h-4 mr-1" /> BUAT PO</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table-neon w-full">
          <thead>
            <tr>
              <th>No PO</th>
              <th>Supplier</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
            {!loading && poList.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-text-dim">TIDAK ADA PO</td></tr>}
            {poList.map(po => (
              <tr key={po.id}>
                <td className="font-mono">{po.no_po}</td>
                <td className="text-text-dim">{po.supplier_id?.substring(0,8) || '-'}</td>
                <td>{new Date(po.tanggal_order).toLocaleDateString('id-ID')}</td>
                <td>Rp {Number(po.total).toLocaleString()}</td>
                <td><span className={`tag ${getStatusBadge(po.status)}`}>{po.status.toUpperCase()}</span></td>
                <td>
                  {(po.status === 'ordered' || po.status === 'partial' || po.status === 'draft') && (
                    <Button variant="secondary" onClick={() => handleReceiveOpen(po)}>
                      <Check className="w-3 h-3 mr-1" /> TERIMA
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={showReceive}
        onClose={() => setShowReceive(false)}
        title={selectedPO ? `TERIMA PO: ${selectedPO.no_po}` : ''}
        onConfirm={handleReceiveSubmit}
        confirmText="PROSES"
      >
        {error && <p className="text-[var(--neon-pink)] mb-2 text-sm font-semibold">{error}</p>}
        {receiveItems.map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm font-semibold text-text-primary">Item #{idx+1} (Order: {item.qty_order})</span>
            <Input
              type="number"
              min={0}
              max={item.qty_order - (item.qty_received || 0)}
              value={item.qty_receive}
              onChange={e => updateReceiveQty(item.id, parseInt(e.target.value) || 0)}
              className="w-20 text-center py-1"
            />
          </div>
        ))}
      </Modal>
    </Card>
  )
}

export default PurchaseOrderList