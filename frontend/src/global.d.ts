export { }
declare global {
  interface Window {
    electronAPI?: {
      printReceipt: (content: string) => void
    }
  }
}