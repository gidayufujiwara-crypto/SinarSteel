import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Trash2 } from 'lucide-react'
import apiClient from '../../api/client'

const SettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'karyawan' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // State untuk pengaturan lokal
  const [printerName, setPrinterName] = useState(localStorage.getItem('printerName') || '')
  const [storeName, setStoreName] = useState(localStorage.getItem('storeName') || '')
  const [storeAddress, setStoreAddress] = useState(localStorage.getItem('storeAddress') || '')
  const [storePhone, setStorePhone] = useState(localStorage.getItem('storePhone') || '')

  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value)
    switch (key) {
      case 'printerName': setPrinterName(value); break
      case 'storeName': setStoreName(value); break
      case 'storeAddress': setStoreAddress(value); break
      case 'storePhone': setStorePhone(value); break
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try { const res = await apiClient.get('/auth/users'); setUsers(res.data) } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    try {
      await apiClient.post('/auth/register', newUser)
      setShowCreate(false)
      setNewUser({ username: '', password: '', full_name: '', role: 'karyawan' })
      fetchUsers()
    } catch (err: any) { alert(err.response?.data?.detail || 'Gagal membuat user') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await apiClient.delete(`/auth/users/${deleteId}`)
      setDeleteId(null)
      fetchUsers()
    } catch (err: any) { alert(err.response?.data?.detail || 'Gagal menghapus user') }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-6">
        PENGATURAN SISTEM
      </h1>

      {user?.role === 'super_admin' && (
        <>
          <Card title="MANAJEMEN USER" glow="cyan">
            <div className="flex justify-between mb-4">
              <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> TAMBAH USER</Button>
            </div>
            <table className="table-neon w-full">
              <thead>
                <tr><th>Username</th><th>Nama Lengkap</th><th>Role</th><th>Aktif</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} className="text-center py-4 text-text-dim">MEMUAT...</td></tr>}
                {!loading && users.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-text-dim">TIDAK ADA USER</td></tr>}
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-mono">{u.username}</td>
                    <td>{u.full_name}</td>
                    <td><span className={`tag ${u.role==='super_admin'?'tag-pink':u.role==='manager'?'tag-orange':'tag-cyan'}`}>{u.role.replace('_',' ')}</span></td>
                    <td>{u.is_active ? '✅' : '❌'}</td>
                    <td><button onClick={() => setDeleteId(u.id)} className="text-[var(--neon-pink)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="PENGATURAN PRINTER" glow="cyan" className="mt-6">
            <div className="space-y-4 max-w-md">
              <Input
                label="Nama Printer Thermal"
                placeholder="EPSON TM-U220"
                value={printerName}
                onChange={e => saveSetting('printerName', e.target.value)}
              />
              <p className="text-text-dim text-xs">Nama printer digunakan saat mencetak struk. Pastikan driver sudah terpasang.</p>
            </div>
          </Card>

          <Card title="INFORMASI TOKO" glow="cyan" className="mt-6">
            <div className="space-y-4 max-w-md">
              <Input label="Nama Toko" placeholder="SinarSteel" value={storeName} onChange={e => saveSetting('storeName', e.target.value)} />
              <Input label="Alamat" placeholder="Jl. Besi No. 123" value={storeAddress} onChange={e => saveSetting('storeAddress', e.target.value)} />
              <Input label="Telepon / WA" placeholder="021-12345678" value={storePhone} onChange={e => saveSetting('storePhone', e.target.value)} />
            </div>
          </Card>
        </>
      )}

      {/* Modals Create & Delete User */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="TAMBAH USER" onConfirm={handleCreate} confirmText="SIMPAN">
        <div className="space-y-3">
          <Input label="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <Input label="Nama Lengkap" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
          <div>
            <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Role</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="input-neon w-full mt-1">
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="kasir">Kasir</option>
              <option value="gudang">Gudang</option>
              <option value="hr_admin">HR Admin</option>
              <option value="driver">Driver</option>
              <option value="karyawan">Karyawan</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="HAPUS USER" onConfirm={handleDelete} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus user ini?
      </Modal>
    </div>
  )
}

export default SettingsPage