import { LuteAdapter } from './adapter'
import type { LuteConnectOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'lute' as const

export function lute(options?: LuteConnectOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: LuteAdapter.defaultMetadata,
    Adapter: LuteAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined,
  }
}

export { LuteAdapter }
export type { LuteConnectOptions }
