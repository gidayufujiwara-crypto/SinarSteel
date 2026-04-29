import React, { useEffect, useState } from 'react'
import { wmsApi } from '../../api/wms'
import { produkApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Check, X } from 'lucide-react'

const StockOpnameList: React.FC = () => {
  const [opname, setOpname] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<{ produk_id: string; qty_fisik: number }[]>([])
  const [keterangan, setKeterangan] = useState('')
  const [error, setError] = useState('')

  const fetchOpname = async () => {
    setLoading(true)
    try {
      const res = await wmsApi.getOpnameList()
      setOpname(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOpname()
    produkApi.getAll().then(res => setProducts(res.data.filter((p: any) => p.is_active)))
  }, [])

  const toggleProduct = (produkId: string, qtyFisik: number) => {
    setSelectedItems(prev => {
      const exist = prev.find(it => it.produk_id === produkId)
      if (exist) {
        return prev.map(it => it.produk_id === produkId ? { ...it, qty_fisik: qtyFisik } : it)
      } else {
        return [...prev, { produk_id: produkId, qty_fisik: qtyFisik }]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError('Pilih setidaknya satu produk')
      return
    }
    try {
      await wmsApi.createOpname({ items: selectedItems, keterangan })
      setShowForm(false)
      setSelectedItems([])
      setKeterangan('')
      fetchOpname()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menyimpan')
    }
  }

  return (
    <Card title="STOCK OPNAME" glow="cyan">
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> MULAI OPNAME
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Sistem</th>
            <th>Fisik</th>
            <th>Selisih</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && opname.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-text-dim">BELUM ADA DATA</td></tr>}
          {opname.map((so) => (
            <tr key={so.id}>
              <td>{new Date(so.tanggal).toLocaleDateString('id-ID')}</td>
              <td className="text-text-dim text-xs font-mono">{so.produk_id?.substring(0,8) || '-'}</td>
              <td>{so.qty_sistem}</td>
              <td>{so.qty_fisik}</td>
              <td className={so.selisih !== 0 ? 'text-[var(--neon-orange)] font-bold' : ''}>{so.selisih}</td>
              <td className="text-text-dim">{so.keterangan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="STOCK OPNAME BARU"
        onConfirm={handleSubmit}
        confirmText="SIMPAN"
      >
        {error && <p className="text-[var(--neon-pink)] mb-2 text-sm font-semibold">{error}</p>}
        <Input label="Keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} className="mb-4" />
        <div className="max-h-60 overflow-y-auto border border-[rgba(0,245,255,0.15)] rounded p-2">
          {products.map(prod => {
            const selected = selectedItems.find(it => it.produk_id === prod.id)
            return (
              <div key={prod.id} className="flex items-center justify-between py-1 text-sm">
                <span className="font-semibold text-text-primary">{prod.nama} (Stok: {prod.stok})</span>
                <div className="flex items-center gap-2">
                  {selected ? (
                    <>
                      <Input
                        type="number"
                        value={selected.qty_fisik}
                        onChange={e => toggleProduct(prod.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center py-0 px-1"
                      />
                      <button onClick={() => setSelectedItems(prev => prev.filter(it => it.produk_id !== prod.id))} className="text-[var(--neon-pink)]">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => toggleProduct(prod.id, prod.stok)}>
                      <Check className="w-3 h-3 mr-1" /> PILIH
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </Card>
  )
}

export default StockOpnameList