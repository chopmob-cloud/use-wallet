import { MnemonicAdapter } from './adapter'
import type { MnemonicOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'mnemonic' as const

export function mnemonic(options?: MnemonicOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: MnemonicAdapter.defaultMetadata,
    Adapter: MnemonicAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined
  }
}

export { MnemonicAdapter }
export type { MnemonicOptions }
