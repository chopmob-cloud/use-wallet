import { Web3AuthAdapter } from './adapter'
import type { Web3AuthOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'web3auth' as const

export function web3auth(options: Web3AuthOptions): WalletAdapterConfig {
  return {
    id: WALLET_ID,
    metadata: Web3AuthAdapter.defaultMetadata,
    Adapter: Web3AuthAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown>,
    capabilities: { supportedNetworks: ['mainnet'] }
  }
}

export { Web3AuthAdapter }
export type { Web3AuthOptions, Web3AuthCustomAuth, Web3AuthCredentials } from './adapter'
