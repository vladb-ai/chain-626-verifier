/* Full verifier for ZKsync OS v30.1 chain 626 (Ethereum mainnet).
 *
 * Checks:
 *   (A) State invariants — protocol version, genesis, verifier VK, ownership,
 *       chain wiring, base token, DA validator pair, era_chain_id.
 *   (B) Bytecode — fetches `eth_getCode` per address and compares against the
 *       deployedBytecode of the matching contract in a locally-built
 *       era-contracts checkout (vb-v30.1-upgrade). Masks Solidity immutables
 *       (using the artifact's immutableReferences) and strips the trailing
 *       CBOR metadata before comparing.
 *
 * Usage:
 *   npm install
 *   RPC=<mainnet-rpc>  ARTIFACTS=<path-to-built-era-contracts>  npm run verify
 *
 * If ARTIFACTS is omitted, the script runs state-only.
 */
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

const RPC = process.env.RPC ?? "https://ethereum-rpc.publicnode.com";
const ARTIFACTS = process.env.ARTIFACTS;
const STATE_ONLY = process.env.STATE_ONLY === "1" || !ARTIFACTS;
const provider = new ethers.providers.JsonRpcProvider(RPC);

// ---------------- deployed addresses (Ethereum mainnet) ----------------
const ADDR = {
  BH:            "0x6872C0a40708D17c97A166FEF5a670b1a47d2dCe",
  BH_IMPL:       "0x040AabCD670256F652d0Cd5017e93300dE5668eB",
  GOV:           "0x816863F4c00e6470F00a13Ffcf3b8D2553ceF2BB",
  CA:            "0x53AF77f500472df26Cd9c5E2bbfE8c08a43c287B",
  CTM:           "0x2E5CA2BdaF64AF5f3A7d1f9BBee2EF4E6bC4964f",
  CTM_IMPL:      "0xbb85cD4f158B004594c6E8C71B5983d978A185b2",
  VTL:           "0xeD9d86dfe46C03E5898657a51aaDD886D98AfBf6",
  VER:           "0x09BF30a966cc29dA3E8b1BeE84Ff6807A2394ffA",
  AR:            "0x72f83DCFDC707438a1f33C6937FaF16C7E328Fe1",
  AR_IMPL:       "0xD2B9de9c9Ea39E81d6B2be2eF607ee498c2016f7",
  NTV:           "0x89Ff9C7dbED2b34Af1A8377b5b9654C12036bBEF",
  CTMDT:         "0x17828790de83DF23E9AA8549EF251F1288eE6B22",
  RDM:           "0x689389D58A6E0Ee8bdb074eF3Fdc97861b63FA78",
  DIAMOND:       "0xcf174C926A3CE168ba31DB8908d3C93DA150b997",
  CA626:         "0x321D3D14a0Fd33403d0f375Ac55FaD5B3A8f471D",
  L1ERC20:       "0x59119b95f31b17E5459Bf7bA379b6BA8E4096744",
  AdminFacet:    "0x127B8Dda688e7F85f4B4ff863f8FAe8Ac98aB790",
  ExecutorFacet: "0x7C5a5c115b009fE104b9cc2a79352b1F34492993",
  MailboxFacet:  "0x3D04e3fa2815A469d7dD40F13627e3DfA6137689",
  GettersFacet:  "0xc2179C5f354c5c075C9d864AA2a775d24db26b5a",
  BlobsDA:       "0x3E976F63373059C4CeBEad1dee0dEF4866018E4d",
  RollupDA:      "0x97e74A3096Ee3CcA37E3cCFE273a24c0fA7aa0e2",
};

// ---------------- expected protocol fingerprints (Dawn v30.1) ----------------
const EXPECT = {
  PV:   "128849018881",                                                                    // v0.30.1
  SBZ:  "0x18bd4bd6909643336ab04fcab99eff346bc4e74799aeeb2ed809341e3a1df6f9",              // genesis
  VK:   "0x124ebcd537a1e1c152774dd18f67660e35625bba0b669bf3b4836d636b105337",              // verifier VK
  ETH:  "0x0000000000000000000000000000000000000001",
  L2DA: "0x0000000000000000000000000000000000000004",                                       // BLOBS_ZKSYNC_OS
};

