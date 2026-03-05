import algosdk from 'algosdk'
import { CustomAdapter } from '../adapter'
import { createTestHarness, type WalletState } from '@txnlab/use-wallet/testing'
import type { AdapterStoreAccessor } from '@txnlab/use-wallet/adapter'
import type { Store } from '@tanstack/store'
import type { State } from '@txnlab/use-wallet/testing'
import type { CustomProvider } from '../adapter'

vi.mock('@txnlab/use-wallet/adapter', async (importOriginal) => {
  const original = await importOriginal<typeof import('@txnlab/use-wallet/adapter')>()
  return {
    ...original,
    LogLevel: original.LogLevel,
  }
})

class MockProvider implements CustomProvider {
  constructor() {}
  connect = vi.fn()
  disconnect = vi.fn()
  resumeSession = vi.fn()
  signTransactions = vi.fn()
  transactionSigner = vi.fn()
}

const mockProvider = new MockProvider()

const WALLET_ID = 'custom'

function createWallet(
  store: AdapterStoreAccessor,
  provider: CustomProvider = mockProvider,
): CustomAdapter {
  return new CustomAdapter({
    id: WALLET_ID,
    metadata: CustomAdapter.defaultMetadata,
    store,
    subscribe: vi.fn(),
    getAlgodClient: () => ({}) as any,
    options: { provider } as any,
  })
}

