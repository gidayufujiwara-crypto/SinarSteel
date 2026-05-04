import React, { useEffect, useState } from 'react'
import { hrApi } from '../../api/hr'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Trash2 } from 'lucide-react'

const UserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'kasir' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try { const res = await hrApi.getUsers(); setUsers(res.data) } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    try {
      await hrApi.createUser(newUser)
      setShowForm(false)
      setNewUser({ username: '', password: '', full_name: '', role: 'kasir' })
      fetchUsers()
    } catch (err: any) { alert(err.response?.data?.detail || 'Gagal') }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await hrApi.deleteUser(deleteId)
      setDeleteId(null)
      fetchUsers()
    } catch (err: any) { alert(err.response?.data?.detail || 'Gagal') }
  }

  return (
    <Card title="MANAJEMEN USER & AKSES" glow="cyan">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> TAMBAH USER</Button>
      </div>
      <table className="table-neon w-full">
        <thead><tr><th>Username</th><th>Nama Lengkap</th><th>Role</th><th>Aktif</th><th>Aksi</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={5} className="text-center py-4">Memuat...</td></tr> :
           users.map(u => (
            <tr key={u.id}>
              <td className="font-mono">{u.username}</td>
              <td>{u.full_name}</td>
              <td><span className="tag tag-cyan">{u.role}</span></td>
              <td>{u.is_active ? '✅' : '❌'}</td>
              <td><button onClick={() => setDeleteId(u.id)} className="text-[var(--neon-pink)]"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="TAMBAH USER" onConfirm={handleCreate} confirmText="SIMPAN">
        <div className="space-y-3">
          <Input label="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <Input label="Nama Lengkap" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
          <div>
            <label className="text-xs font-semibold uppercase">Role</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="input-neon w-full mt-1">
              <option value="super_admin">Super Admin</option>
              <option value="kasir">Kasir</option>
              <option value="checker">Checker</option>
              <option value="gudang">Gudang</option>
              <option value="supir">Supir</option>
              <option value="kernet">Kernet</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="HAPUS USER" onConfirm={handleDelete} confirmText="HAPUS" confirmVariant="danger">
        Yakin ingin menghapus user ini?
      </Modal>
    </Card>
  )
}

export default UserList