import React, { useEffect, useState } from 'react'
import { financeApi } from '../../api/finance'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Eye } from 'lucide-react'

const JournalList: React.FC = () => {
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [coa, setCOA] = useState<any[]>([])
  const [detail, setDetail] = useState<any>(null)

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10))
  const [keterangan, setKeterangan] = useState('')
  const [tipe, setTipe] = useState('memorial')
  const [items, setItems] = useState<any[]>([{ account_id: '', deskripsi: '', debit: 0, kredit: 0 }])

  const fetchJournals = async () => {
    setLoading(true)
    try {
      const res = await financeApi.getJournals()
      setJournals(res.data)
    } finally { setLoading(false) }
  }

  const fetchCOA = async () => {
    try {
      const res = await financeApi.getCOA()
      setCOA(res.data)
    } catch {}
  }

  useEffect(() => {
    fetchJournals()
    fetchCOA()
  }, [])

  const addItem = () => setItems([...items, { account_id: '', deskripsi: '', debit: 0, kredit: 0 }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const totalDebit = items.reduce((sum, it) => sum + (Number(it.debit) || 0), 0)
  const totalKredit = items.reduce((sum, it) => sum + (Number(it.kredit) || 0), 0)

  const handleSave = async () => {
    if (totalDebit !== totalKredit) {
      alert('Total Debit harus sama dengan Total Kredit')
      return
    }
    if (items.length === 0) {
      alert('Minimal satu item jurnal')
      return
    }
    try {
      await financeApi.createJournal({
        tanggal,
        keterangan,
        tipe,
        items: items.map(it => ({
          account_id: it.account_id,
          deskripsi: it.deskripsi || '',
          debit: Number(it.debit),
          kredit: Number(it.kredit),
        })),
      })
      setShowForm(false)
      setItems([{ account_id: '', deskripsi: '', debit: 0, kredit: 0 }])
      fetchJournals()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan jurnal')
    }
  }

  return (
    <Card title="JURNAL UMUM" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> BUAT JURNAL</Button>
      </div>
      <table className="table-neon w-full">
        <thead>
          <tr><th>No Jurnal</th><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={5} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
          {!loading && journals.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-text-dim">BELUM ADA JURNAL</td></tr>}
          {journals.map(j => (
            <tr key={j.id}>
              <td className="font-mono text-neon-cyan">{j.no_jurnal}</td>
              <td>{j.tanggal}</td>
              <td><span className="tag tag-cyan">{j.tipe}</span></td>
              <td>{j.keterangan || '-'}</td>
              <td>
                <Button variant="secondary" onClick={() => setDetail(j)}><Eye className="w-3 h-3" /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Form Jurnal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="BUAT JURNAL BARU" onConfirm={handleSave} confirmText="SIMPAN">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <Input label="Tanggal" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
          <Input label="Keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} />
          <div>
            <label className="text-xs font-semibold uppercase text-text-dim">Tipe</label>
            <select value={tipe} onChange={e => setTipe(e.target.value)} className="input-neon w-full mt-1">
              <option value="penjualan">Penjualan</option>
              <option value="pembelian">Pembelian</option>
              <option value="kas">Kas</option>
              <option value="memorial">Memorial</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold uppercase">Item Jurnal</p>
            <Button variant="secondary" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Tambah</Button>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center border-b border-[rgba(0,245,255,0.1)] pb-2">
              <div className="col-span-4">
                <select value={item.account_id} onChange={e => updateItem(idx, 'account_id', e.target.value)} className="input-neon w-full py-1 text-xs">
                  <option value="">Pilih Akun</option>
                  {coa.map(a => <option key={a.id} value={a.id}>{a.kode} {a.nama}</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <Input placeholder="Deskripsi" value={item.deskripsi} onChange={e => updateItem(idx, 'deskripsi', e.target.value)} className="py-1 text-xs" />
              </div>
              <div className="col-span-2">
                <Input type="number" placeholder="Debit" value={item.debit} onChange={e => updateItem(idx, 'debit', e.target.value)} className="py-1 text-xs" />
              </div>
              <div className="col-span-2">
                <Input type="number" placeholder="Kredit" value={item.kredit} onChange={e => updateItem(idx, 'kredit', e.target.value)} className="py-1 text-xs" />
              </div>
              <button onClick={() => removeItem(idx)} className="text-[var(--neon-pink)] text-xs">✕</button>
            </div>
          ))}
          <div className="flex justify-between text-xs font-bold">
            <span>Debit: Rp {totalDebit.toLocaleString()}</span>
            <span>Kredit: Rp {totalKredit.toLocaleString()}</span>
          </div>
        </div>
      </Modal>

      {/* Modal Detail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`DETAIL ${detail?.no_jurnal || ''}`}>
        {detail && (
          <div className="text-sm space-y-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-text-dim">Tanggal</div><div>{detail.tanggal}</div>
              <div className="text-text-dim">Tipe</div><div className="font-bold">{detail.tipe}</div>
              <div className="text-text-dim">Keterangan</div><div>{detail.keterangan || '-'}</div>
            </div>
            <hr className="border-[rgba(0,245,255,0.15)]" />
            <table className="table-neon w-full text-xs">
              <thead><tr><th>Akun</th><th>Deskripsi</th><th>Debit</th><th>Kredit</th></tr></thead>
              <tbody>
                {detail.items?.map((it: any) => (
                  <tr key={it.id}>
                    <td>{it.account_id?.substring(0,8)}</td>
                    <td>{it.deskripsi || '-'}</td>
                    <td>Rp {Number(it.debit).toLocaleString()}</td>
                    <td>Rp {Number(it.kredit).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </Card>
  )
}

export default JournalList