import { create } from 'zustand'
import { posApi } from '../api/pos'

export interface CartItem {
  produk_id: string
  sku: string
  nama: string
  harga_jual: number
  qty: number
  diskon_per_item: number
  hpp_rata_rata: number   // ← BARU
}

interface PosState {
  cart: CartItem[]
  shift: any | null
  pelanggan_id: string | null
  pelanggan_nama: string
  jenis_pembayaran: 'tunai' | 'transfer' | 'qris' | 'kredit'
  diskon_total: number
  bayar: number
  error: string | null
  loading: boolean

  addToCart: (product: any) => void
  removeFromCart: (produk_id: string) => void
  updateQty: (produk_id: string, qty: number) => void
  updateDiskonItem: (produk_id: string, diskon: number) => void
  clearCart: () => void
  setPembayaran: (jenis: 'tunai' | 'transfer' | 'qris' | 'kredit') => void
  setDiskonTotal: (diskon: number) => void
  setBayar: (bayar: number) => void
  setPelanggan: (id: string | null, nama: string) => void
  fetchShift: () => Promise<void>
  openShift: (saldoAwal: number) => Promise<void>
  closeShift: (totalSetoran: number) => Promise<void>
  submitTransaction: () => Promise<any>
  reset: () => void
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  shift: null,
  pelanggan_id: null,
  pelanggan_nama: '',
  jenis_pembayaran: 'tunai',
  diskon_total: 0,
  bayar: 0,
  error: null,
  loading: false,

  addToCart: (product) => {
    const cart = get().cart
    const existing = cart.find(item => item.produk_id === product.id)
    if (existing) {
      set({
        cart: cart.map(item =>
          item.produk_id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      })
    } else {
      set({
        cart: [...cart, {
          produk_id: product.id,
          sku: product.sku,
          nama: product.nama,
          harga_jual: Number(product.harga_jual),
          qty: 1,
          diskon_per_item: 0,
          hpp_rata_rata: Number(product.hpp_rata_rata || 0),  // ← BARU
        }],
      })
    }
  },

  removeFromCart: (produk_id) => {
    set({ cart: get().cart.filter(item => item.produk_id !== produk_id) })
  },

  updateQty: (produk_id, qty) => {
    if (qty <= 0) {
      get().removeFromCart(produk_id)
      return
    }
    set({
      cart: get().cart.map(item =>
        item.produk_id === produk_id ? { ...item, qty } : item
      ),
    })
  },

  updateDiskonItem: (produk_id, diskon) => {
    set({
      cart: get().cart.map(item =>
        item.produk_id === produk_id ? { ...item, diskon_per_item: diskon } : item
      ),
    })
  },

  clearCart: () => set({ cart: [], diskon_total: 0, bayar: 0, pelanggan_id: null, pelanggan_nama: '' }),

  setPembayaran: (jenis) => set({ jenis_pembayaran: jenis }),
  setDiskonTotal: (diskon) => set({ diskon_total: diskon }),
  setBayar: (bayar) => set({ bayar }),
  setPelanggan: (id, nama) => set({ pelanggan_id: id, pelanggan_nama: nama }),

  fetchShift: async () => {
    try {
      const res = await posApi.getCurrentShift()
      set({ shift: res.data })
    } catch {
      set({ shift: null })
    }
  },

  openShift: async (saldoAwal) => {
    const res = await posApi.openShift({ saldo_awal: saldoAwal })
    set({ shift: res.data })
  },

  closeShift: async (totalSetoran) => {
    try {
      await posApi.closeShift({ total_setoran: totalSetoran })
      set({ shift: null })
    } catch (err) {
      console.error(err)
      throw err
    }
  },

  submitTransaction: async () => {
    set({ loading: true, error: null })
    const state = get()
    const total = state.cart.reduce((sum, item) => sum + ((item.harga_jual - item.diskon_per_item) * item.qty), 0)
    const diskon = state.diskon_total
    const total_after = total - diskon

    const payload = {
      pelanggan_id: state.pelanggan_id || null,
      jenis_pembayaran: state.jenis_pembayaran,
      items: state.cart.map(item => ({
        produk_id: item.produk_id,
        qty: item.qty,
        diskon_per_item: item.diskon_per_item,
      })),
      diskon_total: diskon,
      bayar: state.jenis_pembayaran === 'tunai' ? state.bayar : null,
      catatan: '',
    }

    try {
      const res = await posApi.createTransaksi(payload)
      if (window.electronAPI?.printReceipt) {
        const struk = generateStruk(res.data, state.cart, total, diskon, total_after)
        window.electronAPI.printReceipt(struk)
      }
      set({ loading: false })
      get().clearCart()
      get().fetchShift()
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Gagal menyimpan transaksi'
      set({ loading: false, error: msg })
      throw err
    }
  },

  reset: () => set({
    cart: [],
    pelanggan_id: null,
    pelanggan_nama: '',
    jenis_pembayaran: 'tunai',
    diskon_total: 0,
    bayar: 0,
    error: null,
  }),
}))

function generateStruk(trx: any, cart: CartItem[], total: number, diskon: number, total_after: number): string {
  const storeName = localStorage.getItem('storeName') || 'SinarSteel'
  const storeAddress = localStorage.getItem('storeAddress') || ''
  const storePhone = localStorage.getItem('storePhone') || ''

  const lines = [
    `   ${storeName}`,
    storeAddress ? `   ${storeAddress}` : '',
    storePhone ? `   Telp: ${storePhone}` : '',
    '=============================',
    `No Transaksi: ${trx.no_transaksi}`,
    `Tanggal: ${new Date(trx.created_at).toLocaleString('id-ID')}`,
    '=============================',
  ]

  cart.forEach(item => {
    lines.push(`${item.nama} (${item.sku})`)
    lines.push(`   ${item.qty} x ${item.harga_jual.toLocaleString()} = ${((item.harga_jual - item.diskon_per_item) * item.qty).toLocaleString()}`)
    if (item.diskon_per_item > 0) {
      lines.push(`   (Diskon @${item.diskon_per_item.toLocaleString()})`)
    }
  })

  lines.push('-----------------------------')
  lines.push(`Total: ${total.toLocaleString()}`)
  if (diskon > 0) lines.push(`Diskon: ${diskon.toLocaleString()}`)
  lines.push(`Grand Total: ${total_after.toLocaleString()}`)
  lines.push(`Pembayaran: ${trx.jenis_pembayaran.toUpperCase()}`)
  if (trx.bayar) lines.push(`Bayar: ${Number(trx.bayar).toLocaleString()}`)
  if (trx.kembalian !== null) lines.push(`Kembalian: ${Number(trx.kembalian).toLocaleString()}`)
  lines.push('=============================')
  lines.push('   Terima Kasih')
  lines.push(' ')

  return lines.join('\n')
}