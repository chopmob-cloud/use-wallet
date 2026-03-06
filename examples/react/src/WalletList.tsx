import { useWallet, type Wallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'

const MAGIC_ID = 'magic'

export function WalletList() {
  const { wallets } = useWallet()
  const [connecting, setConnecting] = useState<string | null>(null)
  const [magicEmail, setMagicEmail] = useState('')

  const handleConnect = async (wallet: Wallet) => {
    try {
      setConnecting(wallet.id)
      if (wallet.id === MAGIC_ID) {
        await wallet.connect({ email: magicEmail })
      } else {
        await wallet.connect()
      }
    } catch (error) {
      console.error(`Failed to connect ${wallet.metadata.name}:`, error)
    } finally {
      setConnecting(null)
    }
  }

  const isMagicConnectDisabled = (wallet: Wallet) => {
    if (wallet.id !== MAGIC_ID) return false
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(magicEmail)
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Wallets</h2>
      {wallets.map((wallet) => (
        <WalletRow
          key={wallet.walletKey}
          wallet={wallet}
          isConnecting={connecting === wallet.id}
          connectDisabled={isMagicConnectDisabled(wallet)}
          onConnect={() => handleConnect(wallet)}
        >
          {wallet.id === MAGIC_ID && !wallet.isConnected && (
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              placeholder="Email address"
              className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          )}
        </WalletRow>
      ))}
    </div>
  )
}

function WalletRow({
  wallet,
  isConnecting,
  connectDisabled,
  onConnect,
  children,
}: {
  wallet: Wallet
  isConnecting: boolean
  connectDisabled: boolean
  onConnect: () => void
  children?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        wallet.isActive
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={wallet.metadata.icon}
          alt={wallet.metadata.name}
          className="h-10 w-10 rounded-lg shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{wallet.metadata.name}</div>
          {wallet.isConnected && wallet.activeAccount && (
            <div className="text-xs text-gray-400 truncate font-mono">
              {wallet.activeAccount.address.slice(0, 8)}...
              {wallet.activeAccount.address.slice(-4)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {wallet.isConnected ? (
            <>
              {!wallet.isActive && (
                <button
                  onClick={() => wallet.setActive()}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => wallet.disconnect()}
                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting || connectDisabled}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
