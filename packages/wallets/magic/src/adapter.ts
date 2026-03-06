import algosdk from 'algosdk'
import {
  BaseWallet,
  base64ToByteArray,
  byteArrayToBase64,
  flattenTxnGroup,
  isSignedTxn,
  isTransactionArray,
  type AdapterConstructorParams,
  type WalletAccount,
  type WalletMetadata,
  type WalletState,
  type WalletTransaction,
} from '@txnlab/use-wallet/adapter'
import type { AlgorandExtension } from '@magic-ext/algorand'
import type { InstanceWithExtensions, MagicUserMetadata, SDKBase } from 'magic-sdk'

/** @see https://magic.link/docs/blockchains/other-chains/other/algorand */

export interface MagicAuthOptions {
  apiKey?: string
}

export type MagicAuthClient = InstanceWithExtensions<
  SDKBase,
  {
    algorand: AlgorandExtension
  }
>

type SignTxnsResult = (string | undefined)[]

import { icon } from './icon'

const ICON = `data:image/svg+xml;base64,${btoa(icon)}`

export class MagicAdapter extends BaseWallet<MagicAuthOptions> {
  private client: MagicAuthClient | null = null

  public userInfo: MagicUserMetadata | null = null

  constructor(params: AdapterConstructorParams<MagicAuthOptions>) {
    super(params)
    if (!params.options?.apiKey) {
      this.logger.error('Missing required option: apiKey')
      throw new Error('Missing required option: apiKey')
    }
  }

  static defaultMetadata: WalletMetadata = {
    name: 'Magic',
    icon: ICON,
  }

  private async initializeClient(): Promise<MagicAuthClient> {
    this.logger.info('Initializing client...')
    const Magic = (await import('magic-sdk')).Magic
    const AlgorandExtension = (await import('@magic-ext/algorand')).AlgorandExtension
    const client = new Magic(this.options!.apiKey as string, {
      extensions: {
        algorand: new AlgorandExtension({
          rpcUrl: '',
        }),
      },
    })
    this.client = client
    this.logger.info('Client initialized')
    return client
  }

  public connect = async (args?: Record<string, any>): Promise<WalletAccount[]> => {
    this.logger.info('Connecting...')
    if (!args?.email || typeof args.email !== 'string') {
      this.logger.error('Magic Link provider requires an email (string) to connect')
      throw new Error('Magic Link provider requires an email (string) to connect')
    }

    const { email } = args

    const client = this.client || (await this.initializeClient())

    this.logger.info(`Logging in ${email}...`)
    await client.auth.loginWithMagicLink({ email })

    const userInfo = await client.user.getInfo()

    if (!userInfo) {
      this.logger.error('User info not found!')
      throw new Error('User info not found!')
    }

    const publicAddress = userInfo.wallets?.algorand?.publicAddress

    if (!publicAddress) {
      this.logger.error('No account found!')
      throw new Error('No account found!')
    }

    this.userInfo = userInfo

    this.logger.info('Login successful', userInfo)
    const walletAccount: WalletAccount = {
      name: userInfo.email ?? 'Magic Wallet 1',
      address: publicAddress,
    }

    const walletState: WalletState = {
      accounts: [walletAccount],
      activeAccount: walletAccount,
    }

    this.store.addWallet(walletState)

    this.logger.info('Connected successfully', walletState)
    return [walletAccount]
  }

  public disconnect = async (): Promise<void> => {
    this.logger.info('Disconnecting...')
    this.onDisconnect()
    const client = this.client || (await this.initializeClient())
    this.logger.info(`Logging out ${this.userInfo?.email || 'user'}...`)
    await client.user.logout()
    this.logger.info('Disconnected')
  }

