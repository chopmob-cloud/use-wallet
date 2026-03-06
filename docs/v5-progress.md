# use-wallet v5 Migration Progress

Reference: [v5-migration-plan.md](./v5-migration-plan.md)

---

## Sprint 1: Core Foundation

- [x] Move `packages/use-wallet/` → `packages/core/`
- [x] Update `pnpm-workspace.yaml` to `packages/**`
- [x] Make `BaseWallet` generic: `BaseWallet<TOptions>`
- [x] Define `WalletAdapterConfig`, `AdapterConstructorParams<TOptions>`, `AdapterStoreAccessor` interfaces
- [x] Implement `WalletManager.createStoreAccessor()` for scoped store access
- [x] Refactor `WalletManager` to accept `WalletAdapterConfig[]`
- [x] Add event emitter to `WalletManager` (define full `WalletManagerEvents` surface)
- [x] Convert `WalletId` from enum to string type
- [x] Simplify `WalletKey` to `string`
- [x] Remove `WalletMap`, `WalletOptionsMap`, `WalletConfigMap` and related types
- [x] Remove `manageWalletConnectSession()` from `BaseWallet`
- [x] Add `updateMetadata()` protected method to `BaseWallet`
- [x] Add optional `metadata` field to `WalletAccount` type
- [x] Move `Wallet` interface definition to core
- [x] Set up subpath exports: `@txnlab/use-wallet/adapter` and `@txnlab/use-wallet/testing`
- [x] Create `@txnlab/use-wallet/testing` helpers (`createTestStore`, `createMockAlgodClient`, `createMockStoreAccessor`)
- [x] Remove `createWalletMap()` from `src/utils.ts`
- [x] Remove dead code: `deepMerge()`, `isValidWalletId()`, `isValidWalletKey()`
- [x] Remove `src/webpack.ts`
- [x] Remove all wallet implementation files from `src/wallets/`
- [x] Remove `src/wallets/skins.ts`
- [x] Update `src/wallets/index.ts` exports
- [x] Update `src/index.ts` exports
- [x] Update `LOCAL_STORAGE_KEY` to `@txnlab/use-wallet:v5`
- [x] Update core tests
- [x] Verify core builds and typechecks

## Sprint 2: Wallet Adapter Extraction

- [x] Fix `setActiveAccount` bug in `AdapterStoreAccessor`
- [x] Export `setActiveAccount` from `/adapter` subpath
- [x] Export `deriveAlgorandAccountFromEd25519` from `/adapter` subpath
- [x] Create shared build configs (`packages/wallets/tsconfig.base.json`, `tsup.config.base.ts`, `vitest.config.base.ts`)
- [x] Create adapter package template (package.json extending shared configs)
- [x] Extract Pera adapter (establish pattern, include local `manageWalletConnectSession`)
- [x] Extract Defly adapter (include local `manageWalletConnectSession`)
- [x] Extract Defly Web adapter
- [x] Extract Exodus adapter
- [x] Extract WalletConnect adapter (with skins from `src/wallets/skins.ts`)
- [x] Extract Web3Auth adapter
- [x] Extract Mnemonic adapter
- [x] Extract KMD adapter
- [x] Extract Magic adapter
- [x] Extract Lute adapter
- [x] Extract Kibisis adapter
- [x] ~~Extract Biatec adapter~~ — Removed: Biatec is a built-in skin in `@txnlab/use-wallet-walletconnect` (`skin: 'biatec'`)
- [x] Extract W3Wallet adapter
- [x] Extract Custom adapter
- [x] Verify all adapter packages build and typecheck
- [x] Add/migrate tests for each adapter (using `@txnlab/use-wallet/testing` helpers)
- [x] Delete `_v4-wallet-implementations/` directory

## Sprint 3: Framework Adapter Updates

**Pre-work (wallet adapter cleanup from Sprint 2 review):**
- [x] Move adapter test files from `src/__tests__/adapter.test.ts` to `src/adapter.test.ts` in all wallet adapter packages
- [x] Extract inline SVG icons to separate `icon.ts` files in all wallet adapter packages
- [x] Move Custom wallet adapter from `packages/wallets/custom/` to core (`packages/core/`), export from `@txnlab/use-wallet`

**Framework adapter updates:**
- [x] Move `packages/use-wallet-react/` → `packages/frameworks/react/`
- [x] Move `packages/use-wallet-vue/` → `packages/frameworks/vue/`
- [x] Move `packages/use-wallet-solid/` → `packages/frameworks/solid/`
- [x] Move `packages/use-wallet-svelte/` → `packages/frameworks/svelte/`
- [x] Import `Wallet` interface from core in all framework adapters
- [x] Remove wallet SDK peer dependencies from framework adapter package.json files
- [x] Align Solid adapter to return `Wallet` objects
- [x] Update framework adapter tests
- [x] Verify all framework adapters build and typecheck

## Sprint 4: Examples, Docs, CI, Release Pipeline

- [ ] Update React example to v5 API
- [ ] Update Vue example to v5 API
- [ ] Update SolidJS example to v5 API
- [ ] Update Svelte example to v5 API
- [ ] Update vanilla TypeScript example to v5 API
- [ ] Update Next.js example (remove webpack fallback)
- [ ] Update Nuxt example to v5 API
- [ ] Update root `package.json` build scripts
- [ ] Update `.github/workflows/ci.yml` (PR-only triggers, add publint, add concurrency)
- [ ] Update `.vscode/settings.json` ESLint working directories
- [ ] Update `.github/renovate.json`
- [ ] Install semantic-release and plugins as root devDependencies
- [ ] Create root `.releaserc.js` with pre-release branch config (`v5` → rc, `main` → stable)
- [ ] Create `scripts/update-versions.mjs` (lockstep version bumping)
- [ ] Create `scripts/publish-packages.mjs` (ordered multi-package publishing)
- [ ] Add `publishConfig` (`access`, `provenance`) to all publishable `package.json` files
- [ ] Add root `publint` script
- [ ] Create `.github/workflows/release.yml` (TxnLab Release Bot, OIDC)
- [ ] Add `CHANGELOG.md` to `.prettierignore`
- [ ] Manual first publish of all new packages to npm
- [ ] Configure npm trusted publishing (OIDC) for each package on npmjs.com
- [ ] Update GitBook documentation
- [ ] Write v4 → v5 migration guide
- [ ] E2E test updates
- [ ] Pre-release testing from `v5` branch