// ---------------- contract → artifact path (relative to ARTIFACTS root) ----------------
const BYTECODE_PAIRS: Array<[string, string, string]> = [
  ["BridgeHub impl",                ADDR.BH_IMPL,       "l1-contracts/out/L1Bridgehub.sol/L1Bridgehub.json"],
  ["BridgeHub proxy",               ADDR.BH,            "l1-contracts/out/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json"],
  ["Governance",                    ADDR.GOV,           "l1-contracts/out/Governance.sol/Governance.json"],
  ["ChainAdminOwnable (ecosystem)", ADDR.CA,            "l1-contracts/out/ChainAdminOwnable.sol/ChainAdminOwnable.json"],
  ["ChainTypeManager impl",         ADDR.CTM_IMPL,      "l1-contracts/out/ZKsyncOSChainTypeManager.sol/ZKsyncOSChainTypeManager.json"],
  ["ChainTypeManager proxy",        ADDR.CTM,           "l1-contracts/out/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json"],
  ["ValidatorTimelock proxy",       ADDR.VTL,           "l1-contracts/out/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json"],
  ["AssetRouter impl",              ADDR.AR_IMPL,       "l1-contracts/out/L1AssetRouter.sol/L1AssetRouter.json"],
  ["Verifier (ZKsyncOSDualVerifier)", ADDR.VER,         "l1-contracts/out/ZKsyncOSDualVerifier.sol/ZKsyncOSDualVerifier.json"],
  ["AdminFacet",                    ADDR.AdminFacet,    "l1-contracts/out/Admin.sol/AdminFacet.json"],
  ["ExecutorFacet",                 ADDR.ExecutorFacet, "l1-contracts/out/Executor.sol/ExecutorFacet.json"],
  ["MailboxFacet",                  ADDR.MailboxFacet,  "l1-contracts/out/Mailbox.sol/MailboxFacet.json"],
  ["GettersFacet",                  ADDR.GettersFacet,  "l1-contracts/out/Getters.sol/GettersFacet.json"],
  ["BlobsL1DAValidatorZKsyncOS",    ADDR.BlobsDA,       "da-contracts/out/BlobsL1DAValidatorZKsyncOS.sol/BlobsL1DAValidatorZKsyncOS.json"],
  ["RollupL1DAValidator",           ADDR.RollupDA,      "da-contracts/out/RollupL1DAValidator.sol/RollupL1DAValidator.json"],
  ["RollupDAManager",               ADDR.RDM,           "l1-contracts/out/RollupDAManager.sol/RollupDAManager.json"],
];

// ---------------- helpers ----------------
let fails = 0;
function check(label: string, got: string, want: string) {
  if (got.toLowerCase() === want.toLowerCase()) console.log(`  ✅ ${label}`);
  else { console.log(`  ❌ ${label}\n     got=${got}\n     want=${want}`); fails++; }
}

// strip Solidity's trailing CBOR metadata (last 2 bytes encode metadata length)
function stripMetadata(code: string): string {
  if (!code.startsWith("0x") || code.length < 8) return code;
  const metaLen = parseInt(code.slice(-4), 16);
  const stripChars = (metaLen + 2) * 2;
  if (stripChars >= code.length - 2) return code;
  return code.slice(0, code.length - stripChars);
}

// zero out byte ranges marked as immutable references by the compiler
function maskImmutables(code: string, artifact: any): string {
  if (!code.startsWith("0x")) return code;
  const refs = artifact?.deployedBytecode?.immutableReferences ?? {};
  const bytes = Buffer.from(code.slice(2), "hex");
  for (const id of Object.keys(refs)) {
    for (const ref of refs[id]) bytes.fill(0, ref.start, ref.start + ref.length);
  }
  return "0x" + bytes.toString("hex");
}

const normalize = (code: string, art: any) => stripMetadata(maskImmutables(code, art));

