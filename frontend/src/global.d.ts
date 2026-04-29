export {}

declare global {
  interface Window {
    electronAPI?: {
      printReceipt: (content: string) => Promise<{ success: boolean }>
      printLabel: () => Promise<{ success: boolean }>
      getAppVersion: () => Promise<string>
      platform: string
    }
  }
}