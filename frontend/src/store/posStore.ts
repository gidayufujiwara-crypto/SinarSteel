import { create } from 'zustand'
import { posApi } from '../api/pos'

export interface CartItem {
  produk_id: string
  sku: string
  nama: string
  harga_jual: number
  qty: number
  diskon_per_item: number
  hpp_rata_rata: number
}

interface PosState {
  cart: CartItem[]
  shift: any | null
  pelanggan_id: string | null
  pelanggan_nama: string
  jenis_pembayaran: 'tunai' | 'transfer' | 'qris' | 'kredit' | 'cod'
  diskon_total: number
  bayar: number
  error: string | null
  loading: boolean

  addToCart: (product: any) => void
  removeFromCart: (produk_id: string) => void
  updateQty: (produk_id: string, qty: number) => void
  updateDiskonItem: (produk_id: string, diskon: number) => void
  clearCart: () => void
  setPembayaran: (jenis: 'tunai' | 'transfer' | 'qris' | 'kredit' | 'cod') => void
  setDiskonTotal: (diskon: number) => void
  setBayar: (bayar: number) => void
  setPelanggan: (id: string | null, nama: string) => void
  fetchShift: () => Promise<void>
  openShift: (saldoAwal: number) => Promise<void>
  closeShift: (totalSetoran: number) => Promise<void>
  submitTransaction: (deliveryData?: any) => Promise<any>
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
          hpp_rata_rata: Number(product.hpp_rata_rata || 0),
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

  submitTransaction: async (deliveryData) => {
    set({ loading: true, error: null })
    const state = get()
    const total = state.cart.reduce((sum, item) => sum + ((item.harga_jual - item.diskon_per_item) * item.qty), 0)
    const diskon = state.diskon_total
    const total_after = total - diskon

    const payload: any = {
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
      delivery: deliveryData || undefined,
    }

    try {
      const res = await posApi.createTransaksi(payload)
      set({ loading: false })
      get().clearCart()
      get().fetchShift()
      return res.data
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Gagal menyimpan transaksi'
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