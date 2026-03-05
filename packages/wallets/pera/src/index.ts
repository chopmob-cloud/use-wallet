import { PeraAdapter } from './adapter'
import type { PeraOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'pera' as const

export function pera(options?: PeraOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: PeraAdapter.defaultMetadata,
    Adapter: PeraAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined,
  }
}

export { PeraAdapter }
export type { PeraOptions }
