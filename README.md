# chain-626-verifier

Independently verify the ZKsync OS v30.1 deployment of **chain 626** on Ethereum mainnet,
by checking it against the **canonical ZKsync Era ecosystem** on mainnet — no local
build, no artifacts. Just an RPC.

## What it proves

**(A) State invariants** — protocol version, genesis (`storedBatchZero`), verifier VK,
ownership topology, CTM registration, chain wiring, base token, DA validator pair,
`ERA_CHAIN_ID`. These all match expected values.

**(B) Bytecode equivalence with canonical Era ecosystem.** For each chain-626 contract,
the verifier fetches `eth_getCode` for both our address *and* the canonical Era
ecosystem's equivalent (e.g. the BridgeHub impl behind `0x303a465B…5213`, the ZKsync OS
CTM impl behind `0x1adF137F…071F`, Dawn's diamond facets, Dawn's verifier), then
compares them. A pair is considered a match if:

1. **Exact byte equality**, or
2. **Equal after stripping the trailing CBOR metadata** (Solidity embeds an IPFS hash of
   the metadata which varies by compilation environment even for identical source), or
3. **Same length and <5% of bytes differ** — same source, only ecosystem-specific
   immutables differ (e.g. the `BRIDGE_HUB` immutable points at *our* bridgehub vs
   canonical Era's bridgehub).

Contracts are split into two groups:

- **v30.1-upgraded on canonical** (CTM impl, Verifier, all 4 diamond facets): these
  were re-deployed as part of the `v0.30.1-airbender-fix` upgrade, so canonical Era runs
  the v30.1 bytecode and ours **must match** (it does).
- **Older L1 core on canonical** (BridgeHub, AssetRouter, Nullifier, MessageRoot, etc.):
  canonical Era's L1 core was deployed at an earlier protocol version (e.g. canonical's
  BridgeHub impl is the older `Bridgehub` contract, while ours is the renamed
  `L1Bridgehub` from v30.1 source). Differences here are expected and **informational**
  — they don't fail verification.

## Usage

### Quick (state-only, no Node)

Needs only [Foundry's `cast`](https://book.getfoundry.sh/getting-started/installation):

```bash
./verify.sh
# or with your own RPC
RPC=https://your-archive-rpc ./verify.sh
```

### Full (state + bytecode-vs-canonical)

Needs Node 20+:

```bash
npm install                  # ethers v5 + ts-node
npm run verify
# with your own RPC
RPC=https://your-archive-rpc npm run verify
# state checks only
npm run verify:state-only
```

## Example output

```
Verifying chain 626 against canonical ZKsync Era ecosystem on …

--- State invariants ---
  ✅ diamond protocolVersion == v0.30.1
  ✅ CTM.storedBatchZero matches Dawn
  ✅ verifier VK matches Dawn
  ✅ bridgehub.owner == Governance
  …

--- Bytecode: ours vs canonical ZKsync Era ecosystem ---
    (v30.1-upgraded contracts — these MUST match canonical Era)
  ✅ ZKsync OS ChainTypeManager impl  (same source, 192 immutable bytes differ — 0.97%)
  ✅ ZKsyncOSDualVerifier  (matches modulo CBOR metadata)
  ✅ AdminFacet  (same source, 57 immutable bytes differ — 0.25%)
  ✅ ExecutorFacet, MailboxFacet, GettersFacet  (matches modulo CBOR metadata)

    (older canonical Era L1 core — informational only, may differ)
  ℹ️ BridgeHub impl  different sizes (ours uses v30.1 L1Bridgehub, canonical uses older Bridgehub)
  ✅ L1AssetRouter impl  (same source, 898 immutable bytes differ — 4.60%)
  ✅ L1Nullifier impl  (same source, 118 immutable bytes differ — 0.76%)
  ✅ CTMDeploymentTracker impl  (same source, 260 immutable bytes differ — 4.72%)
  ℹ️ MessageRoot impl  different sizes
  ℹ️ ChainAssetHandler impl  different sizes
  ℹ️ BlobsL1DAValidatorZKsyncOS  different sizes

ALL CHECKS PASSED — chain 626 matches the canonical ZKsync Era ecosystem.
```

Exits non-zero on any state-invariant failure or any **must-match** bytecode failure.

## Files

| File | What |
|---|---|
| `verify.sh` | Bash: state-only (Foundry `cast` only) |
| `verify.ts` | TypeScript: state + canonical-bytecode comparison (ethers v5) |
| `package.json` | Dependencies for the TS version |
| `tsconfig.json` | Minimal TS config |
| `DEPLOYED-ADDRESSES.md` | Reference: every chain-626 address by category |

## Caveats

- The "must match" classification assumes canonical Era's v30.1 contracts (Dawn's CTM,
  Verifier, facets at addresses listed in `verify.ts`) are the right reference. If
  canonical Era is upgraded further, those reference addresses move.
- For "older L1 core" contracts, the bytecode comparison is informational. To verify
  those rigorously you'd need a built local checkout of the v30.1 source — see the
  era-contracts repo's `vb-v30.1-upgrade` branch.
- A public mainnet RPC is fine for the ~25 reads this script makes. Use a private
  archive endpoint if you're behind a rate limit.
