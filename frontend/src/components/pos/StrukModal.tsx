import React from 'react'
import Button from '../ui/Button'
import { Printer } from 'lucide-react'

interface StrukModalProps {
  open: boolean
  onClose: () => void
  transaksi: any
  cart: any[]
  total: number
  diskon: number
  grandTotal: number
  alamatPengiriman?: string
  namaPenerima?: string
  kota?: string
  telepon?: string
}

const generateStruk = (data: any, cart: any[], total: number, diskon: number, grandTotal: number) => {
  const store = JSON.parse(localStorage.getItem('storeName') || '""')
  const storeName = store || 'SinarSteel'
  const lines = [
    `   ${storeName}`,
    '=============================',
    `No : ${data.no_transaksi}`,
    `Tgl: ${new Date(data.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
    '-----------------------------',
  ]
  cart.forEach((item) => {
    lines.push(`${item.nama}`)
    lines.push(`${item.qty} x Rp ${item.harga_jual.toLocaleString()} = Rp ${((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}`)
  })
  lines.push('-----------------------------')
  lines.push(`Total    : Rp ${total.toLocaleString()}`)
  if (diskon > 0) lines.push(`Diskon   : Rp ${diskon.toLocaleString()}`)
  lines.push(`Grand Tot: Rp ${grandTotal.toLocaleString()}`)
  lines.push(`Bayar    : ${data.jenis_pembayaran.toUpperCase()}`)
  if (data.bayar) lines.push(`Uang     : Rp ${Number(data.bayar).toLocaleString()}`)
  if (data.kembalian) lines.push(`Kembali  : Rp ${Number(data.kembalian).toLocaleString()}`)
  lines.push('=============================')
  lines.push('   TERIMA KASIH')
  return lines.join('\n')
}

const StrukModal: React.FC<StrukModalProps> = ({
  open, onClose, transaksi, cart, total, diskon, grandTotal,
  alamatPengiriman, namaPenerima, kota, telepon
}) => {
  if (!open) return null

  const handlePrint = () => {
    const text = generateStruk(transaksi, cart, total, diskon, grandTotal)
    if (window.electronAPI?.printReceipt) {
      window.electronAPI.printReceipt(text)
    } else {
      const w = window.open('', '_blank', 'width=300,height=400')
      if (w) {
        w.document.write(`<pre>${text}</pre>`)
        w.document.close()
        w.print()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="card-neon p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-neon-cyan font-orbitron tracking-wider mb-4">STRUK TRANSAKSI</h2>
        <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap mb-4">
          {generateStruk(transaksi, cart, total, diskon, grandTotal)}
        </pre>
        {alamatPengiriman && (
          <div className="border-t border-[rgba(0,245,255,0.2)] pt-3 mt-3 text-sm text-text-primary">
            <p className="font-bold text-neon-cyan mb-1">STRUK PENGIRIMAN</p>
            <p>Penerima: {namaPenerima}</p>
            <p>Alamat  : {alamatPengiriman}</p>
            <p>Kota    : {kota}</p>
            {telepon && <p>Telp    : {telepon}</p>}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <Button variant="primary" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> CETAK</Button>
          <Button variant="secondary" onClick={onClose}>TUTUP</Button>
        </div>
      </div>
    </div>
  )
}

export default StrukModal