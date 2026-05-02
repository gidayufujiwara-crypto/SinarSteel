import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Plus, Trash2, Printer } from 'lucide-react'
import apiClient from '../../api/client'
import { settingsApi } from '../../api/pos'

const SettingsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'karyawan' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [printerName, setPrinterName] = useState(localStorage.getItem('printerName') || '')
  const [storeName, setStoreName] = useState(localStorage.getItem('storeName') || '')
  const [storeAddress, setStoreAddress] = useState(localStorage.getItem('storeAddress') || '')
  const [storePhone, setStorePhone] = useState(localStorage.getItem('storePhone') || '')

  // Settings from backend
  const [bank, setBank] = useState('')
  const [rekening, setRekening] = useState('')
  const [atasNama, setAtasNama] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')

  // Logo
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('logoUrl') || '')

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.getAll()
      const map: any = {}
      res.data.forEach((s: any) => { map[s.key] = s.value })
      setBank(map.bank_name || '')
      setRekening(map.account_number || '')
      setAtasNama(map.account_holder || '')
      setQrisUrl(map.qris_image_url || '')
    } catch {}
  }

  const saveSetting = async (key: string, value: string) => {
    try { await settingsApi.update(key, value) } catch (err) { console.error(err) }
  }

  const saveLocal = (key: string, value: string) => {
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

  useEffect(() => { fetchUsers(); fetchSettings() }, [])

  const testPrint = () => {
    if ((window as any).electronAPI?.printReceipt) {
      (window as any).electronAPI.printReceipt('Test Print - SinarSteel\n')
      alert('Test print berhasil dikirim ke printer.')
    } else {
      alert('Printer hanya bisa dites di aplikasi desktop.')
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return
    const formData = new FormData()
    formData.append('file', logoFile)
    try {
      const res = await apiClient.post('/settings/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const url = res.data.url
      localStorage.setItem('logoUrl', url)
      setLogoUrl(url)
      alert('Logo berhasil diupload!')
    } catch (err) {
      alert('Gagal upload logo')
    }
  }

  const savePaymentSettings = () => {
    saveSetting('bank_name', bank)
    saveSetting('account_number', rekening)
    saveSetting('account_holder', atasNama)
    saveSetting('qris_image_url', qrisUrl)
    alert('Pengaturan pembayaran disimpan!')
  }

  const handleCreate = async () => { /* ... */ }
  const handleDelete = async () => { /* ... */ }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase mb-6">PENGATURAN SISTEM</h1>

      {user?.role === 'super_admin' && (
        <>
          {/* Manajemen User */}
          <Card title="MANAJEMEN USER" glow="cyan">
            {/* ... (sama seperti sebelumnya) ... */}
          </Card>

          {/* Printer */}
          <Card title="PENGATURAN PRINTER" glow="cyan" className="mt-6">
            <div className="space-y-4 max-w-md">
              <Input label="Nama Printer Thermal" value={printerName} onChange={e => saveLocal('printerName', e.target.value)} />
              <div className="flex gap-2">
                <Button variant="primary" onClick={testPrint}>
                  <Printer className="w-4 h-4 mr-1" /> TEST PRINT
                </Button>
              </div>
              <p className="text-text-dim text-xs">Pastikan printer thermal terhubung dan driver terinstal.</p>
            </div>
          </Card>

          {/* Informasi Toko */}
          <Card title="INFORMASI TOKO" glow="cyan" className="mt-6">
            <div className="space-y-4 max-w-md">
              <Input label="Nama Toko" value={storeName} onChange={e => saveLocal('storeName', e.target.value)} />
              <Input label="Alamat" value={storeAddress} onChange={e => saveLocal('storeAddress', e.target.value)} />
              <Input label="Telepon / WA" value={storePhone} onChange={e => saveLocal('storePhone', e.target.value)} />
              {/* Upload Logo */}
              <div>
                <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim">Logo Toko</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="mt-1" />
                <Button variant="secondary" onClick={handleUploadLogo} className="mt-2">UPLOAD LOGO</Button>
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain mt-2 border border-[rgba(0,245,255,0.2)] rounded" />}
              </div>
            </div>
          </Card>

          {/* Pengaturan Pembayaran */}
          <Card title="PENGATURAN PEMBAYARAN" glow="cyan" className="mt-6">
            <div className="space-y-4 max-w-md">
              <Input label="Nama Bank" value={bank} onChange={e => setBank(e.target.value)} />
              <Input label="Nomor Rekening" value={rekening} onChange={e => setRekening(e.target.value)} />
              <Input label="Atas Nama" value={atasNama} onChange={e => setAtasNama(e.target.value)} />
              <Input label="URL Gambar QRIS" value={qrisUrl} onChange={e => setQrisUrl(e.target.value)} />
              {qrisUrl && <img src={qrisUrl} alt="QRIS" className="w-24 h-24 object-contain border border-[rgba(0,245,255,0.2)] rounded-lg" />}
              <Button variant="primary" onClick={savePaymentSettings}>SIMPAN</Button>
            </div>
          </Card>
        </>
      )}

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