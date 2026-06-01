# ZKsync OS v30.1 — chain 626 deployed addresses (mainnet)

All contracts are deployed on Ethereum mainnet (L1 chainId 1) and verified on Etherscan.
Protocol matches Dawn v30.1 (`storedBatchZero = 0x18bd4bd6…1df6f9`, verifier VK `= 0x124ebcd5…105337`).

- Era chain id (immutable, ecosystem-wide): **324** (canonical Era; this chain is *not* Era)
- Chain id: **626**
- L1 chain id: 1
- Deployer / temporary owner: `0x46A9ad0401E3F272F507222df95a21f5e692Eb5A`
- CREATE2 factory (canonical): `0x4e59b44847b379578588920cA78FbF26c0B4956C`
- Multicall3 (canonical): `0xcA11bde05977b3631167028862bE2a173976CA11`

## Ecosystem (BridgeHub + governance)

- BridgeHub (proxy): `0x6872C0a40708D17c97A166FEF5a670b1a47d2dCe`
- BridgeHub implementation: `0x040AabCD670256F652d0Cd5017e93300dE5668eB`
- Governance (ecosystem owner): `0x816863F4c00e6470F00a13Ffcf3b8D2553ceF2BB`
- ChainAdmin (ecosystem): `0x53AF77f500472df26Cd9c5E2bbfE8c08a43c287B`
- Transparent Proxy Admin: `0xe74350b57726756eAA7a7C046Fe619DF24aea4C8`
- Message Root (proxy): `0x19bb457fc8D3Fcf966930cEd91af9F5Cc996463F`
- Message Root implementation: `0x99e504b56ddA855Ea4A3B8299320DC17F543e60A`
- CTM Deployment Tracker (proxy): `0x17828790de83DF23E9AA8549EF251F1288eE6B22`
- CTM Deployment Tracker implementation: `0xCa9bDe1C9aAe7e3604854C7bD92F3f4A83588026`
- Chain Asset Handler (proxy): `0x41e55C710Eb56d94F94D63512c2013DAC3e36232`
- Chain Asset Handler implementation: `0xC30Ec34d327a13BE8Cf27a1Afd7C262B695BD191`

## Bridges and token vault

- L1 Asset Router / shared bridge (proxy): `0x72f83DCFDC707438a1f33C6937FaF16C7E328Fe1`
- L1 Asset Router implementation: `0xD2B9de9c9Ea39E81d6B2be2eF607ee498c2016f7`
- L1 Nullifier (proxy): `0x8ad7e24197319961DdEAf5edEe194E078EECEd7b`
- L1 Nullifier implementation: `0x0DA4De50f99da377dc7Ab07ac0165208BC7C6Fbc`
- L1 ERC20 Bridge (proxy): `0x59119b95f31b17E5459Bf7bA379b6BA8E4096744`
- L1 ERC20 Bridge implementation: `0x8AE164B324584040ed8383e74B69aDA8945fF16a`
- L1 Native Token Vault: `0x89Ff9C7dbED2b34Af1A8377b5b9654C12036bBEF`

## ChainTypeManager (ZKsync OS CTM) and state transition

- ChainTypeManager (proxy): `0x2E5CA2BdaF64AF5f3A7d1f9BBee2EF4E6bC4964f`
- ChainTypeManager implementation: `0xbb85cD4f158B004594c6E8C71B5983d978A185b2`
- ValidatorTimelock: `0xeD9d86dfe46C03E5898657a51aaDD886D98AfBf6`
- Server Notifier (proxy): `0x6F48b66DBFECcdBd7dcF2C8311ac1F17aa05A811`
- Server Notifier implementation: `0xbf6aA917f7cfC94c5430dD732A2De5472d2C7846`
- Verifier (ZKsyncOSDualVerifier): `0x09BF30a966cc29dA3E8b1BeE84Ff6807A2394ffA`
- Admin facet: `0x127B8Dda688e7F85f4B4ff863f8FAe8Ac98aB790`
- Executor facet: `0x7C5a5c115b009fE104b9cc2a79352b1F34492993`
- Mailbox facet: `0x3D04e3fa2815A469d7dD40F13627e3DfA6137689`
- Getters facet: `0xc2179C5f354c5c075C9d864AA2a775d24db26b5a`
- Diamond Init: `0x1b9665bDFE9586b3d8e1497A13c0a5022146d8A5`
- Default Upgrade: `0x867C8cc0f2F6E2cBec7544F1D84Bb4FEb8760E24`
- L1 Genesis Upgrade: `0xBb36950F3f063808e734f9E3aAc435cE93965839`
- Bytecodes Supplier: `0x905eB2Bfe44202984c05CEd63Cf9419EC858C642`

## Data availability

- L1 Rollup DA Manager: `0x689389D58A6E0Ee8bdb074eF3Fdc97861b63FA78`
- Rollup L1 DA Validator: `0x97e74A3096Ee3CcA37E3cCFE273a24c0fA7aa0e2`
- Blobs ZKsync OS L1 DA Validator (used by chain 626): `0x3E976F63373059C4CeBEad1dee0dEF4866018E4d`
- No-DA Validium L1 Validator: `0xd34A96d51a580479a348177A7214eC7b63a77AaF`
- Avail L1 DA Validator: `0x7360DbD9EfA28b26b83473D3e7C226ba57E87024`

## Chain 626

- Diamond proxy (the chain): `0xcf174C926A3CE168ba31DB8908d3C93DA150b997`
- Chain Admin: `0x321D3D14a0Fd33403d0f375Ac55FaD5B3A8f471D`
- Chain Proxy Admin: `0xdcb1933286dc4a3e6aaf37d278b738d6717eeb0d`
  *(note: `output-register-zk-chain.toml` mis-predicts this as `0xE18858…d2d99`, which has no code; the actual address above is from the Create2AndTransfer event logs)*
- Chain Governance: `0x0f257b4A50501D2bf9A584E2bcbecD56743167C5`

## Validator operators (configured on chain 626 via ValidatorTimelock)

- Commit (committer): `0x420c3d089Be4636949c6d4cc31E4b25254336b8c`
- Prove (prover): `0x941c6dC100007e9B9A942B78A233265d1BA57b82`
- Execute (executor): `0x805d4940e74f88fc30f032B1494609bd48A6c9a5`
- Eth-path / revert (precommitter + reverter + upgrader): `0xdf79BFf352aa092378757BC76D7333F5150fa11e`

## DA validator pair on chain 626

- L1 DA validator: `0x3E976F63373059C4CeBEad1dee0dEF4866018E4d` (BlobsL1DAValidatorZKsyncOS)
- L2 DA commitment scheme: `BLOBS_ZKSYNC_OS` (enum value 4)

## Pending — final ownership handoff

Ownership is still on the deployer; real owners must `acceptOwnership()` to complete:

- Governance, ValidatorTimelock, Verifier → target owner `0x4e4943346848c4867F81dFb37c4cA9C5715A7828`
- ChainAdmin (ecosystem) and chain admin → target owner `0xc177aC25a1c9aFF16F1cE8cde99187Ed391C58f3`