async function callView(to: string, sig: string, args: any[] = []): Promise<any> {
  const iface = new ethers.utils.Interface([`function ${sig}`]);
  const fn = sig.split("(")[0];
  const data = iface.encodeFunctionData(fn, args);
  const ret = await provider.call({ to, data });
  return iface.decodeFunctionResult(fn, ret);
}

// ---------------- main ----------------
async function main() {
  console.log(`Verifying chain 626 on ${RPC}\n\n--- State invariants ---`);

  check("diamond protocolVersion == v0.30.1",       (await callView(ADDR.DIAMOND, "getProtocolVersion() view returns (uint256)"))[0].toString(), EXPECT.PV);
  check("CTM.storedBatchZero matches Dawn",         (await callView(ADDR.CTM,     "storedBatchZero() view returns (bytes32)"))[0], EXPECT.SBZ);
  check("verifier VK matches Dawn",                 (await callView(ADDR.VER,     "verificationKeyHash() view returns (bytes32)"))[0], EXPECT.VK);
  check("bridgehub.owner == Governance",            (await callView(ADDR.BH,      "owner() view returns (address)"))[0], ADDR.GOV);
  check("bridgehub.admin == ChainAdmin",            (await callView(ADDR.BH,      "admin() view returns (address)"))[0], ADDR.CA);
  check("CTM is registered on bridgehub",           (await callView(ADDR.BH,      "chainTypeManagerIsRegistered(address) view returns (bool)", [ADDR.CTM]))[0].toString(), "true");
  check("bridgehub.getZKChain(626) == diamond",     (await callView(ADDR.BH,      "getZKChain(uint256) view returns (address)", [626]))[0], ADDR.DIAMOND);
  check("diamond.getChainId == 626",                (await callView(ADDR.DIAMOND, "getChainId() view returns (uint256)"))[0].toString(), "626");
  check("diamond.getBaseToken == ETH",              (await callView(ADDR.DIAMOND, "getBaseToken() view returns (address)"))[0], EXPECT.ETH);
  check("L1ERC20Bridge.ERA_CHAIN_ID == 324",        (await callView(ADDR.L1ERC20, "ERA_CHAIN_ID() view returns (uint256)"))[0].toString(), "324");
  const daPair = await callView(ADDR.DIAMOND, "getDAValidatorPair() view returns (address,address)");
  check("DA L1 validator = BlobsL1DAValidatorZKsyncOS", daPair[0], ADDR.BlobsDA);
  check("DA L2 commitment scheme = BLOBS_ZKSYNC_OS",   daPair[1], EXPECT.L2DA);

  if (STATE_ONLY) {
    console.log("\n(skipping bytecode checks — set ARTIFACTS=<path-to-built-era-contracts> to enable)");
  } else {
    console.log("\n--- Bytecode (on-chain vs local artifacts) ---");
    for (const [label, addr, art] of BYTECODE_PAIRS) {
      const artPath = path.join(ARTIFACTS!, art);
      if (!fs.existsSync(artPath)) { console.log(`  ⚠️ ${label}  artifact not found at ${artPath} (skip)`); continue; }
      const artifact = JSON.parse(fs.readFileSync(artPath, "utf8"));
      const expected = artifact.deployedBytecode?.object ?? artifact.deployedBytecode;
      if (!expected) { console.log(`  ⚠️ ${label}  no deployedBytecode in artifact (skip)`); continue; }
      const onchain = await provider.getCode(addr);
      if (onchain.toLowerCase() === expected.toLowerCase()) { console.log(`  ✅ ${label}  (exact match)`); continue; }
      const a = normalize(onchain, artifact).toLowerCase();
      const b = normalize(expected, artifact).toLowerCase();
      if (a === b) console.log(`  ✅ ${label}  (matches modulo metadata + immutables)`);
      else { console.log(`  ❌ ${label}\n     onchain keccak ${ethers.utils.keccak256(onchain)}\n     local   keccak ${ethers.utils.keccak256(expected)}`); fails++; }
    }
  }

  console.log();
  if (fails === 0) console.log("ALL CHECKS PASSED.");
  else { console.log(`${fails} CHECK(S) FAILED — see above.`); process.exit(1); }
}
main().catch((e) => { console.error(e); process.exit(1); });
