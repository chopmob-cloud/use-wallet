import algosdk from 'algosdk'
import { logger } from 'src/logger'
import { DEFAULT_NETWORK_CONFIG, NetworkConfigBuilder } from 'src/network'
import { LOCAL_STORAGE_KEY, PersistedState, State, DEFAULT_STATE } from 'src/store'
import { WalletManager } from 'src/manager'
import { StorageAdapter } from 'src/storage'
import { BaseWallet } from 'src/wallets/base'
import type { AdapterConstructorParams, WalletAdapterConfig } from 'src/wallets/types'
import type { Mock } from 'vitest'

vi.mock('src/logger', () => {
  const mockLogger = {
    createScopedLogger: vi.fn().mockReturnValue({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
  return {
    Logger: {
      setLevel: vi.fn()
    },
    LogLevel: {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    },
    logger: mockLogger
  }
})

// Mock storage adapter
vi.mock('src/storage', () => ({
  StorageAdapter: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}))

// Suppress console output
vi.spyOn(console, 'info').mockImplementation(() => {})

// Mock console.warn
let mockLoggerWarn: Mock
let mockLoggerError: Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockLoggerWarn = vi.fn()
  mockLoggerError = vi.fn()
  vi.mocked(logger.createScopedLogger).mockReturnValue({
    debug: vi.fn(),
    info: vi.fn(),
    warn: mockLoggerWarn,
    error: mockLoggerError
  })
})

// ---------- Test adapter classes ----------------------------------- //

class MockDeflyAdapter extends BaseWallet {
  static defaultMetadata = { name: 'Defly', icon: 'icon-data' }
  public resumeSession = vi.fn().mockResolvedValue(undefined)
  public disconnect = vi.fn().mockResolvedValue(undefined)
  public connect = vi.fn().mockResolvedValue([])
  public signTransactions = vi.fn().mockResolvedValue([])

  constructor(params: AdapterConstructorParams) {
    super(params)
  }
}

class MockKibisisAdapter extends BaseWallet {
  static defaultMetadata = { name: 'Kibisis', icon: 'icon-data' }
  public resumeSession = vi.fn().mockResolvedValue(undefined)
  public disconnect = vi.fn().mockResolvedValue(undefined)
  public connect = vi.fn().mockResolvedValue([])
  public signTransactions = vi.fn().mockResolvedValue([])

  constructor(params: AdapterConstructorParams) {
    super(params)
  }
}

// ---------- Factory functions -------------------------------------- //

function defly(): WalletAdapterConfig {
  return {
    id: 'defly',
    metadata: MockDeflyAdapter.defaultMetadata,
    Adapter: MockDeflyAdapter
  }
}

function kibisis(): WalletAdapterConfig {
  return {
    id: 'kibisis',
    metadata: MockKibisisAdapter.defaultMetadata,
    Adapter: MockKibisisAdapter
  }
}

describe('WalletManager', () => {
  let mockInitialState: State | null = null

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(StorageAdapter.getItem).mockImplementation((key: string) => {
      if (key === LOCAL_STORAGE_KEY && mockInitialState !== null) {
        return JSON.stringify(mockInitialState)
      }
      return null
    })

    // Reset to null before each test
    mockInitialState = null
  })

  describe('constructor', () => {
    it('initializes with default networks', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.wallets.length).toBe(2)
      expect(manager.activeNetwork).toBe('testnet')
      expect(manager.networkConfig).toHaveProperty('mainnet')
      expect(manager.networkConfig).toHaveProperty('testnet')
    })

    it('initializes with custom network configurations', () => {
      const networks = new NetworkConfigBuilder()
        .mainnet({
          algod: {
            token: 'custom-token',
            baseServer: 'https://custom-server.com',
            headers: { 'X-API-Key': 'key' }
          }
        })
        .build()

      const manager = new WalletManager({
        wallets: [defly(), kibisis()],
        networks,
        defaultNetwork: 'mainnet'
      })

      expect(manager.activeNetwork).toBe('mainnet')
      expect(manager.networkConfig.mainnet.algod).toEqual({
        token: 'custom-token',
        baseServer: 'https://custom-server.com',
        headers: { 'X-API-Key': 'key' }
      })
    })
  })

  describe('initializeWallets', () => {
    it('initializes wallets from WalletAdapterConfig array', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.wallets.length).toBe(2)
    })

    it('skips duplicate wallet keys', () => {
      const manager = new WalletManager({
        wallets: [defly(), defly()]
      })
      expect(manager.wallets.length).toBe(1)
    })
  })

  describe('setActiveNetwork', () => {
    it('sets active network correctly', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      await manager.setActiveNetwork('mainnet')
      expect(manager.activeNetwork).toBe('mainnet')
    })

    it('throws error for invalid network', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      await expect(manager.setActiveNetwork('invalid')).rejects.toThrow(
        'Network "invalid" not found in network configuration'
      )
    })
  })

  describe('updateAlgodConfig', () => {
    it('updates algod configuration for a network', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      const newConfig = {
        token: 'new-token',
        baseServer: 'https://new-server.com',
        port: '443',
        headers: { 'X-API-Key': 'new-key' }
      }

      manager.updateAlgodConfig('mainnet', newConfig)

      expect(manager.networkConfig.mainnet.algod).toEqual(newConfig)
    })

    it('throws error for non-existent network', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      expect(() =>
        manager.updateAlgodConfig('invalid-network', {
          token: 'new-token',
          baseServer: 'https://new-server.com'
        })
      ).toThrow('Network "invalid-network" not found in network configuration')
    })
  })

  describe('subscribe', () => {
    it('adds and removes a subscriber', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      const callback = vi.fn()
      const unsubscribe = manager.subscribe(callback)

      // Trigger a state change
      await manager.setActiveNetwork('mainnet')

      expect(callback).toHaveBeenCalled()

      unsubscribe()
      // Trigger another state change
      manager.setActiveNetwork('betanet')

      expect(callback).toHaveBeenCalledTimes(1) // Should not be called again
    })
  })

  describe('loadPersistedState', () => {
    beforeEach(() => {
      mockInitialState = {
        wallets: {
          kibisis: {
            accounts: [
              {
                name: 'Kibisis 1',
                address: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q'
              }
            ],
            activeAccount: {
              name: 'Kibisis 1',
              address: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q'
            }
          }
        },
        activeWallet: 'kibisis',
        activeNetwork: 'betanet',
        algodClient: new algosdk.Algodv2('', 'https://betanet-api.4160.nodely.dev/'),
        managerStatus: 'ready',
        networkConfig: DEFAULT_NETWORK_CONFIG,
        customNetworkConfigs: {}
      }
    })

    it('loads persisted state correctly', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.activeWallet?.id).toBe('kibisis')
      expect(manager.activeNetwork).toBe('betanet')
    })

    it('returns null if no persisted state', () => {
      mockInitialState = null

      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      expect(manager.store.state).toEqual(DEFAULT_STATE)
      expect(manager.activeWallet).toBeNull()
      expect(manager.activeNetwork).toBe('testnet')
    })

    it('returns null and logs warning and error if persisted state is invalid', () => {
      const invalidState = { invalid: 'state' }
      vi.mocked(StorageAdapter.getItem).mockReturnValueOnce(JSON.stringify(invalidState))

      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      expect(mockLoggerWarn).toHaveBeenCalledWith('Parsed state:', invalidState)
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Could not load state from local storage: Persisted state is invalid'
      )
      expect(manager.store.state).toEqual(DEFAULT_STATE)
    })
  })

  describe('savePersistedState', () => {
    it('saves state to local storage', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      await manager.setActiveNetwork('mainnet')

      const expectedState: PersistedState = {
        wallets: {},
        activeWallet: null,
        activeNetwork: 'mainnet',
        customNetworkConfigs: {}
      }

      expect(vi.mocked(StorageAdapter.setItem)).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY,
        JSON.stringify(expectedState)
      )
    })
  })

  describe('activeWallet', () => {
    beforeEach(() => {
      mockInitialState = {
        wallets: {
          kibisis: {
            accounts: [
              {
                name: 'Kibisis 1',
                address: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q'
              }
            ],
            activeAccount: {
              name: 'Kibisis 1',
              address: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q'
            }
          }
        },
        activeWallet: 'kibisis',
        activeNetwork: 'betanet',
        algodClient: new algosdk.Algodv2('', 'https://betanet-api.4160.nodely.dev/'),
        managerStatus: 'ready',
        networkConfig: DEFAULT_NETWORK_CONFIG,
        customNetworkConfigs: {}
      }
    })

    it('returns the active wallet', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.activeWallet?.id).toBe('kibisis')
    })

    it('returns null if no active wallet', () => {
      mockInitialState = null

      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.activeWallet).toBeNull()
    })

    it('returns active wallet accounts', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.activeWalletAccounts?.length).toBe(1)
      expect(manager.activeWalletAddresses).toEqual([
        '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q'
      ])
    })

    it('removes wallets in state that are not in config', () => {
      const manager = new WalletManager({
        wallets: [defly()]
      })
      expect(manager.wallets.length).toBe(1)
      expect(manager.wallets[0]?.id).toBe('defly')
      expect(manager.activeWallet).toBeNull()
    })
  })

  describe('Transaction Signing', () => {
    it('throws error if no active wallet', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(() => manager.signTransactions).toThrow()
    })
  })

  describe('status', () => {
    it('returns initializing by default', () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })
      expect(manager.status).toBe('initializing')
      expect(manager.isReady).toBe(false)
    })

    it('changes to ready after resumeSessions', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      expect(manager.status).toBe('initializing')
      await manager.resumeSessions()
      expect(manager.status).toBe('ready')
      expect(manager.isReady).toBe(true)
    })
  })

  describe('resumeSessions', () => {
    it('resumes sessions for all wallets', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      expect(manager.status).toBe('initializing')
      await manager.resumeSessions()

      for (const wallet of manager.wallets) {
        expect(wallet.resumeSession).toHaveBeenCalled()
      }
      expect(manager.status).toBe('ready')
    })
  })

  describe('disconnect', () => {
    it('disconnects all connected wallets', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      // Mock isConnected to return true
      for (const wallet of manager.wallets) {
        vi.spyOn(wallet, 'isConnected', 'get').mockReturnValue(true)
      }

      await manager.disconnect()

      for (const wallet of manager.wallets) {
        expect(wallet.disconnect).toHaveBeenCalled()
      }
    })

    it('does not call disconnect on wallets that are not connected', async () => {
      const manager = new WalletManager({
        wallets: [defly(), kibisis()]
      })

      // Mock isConnected to return false
      for (const wallet of manager.wallets) {
        vi.spyOn(wallet, 'isConnected', 'get').mockReturnValue(false)
      }

      await manager.disconnect()

      for (const wallet of manager.wallets) {
        expect(wallet.disconnect).not.toHaveBeenCalled()
      }
    })
  })

  describe('events', () => {
    it('emits ready event after resumeSessions', async () => {
      const manager = new WalletManager({
        wallets: [defly()]
      })

      const handler = vi.fn()
      manager.on('ready', handler)

      await manager.resumeSessions()

      expect(handler).toHaveBeenCalled()
    })

    it('emits networkChanged event', async () => {
      const manager = new WalletManager({
        wallets: [defly()]
      })

      const handler = vi.fn()
      manager.on('networkChanged', handler)

      await manager.setActiveNetwork('mainnet')

      expect(handler).toHaveBeenCalledWith({ networkId: 'mainnet' })
    })

    it('returns unsubscribe function', async () => {
      const manager = new WalletManager({
        wallets: [defly()]
      })

      const handler = vi.fn()
      const unsubscribe = manager.on('networkChanged', handler)

      await manager.setActiveNetwork('mainnet')
      expect(handler).toHaveBeenCalledTimes(1)

      unsubscribe()
      await manager.setActiveNetwork('testnet')
      expect(handler).toHaveBeenCalledTimes(1) // Not called again
    })
  })

  describe('options', () => {
    describe('resetNetwork', () => {
      it('uses the default network when resetNetwork is true, ignoring persisted state', () => {
        mockInitialState = {
          wallets: {},
          activeWallet: null,
          activeNetwork: 'mainnet',
          algodClient: new algosdk.Algodv2('', 'https://mainnet-api.4160.nodely.dev'),
          managerStatus: 'ready',
          networkConfig: DEFAULT_NETWORK_CONFIG,
          customNetworkConfigs: {}
        }

        const manager = new WalletManager({
          wallets: [],
          defaultNetwork: 'testnet',
          options: { resetNetwork: true }
        })

        expect(manager.activeNetwork).toBe('testnet')
      })

      it('uses the persisted network when resetNetwork is false', () => {
        mockInitialState = {
          wallets: {},
          activeWallet: null,
          activeNetwork: 'mainnet',
          algodClient: new algosdk.Algodv2('', 'https://mainnet-api.4160.nodely.dev'),
          managerStatus: 'ready',
          networkConfig: DEFAULT_NETWORK_CONFIG,
          customNetworkConfigs: {}
        }

        const manager = new WalletManager({
          wallets: [],
          defaultNetwork: 'testnet',
          options: { resetNetwork: false }
        })

        expect(manager.activeNetwork).toBe('mainnet')
      })
    })
  })
})
