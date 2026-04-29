import React, { useEffect, useState } from 'react'
import { wmsApi } from '../../api/wms'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { Search, AlertTriangle, Printer } from 'lucide-react'

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await wmsApi.getInventory(search || undefined)
      setInventory(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [search])

  return (
    <Card title="STOK INVENTORI" glow="cyan">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-text-dim" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => (window as any).electronAPI?.printLabel?.()}
        >
          <Printer className="w-4 h-4 mr-1" /> PRINT LABEL
        </Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nama</th>
            <th>Stok</th>
            <th>Harga Jual</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-text-dim">
                MEMUAT...
              </td>
            </tr>
          )}
          {!loading && inventory.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-text-dim">
                TIDAK ADA DATA
              </td>
            </tr>
          )}
          {inventory.map(prod => (
            <tr key={prod.id}>
              <td className="font-mono">{prod.sku}</td>
              <td className="flex items-center gap-1">
                {prod.stok <= prod.stok_minimum && (
                  <AlertTriangle className="w-4 h-4 text-[var(--neon-orange)]" />
                )}
                {prod.nama}
              </td>
              <td
                className={
                  prod.stok <= prod.stok_minimum
                    ? 'text-[var(--neon-orange)] font-bold'
                    : ''
                }
              >
                {prod.stok}
              </td>
              <td>Rp {Number(prod.harga_jual).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default InventoryList