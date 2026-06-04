# ZKsync OS v30.1 — chain 626 deployed addresses (mainnet, hybrid deploy)

All contracts are deployed on Ethereum mainnet (L1 chainId 1). Protocol matches Dawn v30.1
(`storedBatchZero = 0x18bd4bd6…1df6f9`, verifier VK `= 0x124ebcd5…105337`).

L1 core contracts (BridgeHub, AssetRouter, Nullifier, MessageRoot, ChainAssetHandler,
CTMDeploymentTracker) were built from era-contracts `main` (v29.4) — bytecode-identical
to the canonical ZKsync Era mainnet ecosystem (modulo immutables). ZKsync OS contracts
(ChainTypeManager, Verifier, facets) were built from `vb-v30.1-upgrade`.

- Era chain id (immutable): 324
- Chain id: 626
- L1 chain id: 1
- Deployer (temporary owner; handoff initiated): `0xA41acA729A6D6fd2C4c34d30A3eE3A9308C766f6`
- CREATE2 factory (canonical): `0x4e59b44847b379578588920cA78FbF26c0B4956C`
- Multicall3 (canonical): `0xcA11bde05977b3631167028862bE2a173976CA11`

## Proxy admins

- **Main ProxyAdmin**: `0x31b477779cfdf178b618c0517d75ab42fcbef691` (owner = Governance) —
  used by every ecosystem proxy *except* ServerNotifier (BridgeHub, MessageRoot,
  AssetRouter, L1Nullifier, L1ERC20Bridge, L1NTV, CTMDeploymentTracker,
  ChainAssetHandler, ChainTypeManager, ValidatorTimelock).
