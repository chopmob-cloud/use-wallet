import { DeflyWebAdapter } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'defly-web' as const

export function deflyWeb(): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: DeflyWebAdapter.defaultMetadata,
    Adapter: DeflyWebAdapter as unknown as WalletAdapterConfig['Adapter'],
  }
}

export { DeflyWebAdapter }
