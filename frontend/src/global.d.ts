export { }
declare global {
  interface Window {
    electronAPI?: {
      printReceipt: (content: string) => void
      onUpdateAvailable: (callback: (info: any) => void) => void
      onDownloadProgress: (callback: (percent: number) => void) => void
      onUpdateDownloaded: (callback: (info: any) => void) => void
      checkForUpdate: () => Promise<any>
      installUpdate: () => Promise<void>
    }
  }
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}