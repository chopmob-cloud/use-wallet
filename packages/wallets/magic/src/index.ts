import { MagicAdapter } from './adapter'
import type { MagicAuthOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'magic' as const

export function magic(options?: MagicAuthOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: MagicAdapter.defaultMetadata,
    Adapter: MagicAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined,
    capabilities: { supportedNetworks: ['mainnet'] }
  }
}

export { MagicAdapter }
export type { MagicAuthOptions, MagicAuthClient } from './adapter'
