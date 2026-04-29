import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { produkApi } from '../../api/master'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

const ProdukList: React.FC = () => {
  const [produk, setProduk] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await produkApi.getAll(search || undefined)
      setProduk(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await produkApi.delete(deleteId)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card title="DAFTAR PRODUK" glow="cyan">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-text-dim" />
          <Input
            placeholder="Cari nama / SKU / barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <Link to="/master/produk/tambah">
          <Button>
            <Plus className="w-4 h-4 mr-1" /> TAMBAH
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table-neon w-full">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>
            )}
            {!loading && produk.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-text-dim">TIDAK ADA DATA</td></tr>
            )}
            {produk.map((item) => (
              <tr key={item.id}>
                <td className="font-mono">{item.sku}</td>
                <td>{item.nama}</td>
                <td>Rp {Number(item.harga_jual).toLocaleString()}</td>
                <td className={item.stok <= item.stok_minimum ? 'text-[var(--neon-orange)] font-bold' : ''}>
                  {item.stok}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link to={`/master/produk/edit/${item.id}`} className="text-neon-cyan hover:text-neon-cyan/80">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setDeleteId(item.id)} className="text-[var(--neon-pink)] hover:text-[var(--neon-pink)]/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="HAPUS PRODUK"
        onConfirm={handleDelete}
        confirmText="HAPUS"
        confirmVariant="danger"
      >
        Apakah Anda yakin ingin menghapus produk ini?
      </Modal>
    </Card>
  )
}

export default ProdukList