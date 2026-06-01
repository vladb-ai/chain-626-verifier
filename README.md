# chain-626-verifier

Independently verify the ZKsync OS v30.1 deployment of chain 626 on Ethereum mainnet.

## What it checks

**State invariants (always, ~5 sec):**

- Diamond `getProtocolVersion() == v0.30.1`
- `CTM.storedBatchZero()` matches Dawn (`0x18bd4bd6…1df6f9`)
- Verifier `verificationKeyHash()` matches Dawn (`0x124ebcd5…105337`)
- `bridgehub.owner() == Governance`, `bridgehub.admin() == ChainAdmin`
- CTM is registered on the BridgeHub
- `bridgehub.getZKChain(626) == diamond`
- `diamond.getChainId() == 626`, base token is ETH
- `L1ERC20Bridge.ERA_CHAIN_ID == 324`
- DA validator pair = (`BlobsL1DAValidatorZKsyncOS`, `BLOBS_ZKSYNC_OS` commitment scheme)

**Bytecode (optional, needs a built `era-contracts` checkout):**

Fetches `eth_getCode` for each contract and compares against the local
`deployedBytecode.object` in that contract's Foundry artifact. Masks Solidity
immutables (using `immutableReferences` from the artifact) and strips the
trailing CBOR metadata before comparing, so e.g. the baked-in `ERA_CHAIN_ID = 324`
doesn't false-positive a mismatch.

Covers 16 contracts: BridgeHub (impl + proxy), Governance, ChainAdminOwnable,
ChainTypeManager (impl + proxy), ValidatorTimelock proxy, AssetRouter impl,
ZKsyncOSDualVerifier, all four diamond facets (Admin, Executor, Mailbox, Getters),
BlobsL1DAValidatorZKsyncOS, RollupL1DAValidator, RollupDAManager.

## Usage

### Option 1 — quick (state only, no Node)

Needs only [Foundry's `cast`](https://book.getfoundry.sh/getting-started/installation):

```bash
./verify.sh
# or with your own RPC
RPC=https://your-archive-rpc.example.com ./verify.sh
```

### Option 2 — full (state + bytecode)

Needs Node 20+ and a **built** `era-contracts` checkout on the `vb-v30.1-upgrade`
branch (see the build instructions in that repo's `AGENTS.md`). Once built:

```bash
npm install        # installs ethers + ts-node locally

ARTIFACTS=/path/to/era-contracts \
RPC=https://your-archive-rpc.example.com \
  npm run verify
```

State-only mode for the TS version (no artifacts needed):

```bash
RPC=https://your-rpc npm run verify:state-only
```

## Reproducing the bytecode

To get the local artifacts that this script compares against:

```bash
git clone <era-contracts-repo>
cd era-contracts
git checkout vb-v30.1-upgrade
git submodule update --init --recursive
# install foundry-zksync v0.0.30 (see AGENTS.md)
yarn install
yarn da build:foundry && yarn l1 build:foundry \
  && yarn sc build:foundry && yarn l2 build:foundry
```

Then point `ARTIFACTS` at that checkout's root.

## Expected output

```
Verifying chain 626 on https://…
--- State invariants ---
  ✅ diamond protocolVersion == v0.30.1
  ✅ CTM.storedBatchZero matches Dawn
  ✅ verifier VK matches Dawn
  …
--- Bytecode (on-chain vs local artifacts) ---
  ✅ BridgeHub impl  (matches modulo metadata + immutables)
  ✅ BridgeHub proxy  (exact match)
  …

ALL CHECKS PASSED.
```

Exits non-zero on any failed check (safe for CI/cron).

## Files

| File | What |
|---|---|
| `verify.sh` | Bash: state-only check (Foundry `cast` only) |
| `verify.ts` | TypeScript: state + bytecode check (ethers v5) |
| `package.json` | Dependencies for the TS version |
| `tsconfig.json` | Minimal TS config |
| `DEPLOYED-ADDRESSES.md` | Reference: every deployed address by category |

## Caveats

- The public RPCs are fine for verification; rate limits won't matter for the
  ~20 calls this script makes. For a private chain or rate-limited setup, point
  `RPC` at your own archive endpoint.
- Bytecode comparison is against locally-built artifacts. Etherscan source
  verification is a separate guarantee (every contract is verified — see the
  Etherscan link for each address).
- The `chain_proxy_admin_addr` in the deploy output toml is misrecorded as
  `0xE18858…d2d99`; the actual ChainProxyAdmin is at
  `0xdcb1933286dc4a3e6aaf37d278b738d6717eeb0d` (see `DEPLOYED-ADDRESSES.md`).
