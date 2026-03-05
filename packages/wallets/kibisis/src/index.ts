import { KibisisAdapter } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'kibisis' as const

export function kibisis(): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: KibisisAdapter.defaultMetadata,
    Adapter: KibisisAdapter as unknown as WalletAdapterConfig['Adapter'],
  }
}

export { KibisisAdapter }