- **ServerNotifier ProxyAdmin**: `0x336a2d234b2f1d195f68faaa129584097d0c5c34`
  (owner = ecosystem ChainAdmin). Separate by **design** — `DeployCTM` deploys a
  dedicated ProxyAdmin owned by the ecosystem ChainAdmin (and likewise transfers
  the ServerNotifier proxy's owner to the ChainAdmin), because server-migration
  notifications are operational-level (chain admin), not governance-level.

## Ecosystem (BridgeHub + governance)

- BridgeHub (proxy): `0x6f85C08e2DabB6b0B8B3587D3628FCfb5b10BE19`
- BridgeHub implementation: `0x63B2E3F411C419F47473732E55E161c96E11a3B3`
- Governance (ecosystem owner): `0x6145cb32119D87360cC9eeF698B41E60911202C5`
- ChainAdmin (ecosystem): `0xbc8e06ABa0ef1cE015A5d9207b61B470D751404b`
- Message Root (proxy): `0x26b80c551595DF4405281BF3D55C81384C1DEf42`
- Message Root implementation: `0x610CB45507ea43c104fDDc210b40D121284b4511`
- CTM Deployment Tracker (proxy): `0x226C91f14374e45b3Fd99A6a9C139E48C41787C6`
- CTM Deployment Tracker implementation: `0x2aBDF6b17B18D20ce0b03CA4533b63675cd80748`
- Chain Asset Handler (proxy): `0x6C8F056C532C9E15dCAbd725CdDcd7E8aca1F566`
- Chain Asset Handler implementation: `0xb6F9E6542892D5f7EE9fD1C0696A461DA64A1A4e`

## Bridges and token vault

- L1 Asset Router / shared bridge (proxy): `0x7A8564a540f063bd1eB4508E6BcbAa58969DBDeb`
- L1 Asset Router implementation: `0x4073678C698453d888a79dfB4489B628214c6FEE`
- L1 Nullifier (proxy): `0xE8137D2b42E4CADE22E74ae3Cb1c1De162CE28f3`
- L1 Nullifier implementation: `0x2bFf8323bC803DD09691eF7E62E64F73a6Bc8e4b`
- L1 ERC20 Bridge (proxy): `0xBFb73C3bfEC1F9628caece5478577D56Fb01a2f0`
- L1 ERC20 Bridge implementation: `0x97affCb5e22AA8d41E84d2aA37e6467C983283e9`
- L1 Native Token Vault (proxy): `0xADD8491aE88B1dfE30d316999141bfBeAC587E07`
- L1 Native Token Vault implementation: `0xbB81eb2562603AF751135e9a490FBC04f09b8Afa`
- BridgedStandardERC20 (beacon impl): `0x6502DF4Fd1CA5EEAF958704382ED90F3F4a9caA0`

## ChainTypeManager (ZKsync OS CTM) and state transition

- ChainTypeManager (proxy): `0x4Ee4EA87b909ea3E1C36d9fcbf6C0e535165f96D`
- ChainTypeManager implementation: `0x056fc9C6CC99f1320B458555a3F7D7aab96efA54`
- ValidatorTimelock (proxy): `0x313E1E05b967aB18cCb6aAaAE19E616b7b99a01a`
- ValidatorTimelock implementation: `0xfc93ecD99963F9000af10d66B0650c03f3D87F68`
- Server Notifier (proxy): `0x3AB68bf9Dd6964650a98F1254aAC39B6B1ba2E80`
- Server Notifier implementation: `0xbf6aA917f7cfC94c5430dD732A2De5472d2C7846`
- Verifier (ZKsyncOSDualVerifier): `0x901f436531128B2669FcF43B0953Db9a154De3a6`
- Admin facet: `0x691e6E8Aca9Efb0344f89dFDA09d9A27442480E7`
- Executor facet: `0x7C5a5c115b009fE104b9cc2a79352b1F34492993`
- Mailbox facet: `0x3D04e3fa2815A469d7dD40F13627e3DfA6137689`
- Getters facet: `0xc2179C5f354c5c075C9d864AA2a775d24db26b5a`
- L1 Genesis Upgrade: `0xBb36950F3f063808e734f9E3aAc435cE93965839`

## Data availability

- Rollup DA Manager: `0x1b60B98612163e47BFD038F11e79Cad235500581`
- Rollup L1 DA Validator: `0x97e74A3096Ee3CcA37E3cCFE273a24c0fA7aa0e2`
- Blobs ZKsync OS L1 DA Validator (used by chain 626): `0x3368766f6d565f14eA0cFd71236999d6c93fbDbE`
- No-DA Validium L1 Validator: `0xd34A96d51a580479a348177A7214eC7b63a77AaF`
- Avail L1 DA Validator: `0x7360DbD9EfA28b26b83473D3e7C226ba57E87024`

## Chain 626

- Diamond proxy (the chain): `0xB44d26D227e0bD028d893BEc16DC1C7B168eCdE3`
- Chain Admin: `0x353c39d02efb034BF92b580CbEe79314166ED7eA` — pending owner `0xc177aC25…`
- Chain Governance: `0x9d1c800574557dBFE23A15eBefb40207a38d33cf` — pending owner `0xc177aC25…` (transferOwnership initiated 2026-06-04)
- ChainTypeManager admin (operational admin, distinct from owner): `0xbc8e06ABa0ef1cE015A5d9207b61B470D751404b` (= ecosystem ChainAdmin; accepted 2026-06-04)

## Validator operators (configured on chain 626 via ValidatorTimelock)

- Commit (committer): `0x420c3d089Be4636949c6d4cc31E4b25254336b8c`
- Prove (prover): `0x941c6dC100007e9B9A942B78A233265d1BA57b82`
- Execute (executor): `0x805d4940e74f88fc30f032B1494609bd48A6c9a5`
- Reverter (only): `0xdf79BFf352aa092378757BC76D7333F5150fa11e`  *(precommitter/prover/executor roles revoked 2026-06-02, tx 0xf3ee7dc1)*

## DA validator pair on chain 626

- L1 DA validator: `0x3368766f6d565f14eA0cFd71236999d6c93fbDbE` (BlobsL1DAValidatorZKsyncOS)
- L2 DA commitment scheme: `BLOBS_ZKSYNC_OS` (enum value 4)

## Ownership handoff status

All ecosystem-level contracts are now owned by **Governance** (`0x6145cb32…`),
which is itself pending transfer to the real ecosystem owner. After 2026-06-03
re-routing, the topology mirrors canonical ZKsync Era: a single Governance
contract owns everything, so the real owner needs only **2** `acceptOwnership()`
calls to take full control:

- `0x4e4943346848c4867F81dFb37c4cA9C5715A7828` (final ecosystem owner) must
  `acceptOwnership()` on **Governance** (`0x6145cb32…`). Once accepted, this
  single contract transitively controls: BridgeHub, L1AssetRouter, L1Nullifier,
  L1NativeTokenVault, L1ERC20Bridge, MessageRoot, CTMDeploymentTracker,
  ChainAssetHandler, ChainTypeManager, ValidatorTimelock, Verifier, RollupDAManager,
  and the ecosystem ChainAdmin.
- `0xc177aC25a1c9aFF16F1cE8cde99187Ed391C58f3` (final chain admin) must
  `acceptOwnership()` on **chain 626 ChainAdmin** (`0x353c39d0…`) and on
  **chain 626 Governance** (`0x9d1c8005…`).
