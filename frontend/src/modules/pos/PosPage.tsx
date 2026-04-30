import React, { useEffect, useState, useCallback } from 'react'
import { usePosStore } from '../../store/posStore'
import { useAuthStore } from '../../store/authStore'
import { produkApi, pelangganApi } from '../../api/master'
import { posApi, settingsApi } from '../../api/pos'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import StrukModal from '../../components/pos/StrukModal'
import {
  Search, Plus, Minus, Trash2, LogIn, LogOut,
  CreditCard, Banknote, QrCode, Wallet, Truck, RefreshCw, Eye
} from 'lucide-react'

const PosPage: React.FC = () => {
  const store = usePosStore()
  const user = useAuthStore(state => state.user)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [showPayment, setShowPayment] = useState(false)
  const [showVoid, setShowVoid] = useState(false)
  const [voidPin, setVoidPin] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [showTransactions, setShowTransactions] = useState(false)
  const [detailTrx, setDetailTrx] = useState<any>(null)

  const [pelangganList, setPelangganList] = useState<any[]>([])
  const [selectedPelanggan, setSelectedPelanggan] = useState('')

  const [showShiftModal, setShowShiftModal] = useState<'buka' | 'tutup' | null>(null)
  const [shiftInputValue, setShiftInputValue] = useState('')
  const [shiftVariance, setShiftVariance] = useState(0)

  const [metodePengiriman, setMetodePengiriman] = useState<'ambil' | 'kurir'>('ambil')
  const [pengirimanForm, setPengirimanForm] = useState({ nama_penerima: '', alamat: '', kota: '', telepon: '' })

  const [bankInfo, setBankInfo] = useState({ bank: '', rekening: '', atasNama: '', qrisUrl: '' })

  const [strukData, setStrukData] = useState<any>(null)
  const [showStruk, setShowStruk] = useState(false)

  const [returTransaksi, setReturTransaksi] = useState<any>(null)

  useEffect(() => {
    store.fetchShift()
    pelangganApi.getAll().then(res => setPelangganList(res.data))
    settingsApi.getAll().then(res => {
      const map: any = {}
      res.data.forEach((s: any) => { map[s.key] = s.value })
      setBankInfo({
        bank: map.bank_name || 'BCA',
        rekening: map.account_number || '1234567890',
        atasNama: map.account_holder || 'SinarSteel',
        qrisUrl: map.qris_image_url || '/qris-placeholder.png',
      })
    })
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
      let deliveryData = undefined
      if (metodePengiriman === 'kurir') {
        deliveryData = {
          nama_penerima: pengirimanForm.nama_penerima,
          alamat: pengirimanForm.alamat,
          kota: pengirimanForm.kota,
          telepon: pengirimanForm.telepon,
        }
      }
      const trx = await store.submitTransaction(deliveryData)
      setShowPayment(false)
      setStrukData({ transaksi: trx, cart: store.cart, total: cartTotal, diskon: store.diskon_total, grandTotal, pengirimanForm })
      setShowStruk(true)
    } catch {}
  }

  const handleVoidRequest = async (transaksiId: string) => {
    try {
      await posApi.requestVoidPin(transaksiId)
      alert('PIN void telah dikirim ke aplikasi super admin. Masukkan PIN yang diterima.')
      setShowVoid(true)
      setVoidPin('')
    } catch (err: any) {
      alert('Gagal request void: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleVoidConfirm = async (transaksiId: string) => {
    try {
      await posApi.verifyVoidPin(transaksiId, voidPin)
      setShowVoid(false)
      setVoidPin('')
      loadTransactions()
    } catch (err: any) {
      alert('Gagal void: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleRetur = (trx: any) => {
    const items = trx.items.map((item: any) => ({
      produk_id: item.produk_id,
      qty: item.qty,
      diskon_per_item: 0,
    }))
    store.returTransaksi({ transaksi_id: trx.id, items, diskon_total: 0 }).then(() => {
      loadTransactions()
    }).catch((err: any) => alert(err.response?.data?.detail || err.message))
  }

  const loadTransactions = useCallback(async () => {
    try {
      const res = await posApi.getTransaksiList(100)
      setTransactions(res.data)
    } catch {}
  }, [])

  useEffect(() => {
    if (showTransactions) loadTransactions()
  }, [showTransactions, loadTransactions])

  const calculateVariance = () => {
    if (!store.shift) return
    const expected = (store.shift.saldo_awal || 0) + (store.shift.total_tunai || 0)
    const input = parseFloat(shiftInputValue) || 0
    setShiftVariance(input - expected)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary font-orbitron tracking-[2px] uppercase">POS KASIR</h1>
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
          <Button variant="secondary" onClick={() => { setShowTransactions(true) }}>
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
          <div className="flex-1 flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <Card title="CARI PRODUK" glow="cyan">
              <div className="flex gap-2 mb-4">
                <Input placeholder="Nama / SKU / Barcode..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1" />
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

            <Card title={`KERANJANG (${store.cart.length} ITEM)`} glow="cyan" className="flex-1 overflow-auto" style={{ minHeight: 200, maxHeight: '50vh' }}>
              {store.cart.length === 0 && <p className="text-center text-text-dim py-8 font-orbitron">KERANJANG KOSONG</p>}
              {store.cart.map(item => (
                <div key={item.produk_id} className="flex items-center justify-between py-2 border-b border-[rgba(0,245,255,0.08)]">
                  <div className="flex-1"><p className="text-sm font-semibold">{item.nama}</p><p className="text-xs text-text-dim">Rp {item.harga_jual.toLocaleString()}</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => store.updateQty(item.produk_id, item.qty - 1)} className="text-text-dim hover:text-neon-cyan"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm w-6 text-center font-mono">{item.qty}</span>
                    <button onClick={() => store.updateQty(item.produk_id, item.qty + 1)} className="text-text-dim hover:text-neon-cyan"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="w-20 text-right">
                    <input type="number" value={item.diskon_per_item} onChange={e => store.updateDiskonItem(item.produk_id, Number(e.target.value))} className="input-neon w-16 text-xs px-1 py-0" placeholder="Diskon" />
                  </div>
                  <div className="w-24 text-right font-mono text-sm text-neon-yellow">Rp {((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}</div>
                  <button onClick={() => store.removeFromCart(item.produk_id)} className="text-[var(--neon-pink)] hover:text-red-400 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </Card>
          </div>

          <div className="w-80 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            <Card title="RINGKASAN" glow="yellow">
              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between"><span className="text-text-dim">Subtotal</span><span>Rp {cartTotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-text-dim">Diskon Total</span><input type="number" value={store.diskon_total} onChange={e => store.setDiskonTotal(Number(e.target.value))} className="input-neon w-24 text-right px-2 py-1" /></div>
                <hr className="border-[rgba(0,245,255,0.15)]" />
                <div className="flex justify-between font-bold text-lg"><span className="text-text-dim">Grand Total</span><span className="text-neon-cyan">Rp {grandTotal.toLocaleString()}</span></div>
              </div>
            </Card>

            <Card title="PEMBAYARAN" glow="green">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {(['tunai','transfer','qris','cod'] as const).map(jenis => (
                    <button key={jenis} onClick={() => { store.setPembayaran(jenis); if (jenis === 'cod') setMetodePengiriman('kurir') }} className={`flex items-center gap-1 p-2 rounded-lg border text-xs font-bold uppercase transition-all ${store.jenis_pembayaran === jenis ? 'border-[var(--neon-cyan)] bg-[rgba(0,245,255,0.1)] text-neon-cyan' : 'border-[rgba(0,245,255,0.15)] text-text-dim hover:border-[rgba(0,245,255,0.4)]'}`}>
                      {jenis === 'tunai' && <Banknote className="w-4 h-4" />}
                      {jenis === 'transfer' && <CreditCard className="w-4 h-4" />}
                      {jenis === 'qris' && <QrCode className="w-4 h-4" />}
                      {jenis === 'cod' && <Truck className="w-4 h-4" />}
                      <span>{jenis}</span>
                    </button>
                  ))}
                </div>
                {store.jenis_pembayaran === 'tunai' && <Input label="UANG PELANGGAN" type="number" value={store.bayar} onChange={e => store.setBayar(Number(e.target.value))} />}
                {store.jenis_pembayaran === 'tunai' && store.bayar > 0 && <div className="flex justify-between font-bold text-neon-green"><span>KEMBALIAN</span><span>Rp {kembalian.toLocaleString()}</span></div>}
                {store.jenis_pembayaran === 'kredit' && (
                  <div>
                    <label className="text-xs font-semibold tracking-[1px] uppercase text-text-dim mt-2 block">Pilih Pelanggan</label>
                    <select value={selectedPelanggan} onChange={e => { setSelectedPelanggan(e.target.value); const p = pelangganList.find(p => p.id === e.target.value); store.setPelanggan(e.target.value, p?.nama || '') }} className="input-neon w-full mt-1">
                      <option value="">-- Pilih --</option>
                      {pelangganList.map(p => <option key={p.id} value={p.id}>{p.nama} (Limit: Rp {Number(p.limit_kredit).toLocaleString()})</option>)}
                    </select>
                  </div>
                )}
                {(store.jenis_pembayaran === 'transfer' || store.jenis_pembayaran === 'qris') && (
                  <div className="p-3 bg-[#0a1520] border border-[rgba(0,245,255,0.15)] rounded-md text-xs text-text-dim">
                    {store.jenis_pembayaran === 'transfer' ? (
                      <>
                        <p className="text-neon-cyan font-bold mb-2">TRANSFER KE:</p>
                        <p>{bankInfo.bank} | {bankInfo.rekening}</p>
                        <p>{bankInfo.atasNama}</p>
                        <p className="mt-2">Silakan transfer dan konfirmasi setelah selesai.</p>
                      </>
                    ) : (
                      <div className="text-center">
                        <img src={bankInfo.qrisUrl || '/qris-placeholder.png'} alt="QRIS" className="w-32 h-32 mx-auto mb-2 object-contain" />
                        <p>Tunjukkan QR ke pelanggan</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <label className="text-xs font-semibold uppercase text-text-dim">Pengiriman:</label>
                  <select
                    value={metodePengiriman}
                    onChange={e => setMetodePengiriman(e.target.value as 'ambil' | 'kurir')}
                    className="input-neon flex-1"
                  >
                    <option value="ambil">Ambil Sendiri</option>
                    <option value="kurir">Kurir Toko</option>
                  </select>
                </div>
                {metodePengiriman === 'kurir' && (
                  <div className="space-y-2 mt-2">
                    <Input label="Nama Penerima" value={pengirimanForm.nama_penerima} onChange={e => setPengirimanForm({ ...pengirimanForm, nama_penerima: e.target.value })} required />
                    <Input label="Alamat Lengkap" value={pengirimanForm.alamat} onChange={e => setPengirimanForm({ ...pengirimanForm, alamat: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Kota" value={pengirimanForm.kota} onChange={e => setPengirimanForm({ ...pengirimanForm, kota: e.target.value })} required />
                      <Input label="Telepon" value={pengirimanForm.telepon} onChange={e => setPengirimanForm({ ...pengirimanForm, telepon: e.target.value })} />
                    </div>
                  </div>
                )}
                <Button className="w-full mt-4" disabled={store.cart.length === 0 || store.loading} onClick={() => setShowPayment(true)}>
                  {store.loading ? 'MEMPROSES...' : `BAYAR (Rp ${grandTotal.toLocaleString()})`}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="KONFIRMASI PEMBAYARAN" onConfirm={handleSubmit} confirmText="PROSES" isLoading={store.loading}>
        <p className="text-neon-cyan font-bold text-lg">Grand Total: Rp {grandTotal.toLocaleString()}</p>
        {store.jenis_pembayaran === 'tunai' && <p>Bayar: Rp {store.bayar.toLocaleString()} | Kembalian: Rp {kembalian.toLocaleString()}</p>}
        {store.error && <p className="text-[var(--neon-pink)] mt-2">{store.error}</p>}
      </Modal>

      <Modal open={showTransactions} onClose={() => setShowTransactions(false)} title="RIWAYAT TRANSAKSI">
        <div className="max-h-96 overflow-y-auto space-y-2">
          {transactions.length === 0 && <p className="text-text-dim text-center py-4">Tidak ada transaksi</p>}
          {transactions.map(trx => (
            <div key={trx.id} className="flex justify-between items-center py-2 border-b border-[rgba(0,245,255,0.08)] text-sm">
              <div>
                <p className="font-mono text-neon-cyan">{trx.no_transaksi}</p>
                <p className="text-text-dim">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                <p className={`font-semibold ${trx.status === 'void' ? 'text-[var(--neon-pink)]' : trx.status === 'retur' ? 'text-yellow-400' : 'text-neon-green'}`}>
                  Rp {Number(trx.total_setelah_diskon).toLocaleString()} - {trx.jenis_pembayaran} ({trx.status})
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setDetailTrx(trx)}><Eye className="w-3 h-3" /></Button>
                {trx.status !== 'void' && trx.status !== 'retur' && (
                  <>
                    {user?.role === 'super_admin' && (
                      <Button variant="danger" onClick={() => handleVoidRequest(trx.id)}><Trash2 className="w-3 h-3" /> VOID</Button>
                    )}
                    {(user?.role === 'super_admin' || user?.role === 'manager') && (
                      <Button variant="secondary" onClick={() => handleRetur(trx)}><RefreshCw className="w-3 h-3" /> RETUR</Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {showVoid && (
          <div className="mt-4 border-t border-[rgba(0,245,255,0.15)] pt-4">
            <p className="text-sm text-text-dim mb-2">Masukkan PIN dari aplikasi super admin:</p>
            <Input type="text" value={voidPin} onChange={e => setVoidPin(e.target.value)} placeholder="6 digit PIN" maxLength={6} />
            <Button variant="danger" className="mt-2 w-full" onClick={() => handleVoidConfirm(transactions[0]?.id)}>KONFIRMASI VOID</Button>
          </div>
        )}
      </Modal>

      {detailTrx && (
        <Modal open={true} onClose={() => setDetailTrx(null)} title={`DETAIL ${detailTrx.no_transaksi}`}>
          <div className="text-sm space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-text-dim">Tanggal</div><div>{new Date(detailTrx.created_at).toLocaleString('id-ID')}</div>
              <div className="text-text-dim">Pembayaran</div><div className="font-bold">{detailTrx.jenis_pembayaran}</div>
              <div className="text-text-dim">Status</div><div className={`tag ${detailTrx.status === 'selesai' ? 'tag-green' : 'tag-orange'}`}>{detailTrx.status}</div>
            </div>
            <hr className="border-[rgba(0,245,255,0.15)]" />
            <p className="font-bold text-xs uppercase">Item</p>
            <table className="table-neon w-full text-xs">
              <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
              <tbody>
                {detailTrx.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td>{item.produk_id?.substring(0,8) || 'Produk'}</td>
                    <td>{item.qty}</td>
                    <td>Rp {Number(item.harga_satuan).toLocaleString()}</td>
                    <td>Rp {Number(item.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="text-text-dim">Diskon</div><div>Rp {Number(detailTrx.diskon_total).toLocaleString()}</div>
              <div className="text-text-dim">Bayar</div><div>Rp {Number(detailTrx.bayar || detailTrx.total_setelah_diskon).toLocaleString()}</div>
              <div className="text-text-dim">Kembalian</div><div>Rp {Number(detailTrx.kembalian || 0).toLocaleString()}</div>
            </div>
          </div>
        </Modal>
      )}

      <Modal open={showShiftModal !== null} onClose={() => setShowShiftModal(null)} title={showShiftModal === 'buka' ? 'BUKA SHIFT' : 'TUTUP SHIFT'} onConfirm={showShiftModal === 'buka' ? handleOpenShiftSubmit : handleCloseShiftSubmit} confirmText="SIMPAN">
        <Input
          label={showShiftModal === 'buka' ? 'Saldo Awal (Rp)' : 'Total Setoran (Rp)'}
          type="number"
          value={shiftInputValue}
          onChange={e => { setShiftInputValue(e.target.value); if (showShiftModal === 'tutup') calculateVariance() }}
          autoFocus
        />
        {showShiftModal === 'tutup' && (
          <div className="mt-2 text-sm">
            <p>Seharusnya: Rp {( (store.shift?.saldo_awal || 0) + (store.shift?.total_tunai || 0) ).toLocaleString()}</p>
            <p className={shiftVariance < 0 ? 'text-[var(--neon-pink)]' : 'text-neon-green'}>
              Selisih: Rp {shiftVariance.toLocaleString()}
            </p>
          </div>
        )}
      </Modal>

      {strukData && <StrukModal open={showStruk} onClose={() => { setShowStruk(false); store.clearCart() }} {...strukData} />}
    </div>
  )
}

export default PosPage