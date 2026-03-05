# use-wallet v5 Migration Progress

Reference: [v5-migration-plan.md](./v5-migration-plan.md)

---

## Sprint 1: Core Foundation

- [ ] Move `packages/use-wallet/` → `packages/core/`
- [ ] Update `pnpm-workspace.yaml` to `packages/**`
- [ ] Make `BaseWallet` generic: `BaseWallet<TOptions>`
- [ ] Define `WalletAdapterConfig`, `AdapterConstructorParams<TOptions>`, `AdapterStoreAccessor` interfaces
- [ ] Implement `WalletManager.createStoreAccessor()` for scoped store access
- [ ] Refactor `WalletManager` to accept `WalletAdapterConfig[]`
- [ ] Add event emitter to `WalletManager` (define full `WalletManagerEvents` surface)
- [ ] Convert `WalletId` from enum to string type
- [ ] Simplify `WalletKey` to `string`
- [ ] Remove `WalletMap`, `WalletOptionsMap`, `WalletConfigMap` and related types
- [ ] Remove `manageWalletConnectSession()` from `BaseWallet`
- [ ] Add `updateMetadata()` protected method to `BaseWallet`
- [ ] Add optional `metadata` field to `WalletAccount` type
- [ ] Move `Wallet` interface definition to core
- [ ] Set up subpath exports: `@txnlab/use-wallet/adapter` and `@txnlab/use-wallet/testing`
- [ ] Create `@txnlab/use-wallet/testing` helpers (`createTestStore`, `createMockAlgodClient`, `createMockStoreAccessor`)
- [ ] Remove `createWalletMap()` from `src/utils.ts`
- [ ] Remove dead code: `deepMerge()`, `isValidWalletId()`, `isValidWalletKey()`
- [ ] Remove `src/webpack.ts`
- [ ] Remove all wallet implementation files from `src/wallets/`
- [ ] Remove `src/wallets/skins.ts`
- [ ] Update `src/wallets/index.ts` exports
- [ ] Update `src/index.ts` exports
- [ ] Update `LOCAL_STORAGE_KEY` to `@txnlab/use-wallet:v5`
- [ ] Update core tests
- [ ] Verify core builds and typechecks

## Sprint 2: Wallet Adapter Extraction

- [ ] Create shared build configs (`packages/wallets/tsconfig.base.json`, `tsup.config.base.ts`, `vitest.config.base.ts`)
- [ ] Create adapter package template (package.json extending shared configs)
- [ ] Extract Pera adapter (establish pattern, include local `manageWalletConnectSession`)
- [ ] Extract Defly adapter (include local `manageWalletConnectSession`)
- [ ] Extract Defly Web adapter
- [ ] Extract Exodus adapter
- [ ] Extract WalletConnect adapter (with skins from `src/wallets/skins.ts`)
- [ ] Extract Web3Auth adapter
- [ ] Extract Mnemonic adapter
- [ ] Extract KMD adapter
- [ ] Extract Magic adapter
- [ ] Extract Lute adapter
- [ ] Extract Kibisis adapter
- [ ] Extract Biatec adapter
- [ ] Extract W3Wallet adapter
- [ ] Extract Custom adapter
- [ ] Verify all adapter packages build and typecheck
- [ ] Add/migrate tests for each adapter (using `@txnlab/use-wallet/testing` helpers)

## Sprint 3: Framework Adapter Updates

- [ ] Move `packages/use-wallet-react/` → `packages/frameworks/react/`
- [ ] Move `packages/use-wallet-vue/` → `packages/frameworks/vue/`
- [ ] Move `packages/use-wallet-solid/` → `packages/frameworks/solid/`
- [ ] Move `packages/use-wallet-svelte/` → `packages/frameworks/svelte/`
- [ ] Import `Wallet` interface from core in all framework adapters
- [ ] Remove wallet SDK peer dependencies from framework adapter package.json files
- [ ] Align Solid adapter to return `Wallet` objects
- [ ] Update framework adapter tests
- [ ] Verify all framework adapters build and typecheck

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

_Record discoveries, edge cases, and decisions made during implementation here._

<!-- Example:
- **2025-01-15**: Decided to keep `BaseWallet` class name unchanged (not rename to `BaseAdapter`) to minimize churn. The "adapter" terminology applies to packages and docs, not class names.
- **2025-01-16**: `@tanstack/store` v0.8.0 works fine as a shared dependency. No need to upgrade for v5.
-->

---

## Open Issues

_Track unresolved problems encountered during implementation here._

<!-- Example:
- [ ] WalletConnect session migration: need to test whether v4 WC sessions survive the localStorage key change
- [ ] Biatec adapter: decide between standalone implementation (Option A) vs thin WalletConnect wrapper (Option B)
-->
