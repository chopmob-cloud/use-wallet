import { KmdAdapter } from './adapter'
import type { KmdOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'kmd' as const

export function kmd(options?: KmdOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: KmdAdapter.defaultMetadata,
    Adapter: KmdAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined,
  }
}

export { KmdAdapter }
export type { KmdOptions }
