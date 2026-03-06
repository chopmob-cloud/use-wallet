import { W3WalletAdapter } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'w3wallet' as const

export function w3wallet(): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: W3WalletAdapter.defaultMetadata,
    Adapter: W3WalletAdapter as unknown as WalletAdapterConfig['Adapter']
  }
}

export { W3WalletAdapter }
export type { W3WalletProvider } from './adapter'
