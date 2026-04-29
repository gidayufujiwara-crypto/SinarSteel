import React, { useEffect, useState } from 'react'
import { wmsApi } from '../../api/wms'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Search } from 'lucide-react'

const MutationHistory: React.FC = () => {
  const [mutations, setMutations] = useState<any[]>([])
  const [produkId, setProdukId] = useState('')
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await wmsApi.getMutations(produkId || undefined)
      setMutations(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => {
    fetch()
  }, [produkId])

  const getTipeBadge = (tipe: string) => {
    if (tipe === 'masuk') return 'tag-green'
    if (tipe === 'keluar') return 'tag-pink'
    return 'tag-orange'
  }

  return (
    <Card title="RIWAYAT MUTASI STOK" glow="cyan">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-text-dim" />
        <Input
          placeholder="Filter Produk ID..."
          value={produkId}
          onChange={e => setProdukId(e.target.value)}
          className="w-64"
        />
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Tipe</th>
            <th>Qty</th>
            <th>Referensi</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={6} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && mutations.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>}
          {mutations.map(mut => (
            <tr key={mut.id}>
              <td>{new Date(mut.created_at).toLocaleString('id-ID')}</td>
              <td className="font-mono text-xs text-text-dim">{mut.produk_id?.substring(0,8) || '-'}</td>
              <td><span className={`tag ${getTipeBadge(mut.tipe)}`}>{mut.tipe.toUpperCase()}</span></td>
              <td>{mut.qty}</td>
              <td className="text-text-dim">{mut.referensi || '-'}</td>
              <td className="text-text-dim">{mut.keterangan || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default MutationHistory