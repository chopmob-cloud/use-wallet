/**
 * @txnlab/use-wallet/adapter
 *
 * Entry point for wallet adapter authors. Exports everything needed
 * to build an adapter package.
 */

// Base class
export { BaseWallet } from './wallets/base'

// Adapter interfaces
export type {
  AdapterConstructorParams,
  AdapterStoreAccessor,
  WalletAdapterConfig
} from './wallets/types'

// Shared types
export type {
  WalletAccount,
  WalletMetadata,
  WalletState,
  WalletKey,
  SignerTransaction,
  WalletTransaction,
  MultisigMetadata,
  SignData,
  SignDataResponse,
  SignMetadata,
  JsonRpcRequest,
  Siwa
} from './wallets/types'

export { ScopeType, SignTxnsError, SignDataError } from './wallets/types'

// State type (for subscribe callback typing)
export type { State } from './store'

// Utility functions
export {
  compareAccounts,
  isSignedTxn,
  isTransaction,
  isTransactionArray,
  flattenTxnGroup,
  base64ToByteArray,
  byteArrayToBase64,
  stringToByteArray,
  byteArrayToString,
  formatJsonRpcRequest
} from './utils'

// Secure key utilities
export {
  SecureKeyContainer,
  withSecureKey,
  withSecureKeySync,
  zeroMemory,
  zeroString
} from './secure-key'

// Logger
export { LogLevel } from './logger'
