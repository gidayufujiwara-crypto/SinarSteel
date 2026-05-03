import React, { useEffect, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'

const UpdateNotifier: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.onUpdateAvailable((info: any) => {
      console.log('Update available:', info)
      setUpdateAvailable(true)
      setShowModal(true)
    })
    window.electronAPI.onDownloadProgress((percent: number) => {
      setDownloadProgress(Math.round(percent))
    })
    window.electronAPI.onUpdateDownloaded((info: any) => {
      setUpdateDownloaded(true)
      setUpdateAvailable(false)
      setShowModal(true)
    })
  }, [])

  const handleCheckUpdate = async () => {
    if (!window.electronAPI) {
      alert('Fitur update hanya tersedia di aplikasi desktop.')
      return
    }
    try {
      await window.electronAPI.checkForUpdate()
    } catch (err) {
      console.error('Gagal mengecek update:', err)
      alert('Gagal mengecek update.')
    }
  }

  const handleInstallUpdate = () => {
    if (window.electronAPI) window.electronAPI.installUpdate()
  }

  return (
    <>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={updateDownloaded ? 'UPDATE SIAP DIPASANG' : 'UPDATE TERSEDIA'}
        onConfirm={updateDownloaded ? handleInstallUpdate : handleCheckUpdate}
        confirmText={updateDownloaded ? 'INSTALL SEKARANG' : 'DOWNLOAD'}
        confirmVariant="primary"
      >
        {updateAvailable && !updateDownloaded && (
          <div className="space-y-2">
            <p className="text-text-primary">Versi baru tersedia. Ingin mendownload sekarang?</p>
            {downloadProgress > 0 && (
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-neon-cyan h-2 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
        {updateDownloaded && (
          <p className="text-text-primary">
            Update telah didownload dan siap dipasang. Aplikasi akan dimulai ulang.
          </p>
        )}
      </Modal>
    </>
  )
}

export default UpdateNotifier