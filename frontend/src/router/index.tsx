import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../modules/auth/LoginPage'
import MasterLayout from '../modules/master/MasterLayout'
import ProdukList from '../modules/master/ProdukList'
import ProdukForm from '../modules/master/ProdukForm'
import SupplierList from '../modules/master/SupplierList'
import PelangganList from '../modules/master/PelangganList'
import WmsPage from '../modules/wms/WmsPage'
import PurchaseOrderList from '../modules/wms/PurchaseOrderList'
import PurchaseOrderForm from '../modules/wms/PurchaseOrderForm'
import InventoryList from '../modules/wms/InventoryList'
import StockOpnameList from '../modules/wms/StockOpnameList'
import MutationHistory from '../modules/wms/MutationHistory'
import HrPage from '../modules/hr/HrPage'
import KaryawanList from '../modules/hr/KaryawanList'
import JadwalShiftList from '../modules/hr/JadwalShiftList'
import AbsensiList from '../modules/hr/AbsensiList'
import GajiList from '../modules/hr/GajiList'
import DeliveryPage from '../modules/delivery/DeliveryPage'
import DeliveryOrderList from '../modules/delivery/DeliveryOrderList'
import DeliveryOrderForm from '../modules/delivery/DeliveryOrderForm'
import SettingsPage from '../modules/settings/SettingsPage'
import KategoriSatuanList from '../modules/master/KategoriSatuanList'

const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'))
const PosPage = lazy(() => import('../modules/pos/PosPage'))
const ReportPage = lazy(() => import('../modules/report/ReportPage'))


const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-neon-cyan text-lg animate-pulse">Loading...</div>
  </div>
)

const AppRouter = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/master" element={<MasterLayout />}>
          <Route index element={<Navigate to="/master/produk" replace />} />
          <Route path="produk" element={<ProdukList />} />
          <Route path="produk/tambah" element={<ProdukForm />} />
          <Route path="produk/edit/:id" element={<ProdukForm />} />
          <Route path="supplier" element={<SupplierList />} />
          <Route path="pelanggan" element={<PelangganList />} />
          <Route path="kategori-satuan" element={<KategoriSatuanList />} />
        </Route>
        <Route path="/wms" element={<WmsPage />}>
          <Route index element={<PurchaseOrderList />} />
          <Route path="po" element={<PurchaseOrderList />} />
          <Route path="mutation" element={<MutationHistory />} /> <Route path="po/tambah" element={<PurchaseOrderForm />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="opname" element={<StockOpnameList />} />
          <Route path="mutation" element={<MutationHistory />} />
        </Route>
        <Route path="/hr" element={<HrPage />}>
          <Route index element={<KaryawanList />} />
          <Route path="karyawan" element={<KaryawanList />} />
          <Route path="jadwal" element={<JadwalShiftList />} />
          <Route path="absensi" element={<AbsensiList />} />
          <Route path="gaji" element={<GajiList />} />
        </Route>
        <Route path="/delivery" element={<DeliveryPage />}>
          <Route index element={<DeliveryOrderList />} />
          <Route path="orders" element={<DeliveryOrderList />} />
          <Route path="orders/tambah" element={<DeliveryOrderForm />} />
        </Route>
        <Route path="/pos" element={<PosPage />} />
        <Route path="/wms" element={<WmsPage />} />
        <Route path="/hr" element={<HrPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
)

export default AppRouter