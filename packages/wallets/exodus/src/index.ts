import { ExodusAdapter } from './adapter'
import type { ExodusOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'exodus' as const

export function exodus(options?: ExodusOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: ExodusAdapter.defaultMetadata,
    Adapter: ExodusAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined
  }
}

export { ExodusAdapter }
export type { ExodusOptions }
