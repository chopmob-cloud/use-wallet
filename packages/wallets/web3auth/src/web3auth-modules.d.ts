// Type declarations for optional Web3Auth peer dependencies
// These are dynamically imported at runtime and may not be installed
declare module '@web3auth/modal' {
  export const Web3Auth: any
}
declare module '@web3auth/base' {
  export const CHAIN_NAMESPACES: any
  export const WEB3AUTH_NETWORK: any
}
declare module '@web3auth/base-provider' {
  export const CommonPrivateKeyProvider: any
}
declare module '@web3auth/single-factor-auth' {
  export const Web3Auth: any
}
