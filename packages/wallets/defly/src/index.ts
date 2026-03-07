import { DeflyAdapter } from './adapter'
import type { DeflyOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'defly' as const

export function defly(options?: DeflyOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: DeflyAdapter.defaultMetadata,
    Adapter: DeflyAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined,
    capabilities: { supportedNetworks: ['mainnet', 'testnet'] }
  }
}

export { DeflyAdapter }
export type { DeflyOptions }
