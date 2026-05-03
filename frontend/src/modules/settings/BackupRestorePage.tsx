import React, { useState, useRef } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import apiClient from '../../api/client'
import { Download, Upload, Database, FileSpreadsheet } from 'lucide-react'

type Mode = 'backup' | 'restore' | 'export' | 'import'

const BackupRestorePage: React.FC = () => {
  const [mode, setMode] = useState<Mode | null>(null)
  const [tableName, setTableName] = useState('')
  const [format, setFormat] = useState('xlsx')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleBackup = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await apiClient.post('/system/backup')
      const { filename } = res.data
      // Download file
      window.open(`/api/system/download-backup/${filename}`, '_blank')
      setMessage('Backup berhasil dibuat dan sedang didownload.')
    } catch (err: any) {
      setMessage('Gagal: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setMessage('Pilih file backup terlebih dahulu.')
      return
    }
    setLoading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await apiClient.post('/system/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage(res.data.message || 'Restore berhasil.')
    } catch (err: any) {
      setMessage('Gagal: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
      setMode(null)
    }
  }

  const handleExport = async () => {
    if (!tableName) {
      setMessage('Masukkan nama tabel.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await apiClient.post('/system/export', null, {
        params: { table_name: tableName, format }
      })
      window.open(`/api/system/download-export/${res.data.filename}`, '_blank')
      setMessage(`Tabel ${tableName} berhasil diexport.`)
    } catch (err: any) {
      setMessage('Gagal: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
      setMode(null)
    }
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !tableName) {
      setMessage('Pilih file dan masukkan nama tabel tujuan.')
      return
    }
    setLoading(true)
    setMessage('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await apiClient.post('/system/import', formData, {
        params: { table_name: tableName },
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage(res.data.message || 'Import berhasil.')
    } catch (err: any) {
      setMessage('Gagal: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
      setMode(null)
    }
  }

  const renderModal = () => {
    if (!mode) return null
    return (
      <Modal
        open={true}
        onClose={() => { setMode(null); setMessage('') }}
        title={mode === 'backup' ? 'BACKUP DATABASE' : mode === 'restore' ? 'RESTORE DATABASE' : mode === 'export' ? 'EXPORT TABEL' : 'IMPORT TABEL'}
        onConfirm={mode === 'backup' ? handleBackup : mode === 'restore' ? handleRestore : mode === 'export' ? handleExport : handleImport}
        confirmText={mode === 'backup' ? 'BACKUP' : mode === 'restore' ? 'RESTORE' : mode === 'export' ? 'EXPORT' : 'IMPORT'}
        isLoading={loading}
      >
        {message && <p className="mb-3 text-sm text-neon-cyan">{message}</p>}
        {mode === 'restore' && (
          <input type="file" accept=".sql,.dump" ref={fileRef} className="mb-2" />
        )}
        {(mode === 'export' || mode === 'import') && (
          <div className="space-y-3">
            <Input
              label="Nama Tabel"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder="contoh: produk, users, transaksi"
            />
            {mode === 'export' && (
              <div>
                <label className="text-xs font-semibold uppercase text-text-dim">Format</label>
                <select value={format} onChange={e => setFormat(e.target.value)} className="input-neon w-full mt-1">
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            )}
            {mode === 'import' && (
              <input type="file" accept=".csv,.xlsx,.xls" ref={fileRef} className="mb-2" />
            )}
          </div>
        )}
      </Modal>
    )
  }

  return (
    <div className="space-y-6">
      <Card title="BACKUP & RESTORE DATABASE" glow="cyan">
        <p className="text-text-dim text-sm mb-4">
          Kelola backup database, restore, export/import data dengan mudah.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center">
            <Database className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <p className="font-bold mb-2">Backup Database</p>
            <p className="text-text-dim text-xs mb-3">Simpan salinan database ke file SQL</p>
            <Button variant="primary" onClick={() => { setMode('backup'); setMessage('') }}>
              <Download className="w-4 h-4 mr-1" /> BACKUP
            </Button>
          </div>
          <div className="p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center">
            <Upload className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <p className="font-bold mb-2">Restore Database</p>
            <p className="text-text-dim text-xs mb-3">Kembalikan database dari file backup</p>
            <Button variant="secondary" onClick={() => { setMode('restore'); setMessage('') }}>
              <Upload className="w-4 h-4 mr-1" /> RESTORE
            </Button>
          </div>
          <div className="p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center">
            <FileSpreadsheet className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <p className="font-bold mb-2">Export Data</p>
            <p className="text-text-dim text-xs mb-3">Ekspor tabel ke file Excel atau CSV</p>
            <Button variant="secondary" onClick={() => { setMode('export'); setMessage('') }}>
              <Download className="w-4 h-4 mr-1" /> EXPORT
            </Button>
          </div>
          <div className="p-4 bg-[#0a1520] border border-[rgba(0,245,255,0.1)] rounded-lg text-center">
            <Upload className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <p className="font-bold mb-2">Import Data</p>
            <p className="text-text-dim text-xs mb-3">Impor data dari file Excel atau CSV</p>
            <Button variant="secondary" onClick={() => { setMode('import'); setMessage('') }}>
              <Upload className="w-4 h-4 mr-1" /> IMPORT
            </Button>
          </div>
        </div>
      </Card>

      {renderModal()}
    </div>
  )
}

export default BackupRestorePage