---

## Findings & Decisions

- **2026-03-05**: ~~`BaseWallet.setActiveAccount()` in v5 uses `this.store.setAccounts()` (scoped accessor) instead of the v4 `setActiveAccount(this.store, ...)` pattern.~~ **BUG**: This doesn't work — `setAccounts` with the same accounts array preserves the existing active account. The `AdapterStoreAccessor` needs a `setActiveAccount(address: string)` method. **Fixed** — added `setActiveAccount` to `AdapterStoreAccessor` interface and implementation.
- **2026-03-05**: `exactOptionalPropertyTypes` in tsconfig required conditional assignment of `options` in `WalletManager.initializeWallets()` — can't pass `options: config.options` when `config.options` might be `undefined` and the target type uses `options?: TOptions`.
- **2026-03-05**: Package exports field requires `types` condition first (before `import`/`require`) to avoid esbuild warnings about unused conditions.
- **2026-03-05**: `WalletState` type is now defined in `wallets/types.ts` (alongside other wallet types) and re-exported from `store.ts` for backward compatibility. This keeps all wallet-related types in one place.
- **2026-03-05**: Biatec adapter removed as standalone package. Biatec was deprecated in v4 (PR #412) in favor of WalletConnect skins. In v5, use `walletConnect({ projectId: '...', skin: 'biatec' })` from `@txnlab/use-wallet-walletconnect`.
- **2026-03-05**: Adapter packages omit `exactOptionalPropertyTypes` from their tsconfig because the `WalletAdapterConfig` interface uses type erasure (`Record<string, unknown>`) which conflicts with specific options interfaces.
- **2026-03-05**: Factory functions in adapter packages require double cast (`as unknown as WalletAdapterConfig['Adapter']`) for the `Adapter` field and (`as unknown as Record<string, unknown>`) for `options` due to type erasure in `WalletAdapterConfig`.
- **2026-03-05**: Web3Auth adapter uses ambient module declarations (`web3auth-modules.d.ts`) for optional peer deps (`@web3auth/modal`, `@web3auth/base`, etc.) since they're dynamically imported at runtime and may not be installed during build.
- **2026-03-05**: Adapter icons should be stored as `.svg` files and imported as raw strings via tsup/build tooling, rather than inlined as base64 constants in adapter.ts. Cleaner separation of assets from logic. Apply during Sprint 3 pre-work.
- **2026-03-05**: Custom wallet adapter moves to core (`@txnlab/use-wallet`). It's a template/extension point for inline wallets, not a real wallet — conceptually part of the framework. Remove `packages/wallets/custom/` and add Custom to core exports. Apply during Sprint 3 pre-work.
- **2026-03-05**: Adapter test files should live alongside source (`src/adapter.test.ts`) rather than in `src/__tests__/adapter.test.ts`. Colocate during Sprint 3 pre-work.
- **2026-03-05**: Svelte adapter defines its own local `Wallet` interface (with `{ current: value }` reactive store wrappers) instead of importing the core `Wallet`. This is intentional — Svelte 5's `@tanstack/svelte-store` wraps reactive values in `{ current }`, making the flat core interface unusable directly. The core `Wallet` is still re-exported via `export * from '@txnlab/use-wallet'` for consumers who need the flat type.
- **2026-03-06**: **Dependency model change**: Wallet SDKs move from `peerDependencies` to regular `dependencies` in adapter packages. Peer deps forced consumers to manually install each wallet SDK alongside each adapter (28 packages for a full setup). With regular deps, `npm install @txnlab/use-wallet-pera` brings in `@perawallet/connect` automatically. `algosdk` stays as a peer dep since consumers use it directly. Web3Auth adapter must add `@web3auth/modal`, `@web3auth/base`, `@web3auth/base-provider`, `@web3auth/single-factor-auth` as regular deps (they were invisible before — not listed as peer deps despite being required at runtime). The Web3Auth ambient module declarations (`web3auth-modules.d.ts`) can be removed since the packages will be installed. Magic SDK has a broken ESM build (`@magic-sdk/types` missing `Wallets` export) — document the required Vite workaround until upstream fixes it.

---

## Open Issues

- [x] **`setActiveAccount` bug**: Fixed — added `setActiveAccount(address: string)` to `AdapterStoreAccessor`, implemented in `WalletManager.createStoreAccessor()`, updated `BaseWallet.setActiveAccount()`.
- [x] **`setActiveAccount` not exported from `/adapter`**: Fixed — now exported from `@txnlab/use-wallet/adapter`.
- [x] **Adapter tests not yet migrated**: Tests migrated to adapter packages using `@txnlab/use-wallet/testing` helpers.
- [ ] **Move wallet SDKs from `peerDependencies` to `dependencies`** in all adapter packages. Remove Web3Auth ambient module declarations. Update migration plan §2 (Dependency Graph) and §5.2 (package.json template).
- [ ] **Magic SDK ESM bug**: `@magic-sdk/provider` broken ESM build requires Vite alias workaround. Document in example and migration guide. Track upstream fix.