  public resumeSession = async (): Promise<void> => {
    try {
      const walletState = this.store.getWalletState()

      // No session to resume
      if (!walletState) {
        this.logger.info('No session to resume')
        return
      }

      this.logger.info('Resuming session...')
      const client = this.client || (await this.initializeClient())
      const isLoggedIn = await client.user.isLoggedIn()

      if (!isLoggedIn) {
        this.logger.warn('Not logged in, please reconnect...')
        this.onDisconnect()
        return
      }

      const userInfo = await client.user.getInfo()

      if (!userInfo) {
        await client.user.logout()
        this.logger.error('User info not found!')
        throw new Error('User info not found!')
      }

      const publicAddress = userInfo.wallets?.algorand?.publicAddress

      if (!publicAddress) {
        await client.user.logout()
        this.logger.error('No account found!')
        throw new Error('No account found!')
      }

      this.userInfo = userInfo

      const walletAccount: WalletAccount = {
        name: userInfo.email ?? `${this.metadata.name} Account 1`,
        address: publicAddress,
      }

      const storedAccount = walletState.accounts[0]

      const { name, address } = walletAccount
      const { name: storedName, address: storedAddress } = storedAccount

      const match = name === storedName && address === storedAddress

      if (!match) {
        this.logger.warn('Session account mismatch, updating account', {
          prev: storedAccount,
          current: walletAccount,
        })
        this.store.setAccounts([walletAccount])
      }
      this.logger.info('Session resumed successfully')
    } catch (error: any) {
      this.logger.error('Error resuming session:', error.message)
      this.onDisconnect()
      throw error
    }
  }

  private processTxns(
    txnGroup: algosdk.Transaction[],
    indexesToSign?: number[],
  ): WalletTransaction[] {
    const txnsToSign: WalletTransaction[] = []

    txnGroup.forEach((txn, index) => {
      const isIndexMatch = !indexesToSign || indexesToSign.includes(index)
      const signer = txn.sender.toString()
      const canSignTxn = this.addresses.includes(signer)

      const txnString = byteArrayToBase64(txn.toByte())

      if (isIndexMatch && canSignTxn) {
        txnsToSign.push({ txn: txnString })
      } else {
        txnsToSign.push({ txn: txnString, signers: [] })
      }
    })

    return txnsToSign
  }

  private processEncodedTxns(
    txnGroup: Uint8Array[],
    indexesToSign?: number[],
  ): WalletTransaction[] {
    const txnsToSign: WalletTransaction[] = []

    txnGroup.forEach((txnBuffer, index) => {
      const decodedObj = algosdk.msgpackRawDecode(txnBuffer)
      const isSigned = isSignedTxn(decodedObj)

      const txn: algosdk.Transaction = isSigned
        ? algosdk.decodeSignedTransaction(txnBuffer).txn
        : algosdk.decodeUnsignedTransaction(txnBuffer)

      const isIndexMatch = !indexesToSign || indexesToSign.includes(index)
      const signer = txn.sender.toString()
      const canSignTxn = !isSigned && this.addresses.includes(signer)

      const txnString = byteArrayToBase64(txn.toByte())

      if (isIndexMatch && canSignTxn) {
        txnsToSign.push({ txn: txnString })
      } else {
        txnsToSign.push({ txn: txnString, signers: [] })
      }
    })

    return txnsToSign
  }

  public signTransactions = async <T extends algosdk.Transaction[] | Uint8Array[]>(
    txnGroup: T | T[],
    indexesToSign?: number[],
  ): Promise<(Uint8Array | null)[]> => {
    try {
      this.logger.debug('Signing transactions...', { txnGroup, indexesToSign })
      let txnsToSign: WalletTransaction[] = []

      // Determine type and process transactions for signing
      if (isTransactionArray(txnGroup)) {
        const flatTxns: algosdk.Transaction[] = flattenTxnGroup(txnGroup)
        txnsToSign = this.processTxns(flatTxns, indexesToSign)
      } else {
        const flatTxns: Uint8Array[] = flattenTxnGroup(txnGroup as Uint8Array[])
        txnsToSign = this.processEncodedTxns(flatTxns, indexesToSign)
      }

      const client = this.client || (await this.initializeClient())

      this.logger.debug('Sending processed transactions to wallet...', txnsToSign)

      // Sign transactions
      const signTxnsResult = (await client.algorand.signGroupTransactionV2(
        txnsToSign,
      )) as SignTxnsResult

      this.logger.debug('Received signed transactions from wallet', signTxnsResult)

      // Convert base64 to Uint8Array, undefined to null
      const result = signTxnsResult.map((value) => {
        if (value === undefined) {
          return null
        }
        return base64ToByteArray(value)
      })

      this.logger.debug('Transactions signed successfully', result)
      return result
    } catch (error: any) {
      this.logger.error('Error signing transactions:', error.message)
      throw error
    }
  }
}
