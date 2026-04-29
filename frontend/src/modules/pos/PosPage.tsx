import React, { useEffect, useState } from 'react'
import { usePosStore } from '../../store/posStore'
import { useAuthStore } from '../../store/authStore'
import { produkApi, pelangganApi } from '../../api/master'
import { posApi } from '../../api/pos'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import {
  Search, Plus, Minus, Trash2, ShoppingCart, LogIn, LogOut,
  CreditCard, Banknote, QrCode, Wallet
} from 'lucide-react'

const PosPage: React.FC = () => {
  const store = usePosStore()
  const user = useAuthStore(state => state.user)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [showVoid, setShowVoid] = useState(false)
  const [voidPassword, setVoidPassword] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [showTransactions, setShowTransactions] = useState(false)

  // Untuk memilih pelanggan kredit
  const [pelangganList, setPelangganList] = useState<any[]>([])
  const [selectedPelanggan, setSelectedPelanggan] = useState('')

  // Modal buka/tutup shift
  const [showShiftModal, setShowShiftModal] = useState<'buka' | 'tutup' | null>(null)
  const [shiftInputValue, setShiftInputValue] = useState('')

  useEffect(() => {
    store.fetchShift()
    pelangganApi.getAll().then(res => setPelangganList(res.data))
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return
    try {
      const res = await produkApi.getAll(search)
      setProducts(res.data.filter((p: any) => p.is_active && p.stok > 0))
    } catch (err) { console.error(err) }
  }

  const cartTotal = store.cart.reduce((sum, item) => sum + ((item.harga_jual - item.diskon_per_item) * item.qty), 0)
  const grandTotal = cartTotal - store.diskon_total
  const kembalian = store.jenis_pembayaran === 'tunai' ? store.bayar - grandTotal : 0

  // ── Buka / Tutup shift dengan modal ──
  const handleOpenShiftSubmit = async () => {
    const saldo = parseFloat(shiftInputValue)
    if (isNaN(saldo)) return
    try {
      await store.openShift(saldo)
      setShowShiftModal(null)
      setShiftInputValue('')
    } catch (err: any) {
      alert('Gagal membuka shift: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleCloseShiftSubmit = async () => {
    const setoran = parseFloat(shiftInputValue)
    if (isNaN(setoran)) return
    try {
      await store.closeShift(setoran)
      setShowShiftModal(null)
      setShiftInputValue('')
    } catch (err: any) {
      alert('Gagal menutup shift: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleSubmit = async () => {
    try {
      await store.submitTransaction()
      setShowPayment(false)
    } catch {}
  }

  const handleVoid = async (id: string) => {
    try {
      await posApi.voidTransaksi(id, voidPassword)
      setShowVoid(false)
      setVoidPassword('')
      store.fetchShift()
      loadTransactions()
    } catch (err) { console.error(err) }
  }

  const loadTransactions = async () => {
    try {
      const res = await posApi.getTransaksiList(20)
      setTransactions(res.data)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header POS */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase">
          POS KASIR
        </h1>
        <div className="flex items-center gap-3">
          {store.shift ? (
            <div className="flex items-center gap-2 text-neon-green font-semibold">
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-orbitron">SHIFT AKTIF</span>
              <Button variant="secondary" onClick={() => { setShowShiftModal('tutup'); setShiftInputValue('0') }}>
                <LogOut className="w-4 h-4 mr-1" /> TUTUP SHIFT
              </Button>
            </div>
          ) : (
            <Button onClick={() => { setShowShiftModal('buka'); setShiftInputValue('0') }}>
              <LogIn className="w-4 h-4 mr-1" /> BUKA SHIFT
            </Button>
          )}
          <Button variant="secondary" onClick={() => { loadTransactions(); setShowTransactions(true); }}>
            RIWAYAT
          </Button>
        </div>
      </div>

      {!store.shift && (
        <Card>
          <p className="text-center text-text-dim font-orbitron">Silakan buka shift terlebih dahulu.</p>
        </Card>
      )}

      {store.shift && (
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Panel Kiri – Cari Produk & Keranjang */}
          <div className="flex-1 flex flex-col gap-4 overflow-auto">
            <Card title="CARI PRODUK" glow="cyan">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nama / SKU / Barcode..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}><Search className="w-4 h-4" /></Button>
              </div>
              {products.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-[#0a1520] border border-[rgba(0,245,255,0.1)] p-2 rounded">
                      <div>
                        <p className="text-sm font-semibold">{p.nama}</p>
                        <p className="text-xs text-text-dim">{p.sku} - Rp {Number(p.harga_jual).toLocaleString()}</p>
                      </div>
                      <Button onClick={() => store.addToCart(p)}><Plus className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title={`KERANJANG (${store.cart.length} ITEM)`} glow="cyan" className="flex-1 overflow-auto">
              {store.cart.length === 0 && (
                <p className="text-center text-text-dim py-8 font-orbitron">KERANJANG KOSONG</p>
              )}
              {store.cart.map(item => (
                <div key={item.produk_id} className="flex items-center justify-between py-2 border-b border-[rgba(0,245,255,0.08)]">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.nama}</p>
                    <p className="text-xs text-text-dim">Rp {item.harga_jual.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => store.updateQty(item.produk_id, item.qty - 1)} className="text-text-dim hover:text-neon-cyan"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm w-6 text-center font-mono">{item.qty}</span>
                    <button onClick={() => store.updateQty(item.produk_id, item.qty + 1)} className="text-text-dim hover:text-neon-cyan"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="w-20 text-right">
                    <input
                      type="number"
                      value={item.diskon_per_item}
                      onChange={e => store.updateDiskonItem(item.produk_id, Number(e.target.value))}
                      className="input-neon w-16 text-xs px-1 py-0"
                      placeholder="Diskon"
                    />
                  </div>
                  <div className="w-24 text-right font-mono text-sm text-neon-yellow">
                    Rp {((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}
                  </div>
                  <button onClick={() => store.removeFromCart(item.produk_id)} className="text-[var(--neon-pink)] hover:text-red-400 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </Card>
          </div>

          {/* Panel Kanan – Ringkasan & Pembayaran */}
          <div className="w-80 flex flex-col gap-4">
            <Card title="RINGKASAN" glow="yellow">
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-text-dim">Subtotal</span>
                  <span className="text-text-primary">Rp {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-dim">Diskon Total</span>
                  <input
                    type="number"
                    value={store.diskon_total}
                    onChange={e => store.setDiskonTotal(Number(e.target.value))}
                    className="input-neon w-24 text-right px-2 py-1"
                  />
                </div>
                <hr className="border-[rgba(0,245,255,0.15)]" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-text-dim">Grand Total</span>
                  <span className="text-neon-cyan">Rp {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card title="PEMBAYARAN" glow="green">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['tunai', 'transfer', 'qris', 'kredit'] as const).map(jenis => (
                    <button
                      key={jenis}
                      onClick={() => store.setPembayaran(jenis)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${
                        store.jenis_pembayaran === jenis
                          ? 'border-[var(--neon-cyan)] bg-[rgba(0,245,255,0.1)] text-neon-cyan'
                          : 'border-[rgba(0,245,255,0.15)] text-text-dim hover:border-[rgba(0,245,255,0.4)]'
                      }`}
                    >
                      {jenis === 'tunai' && <Banknote className="w-4 h-4" />}
                      {jenis === 'transfer' && <CreditCard className="w-4 h-4" />}
                      {jenis === 'qris' && <QrCode className="w-4 h-4" />}
                      {jenis === 'kredit' && <Wallet className="w-4 h-4" />}
                      <span>{jenis}</span>
                    </button>
                  ))}
                </div>
                {store.jenis_pembayaran === 'tunai' && (
                  <Input
                    label="UANG PELANGGAN"
                    type="number"
                    value={store.bayar}
                    onChange={e => store.setBayar(Number(e.target.value))}
                  />
                )}
                {store.jenis_pembayaran === 'tunai' && store.bayar > 0 && (
                  <div className="flex justify-between font-bold text-neon-green">
                    <span>KEMBALIAN</span>
                    <span>Rp {kembalian.toLocaleString()}</span>
                  </div>
                )}
                {store.jenis_pembayaran === 'kredit' && (
                  <div>
                    <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim mt-2 block">
                      Pilih Pelanggan
                    </label>
                    <select
                      value={selectedPelanggan}
                      onChange={e => {
                        setSelectedPelanggan(e.target.value)
                        const p = pelangganList.find(p => p.id === e.target.value)
                        store.setPelanggan(e.target.value, p?.nama || '')
                      }}
                      className="input-neon w-full mt-1"
                    >
                      <option value="">-- Pilih --</option>
                      {pelangganList.map(p => (
                        <option key={p.id} value={p.id}>{p.nama} (Limit: Rp {Number(p.limit_kredit).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  className="w-full mt-4"
                  disabled={store.cart.length === 0 || store.loading}
                  onClick={() => setShowPayment(true)}
                >
                  {store.loading ? 'MEMPROSES...' : `BAYAR (Rp ${grandTotal.toLocaleString()})`}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pembayaran */}
      <Modal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        title="KONFIRMASI PEMBAYARAN"
        onConfirm={handleSubmit}
        confirmText="PROSES"
        isLoading={store.loading}
      >
        <p className="text-neon-cyan font-bold text-lg">Grand Total: Rp {grandTotal.toLocaleString()}</p>
        {store.jenis_pembayaran === 'tunai' && <p className="text-text-primary">Bayar: Rp {store.bayar.toLocaleString()} | Kembalian: Rp {kembalian.toLocaleString()}</p>}
        {store.error && <p className="text-[var(--neon-pink)] mt-2">{store.error}</p>}
      </Modal>

      {/* Modal Riwayat & Void */}
      <Modal
        open={showTransactions}
        onClose={() => setShowTransactions(false)}
        title="RIWAYAT TRANSAKSI"
      >
        <div className="max-h-96 overflow-y-auto space-y-2">
          {transactions.map(trx => (
            <div key={trx.id} className="flex justify-between items-center py-2 border-b border-[rgba(0,245,255,0.08)] text-sm">
              <div>
                <p className="font-mono text-neon-cyan">{trx.no_transaksi}</p>
                <p className="text-text-dim">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                <p className={`font-semibold ${trx.status === 'void' ? 'text-[var(--neon-pink)]' : 'text-neon-green'}`}>
                  Rp {Number(trx.total_setelah_diskon).toLocaleString()} - {trx.jenis_pembayaran} ({trx.status})
                </p>
              </div>
              {trx.status !== 'void' && (user?.role === 'super_admin' || user?.role === 'manager') && (
                <Button variant="danger" onClick={() => { setShowVoid(true); setVoidPassword(''); }}>
                  <Trash2 className="w-3 h-3" /> VOID
                </Button>
              )}
            </div>
          ))}
        </div>

        {showVoid && (
          <div className="mt-4 border-t border-[rgba(0,245,255,0.15)] pt-4">
            <p className="text-sm text-text-dim mb-2">Masukkan password otorisasi:</p>
            <Input
              type="password"
              value={voidPassword}
              onChange={e => setVoidPassword(e.target.value)}
              placeholder="Password..."
            />
            <Button variant="danger" className="mt-2 w-full" onClick={() => handleVoid(transactions[0]?.id)}>
              VOID TRANSAKSI
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Buka/Tutup Shift */}
      <Modal
        open={showShiftModal !== null}
        onClose={() => setShowShiftModal(null)}
        title={showShiftModal === 'buka' ? 'BUKA SHIFT' : 'TUTUP SHIFT'}
        onConfirm={showShiftModal === 'buka' ? handleOpenShiftSubmit : handleCloseShiftSubmit}
        confirmText="SIMPAN"
      >
        <div className="space-y-3">
          <p className="text-text-dim text-sm">
            {showShiftModal === 'buka' ? 'Masukkan saldo awal kasir:' : 'Masukkan total setoran fisik:'}
          </p>
          <Input
            label={showShiftModal === 'buka' ? 'Saldo Awal (Rp)' : 'Total Setoran (Rp)'}
            type="number"
            value={shiftInputValue}
            onChange={e => setShiftInputValue(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  )
}

export default PosPage