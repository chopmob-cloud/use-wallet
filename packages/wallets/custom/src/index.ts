import { CustomAdapter } from './adapter'
import type { CustomWalletOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'custom' as const

export function custom(options: CustomWalletOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: CustomAdapter.defaultMetadata,
    Adapter: CustomAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown>,
  }
}

export { CustomAdapter }
export type { CustomWalletOptions, CustomProvider } from './adapter'
