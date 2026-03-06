import { WalletConnectAdapter } from './adapter'
import { resolveSkin } from './skins'
import type { WalletConnectOptions } from './adapter'
import type { WalletAdapterConfig } from '@txnlab/use-wallet'

export const WALLET_ID = 'walletconnect' as const

export function walletConnect(options: WalletConnectOptions): WalletAdapterConfig {
  const skin = options.skin ? resolveSkin(options.skin) : null
  const id = skin ? `walletconnect:${skin.id}` : WALLET_ID
  const metadata = skin
    ? { name: skin.name, icon: skin.icon }
    : WalletConnectAdapter.defaultMetadata

  return {
    id,
    metadata,
    Adapter: WalletConnectAdapter as unknown as WalletAdapterConfig['Adapter'],
    options: options as unknown as Record<string, unknown> | undefined
  }
}

export { WalletConnectAdapter }
export { SessionError } from './adapter'
export type { WalletConnectOptions, SignTxnsResponse } from './adapter'

// Skins utilities and types
export { registerSkin, getSkin, resolveSkin, BUILTIN_SKINS } from './skins'
export type { WalletConnectSkin, WalletConnectSkinOption } from './skins'