describe('CustomAdapter', () => {
  let wallet: CustomAdapter
  let store: Store<State>
  let accessor: AdapterStoreAccessor

  const account1 = {
    name: 'Account 1',
    address: 'mockAddress1',
  }
  const account2 = {
    name: 'Account 2',
    address: 'mockAddress2',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const harness = createTestHarness(WALLET_ID)
    store = harness.store
    accessor = harness.accessor

    wallet = createWallet(accessor)
  })

  afterEach(async () => {
    await wallet.disconnect()
  })

  describe('constructor', () => {
    it('should throw an error if provider is not defined', () => {
      expect(
        () =>
          new CustomAdapter({
            id: WALLET_ID,
            metadata: CustomAdapter.defaultMetadata,
            store: accessor,
            subscribe: vi.fn(),
            getAlgodClient: () => ({}) as any,
            // @ts-expect-error missing provider
            options: {},
          }),
      ).toThrow('Missing required option: provider')
    })

    it('should set canSignData to true when provider supports signData', () => {
      const providerWithSignData: CustomProvider = {
        connect: vi.fn(),
        signData: vi.fn(),
      }

      const w = createWallet(accessor, providerWithSignData)
      expect(w.canSignData).toBe(true)
    })

    it('should set canSignData to false when provider does not support signData', () => {
      const providerWithoutSignData: CustomProvider = {
        connect: vi.fn(),
      }

      const w = createWallet(accessor, providerWithoutSignData)
      expect(w.canSignData).toBe(false)
    })
  })

  describe('connect', () => {
    it('should return accounts and update store', async () => {
      vi.mocked(mockProvider.connect).mockResolvedValueOnce([account1, account2])

      const accounts = await wallet.connect()

      expect(accounts).toEqual([account1, account2])
      expect(mockProvider.connect).toHaveBeenCalled()
      expect(mockProvider.connect).toHaveBeenCalledWith(undefined)
      expect(wallet.isConnected).toBe(true)
      expect(store.state.wallets[WALLET_ID]).toEqual({
        accounts: [account1, account2],
        activeAccount: account1,
      })
    })

    it('should throw an error if no accounts are found', async () => {
      vi.mocked(mockProvider.connect).mockResolvedValueOnce([])

      await expect(wallet.connect()).rejects.toThrow('No accounts found!')
      expect(wallet.isConnected).toBe(false)
    })

    it('should re-throw an error thrown by provider', async () => {
      vi.mocked(mockProvider.connect).mockRejectedValueOnce(new Error('mock error'))

      await expect(wallet.connect()).rejects.toThrow('mock error')
      expect(wallet.isConnected).toBe(false)
    })

    it('should throw an error if provider.connect is not defined', async () => {
      wallet = createWallet(accessor, {
        // @ts-expect-error connect is intentionally missing
        disconnect: vi.fn(),
      })

      await expect(wallet.connect()).rejects.toThrow('Method not supported: connect')
    })
  })

  describe('disconnect', () => {
    it('should call provider.disconnect and update store', async () => {
      vi.mocked(mockProvider.connect).mockResolvedValueOnce([account1])

      await wallet.connect()
      await wallet.disconnect()

      expect(mockProvider.disconnect).toHaveBeenCalled()
      expect(store.state.wallets[WALLET_ID]).toBeUndefined()
      expect(wallet.isConnected).toBe(false)
    })

    it('should still work if provider.disconnect is not defined', async () => {
      wallet = createWallet(accessor, {
        connect: mockProvider.connect,
        // disconnect is not defined
      })

      vi.mocked(mockProvider.connect).mockResolvedValueOnce([account1])

      await wallet.connect()
      await wallet.disconnect()

      expect(store.state.wallets[WALLET_ID]).toBeUndefined()
      expect(wallet.isConnected).toBe(false)
    })
  })

  describe('resumeSession', () => {
    it('should do nothing if no session is found', async () => {
      await wallet.resumeSession()

      expect(mockProvider.resumeSession).not.toHaveBeenCalled()
      expect(wallet.isConnected).toBe(false)
    })

    it('should call provider.resumeSession if a session is found', async () => {
      const walletState: WalletState = {
        accounts: [account1],
        activeAccount: account1,
      }

      const harness = createTestHarness(WALLET_ID, {
        wallets: { [WALLET_ID]: walletState },
      })
      store = harness.store
      wallet = createWallet(harness.accessor)

      await wallet.resumeSession()

      expect(mockProvider.resumeSession).toHaveBeenCalled()
      expect(wallet.isConnected).toBe(true)
    })

    it('should update the store if provider.resumeSession returns different account(s)', async () => {
      const walletState: WalletState = {
        accounts: [account1],
        activeAccount: account1,
      }

      const harness = createTestHarness(WALLET_ID, {
        wallets: { [WALLET_ID]: walletState },
      })
      store = harness.store
      wallet = createWallet(harness.accessor)

      vi.mocked(mockProvider.resumeSession).mockResolvedValueOnce([account2, account1])

      await wallet.resumeSession()

      expect(store.state.wallets[WALLET_ID]).toEqual({
        accounts: [account2, account1],
        activeAccount: account1,
      })
      expect(wallet.isConnected).toBe(true)
    })

    it('should still work if provider.resumeSession is not defined', async () => {
      const walletState: WalletState = {
        accounts: [account1],
        activeAccount: account1,
      }

      const harness = createTestHarness(WALLET_ID, {
        wallets: { [WALLET_ID]: walletState },
      })
      store = harness.store
      wallet = createWallet(harness.accessor, {
        connect: mockProvider.connect,
        // resumeSession is not defined
      })

      await wallet.resumeSession()

      expect(wallet.isConnected).toBe(true)
    })
  })

  describe('signTransactions', () => {
    const txn = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      suggestedParams: {
        fee: 0,
        firstValid: 51,
        lastValid: 61,
        minFee: 1000,
        genesisID: 'mainnet-v1.0',
      },
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 1000,
      },
    })

    const txnGroup = [txn]
    const indexesToSign = [0]

    it('should call provider.signTransactions', async () => {
      await wallet.signTransactions(txnGroup, indexesToSign)

      expect(mockProvider.signTransactions).toHaveBeenCalled()
      expect(mockProvider.signTransactions).toHaveBeenCalledWith(txnGroup, indexesToSign)
    })

    it('should throw an error if provider.signTransactions is not defined', async () => {
      wallet = createWallet(accessor, {
        connect: mockProvider.connect,
        // signTransactions is not defined
        transactionSigner: mockProvider.transactionSigner,
      })

      await expect(wallet.signTransactions(txnGroup, indexesToSign)).rejects.toThrow(
        'Method not supported: signTransactions',
      )
    })
  })

  describe('transactionSigner', () => {
    const txn = new algosdk.Transaction({
      type: algosdk.TransactionType.pay,
      sender: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
      suggestedParams: {
        fee: 10,
        firstValid: 51,
        lastValid: 61,
        minFee: 10,
      },
      paymentParams: {
        receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
        amount: 1000,
      },
    })

    const txnGroup = [txn]
    const indexesToSign = [0]

    it('should call provider.transactionSigner', async () => {
      await wallet.transactionSigner(txnGroup, indexesToSign)

      expect(mockProvider.transactionSigner).toHaveBeenCalled()
      expect(mockProvider.transactionSigner).toHaveBeenCalledWith(txnGroup, indexesToSign)
    })

    it('should throw an error if provider.transactionSigner is not defined', async () => {
      wallet = createWallet(accessor, {
        connect: mockProvider.connect,
        signTransactions: mockProvider.signTransactions,
        // transactionSigner is not defined
      })

      await expect(wallet.transactionSigner(txnGroup, indexesToSign)).rejects.toThrow(
        'Method not supported: transactionSigner',
      )
    })
  })
})
