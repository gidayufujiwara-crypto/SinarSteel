import React from 'react'
import Card from '../../components/ui/Card'

const LedgerPage: React.FC = () => {
  return (
    <Card title="BUKU BESAR" glow="cyan">
      <p className="text-text-dim text-center py-8">Fitur Buku Besar akan dikembangkan lebih lanjut.</p>
      <p className="text-text-dim text-center text-xs">Menampilkan saldo per akun berdasarkan jurnal yang telah dicatat.</p>
    </Card>
  )
}

export default LedgerPage