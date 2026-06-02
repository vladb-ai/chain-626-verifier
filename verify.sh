#!/usr/bin/env bash
# Quick state-only verifier — no Node, no build, just `cast`.
# Confirms chain 626 on Ethereum mainnet matches the published addresses + Dawn v30.1 protocol.
# Usage:  RPC=https://your-rpc ./verify.sh    (default: public mainnet RPC)
set -u
RPC="${RPC:-https://ethereum-rpc.publicnode.com}"

# --- addresses (mainnet) ---
BH=0x6f85C08e2DabB6b0B8B3587D3628FCfb5b10BE19
GOV=0x6145cb32119D87360cC9eeF698B41E60911202C5
CA=0xbc8e06ABa0ef1cE015A5d9207b61B470D751404b
CTM=0x4Ee4EA87b909ea3E1C36d9fcbf6C0e535165f96D
VER=0x901f436531128B2669FcF43B0953Db9a154De3a6
DIAMOND=0xB44d26D227e0bD028d893BEc16DC1C7B168eCdE3
L1ERC20=0xBFb73C3bfEC1F9628caece5478577D56Fb01a2f0

# --- expected values (Dawn v30.1 protocol) ---
EXP_PV=128849018881
EXP_SBZ=0x18bd4bd6909643336ab04fcab99eff346bc4e74799aeeb2ed809341e3a1df6f9
EXP_VK=0x124ebcd537a1e1c152774dd18f67660e35625bba0b669bf3b4836d636b105337
EXP_L1DA=0x3E976F63373059C4CeBEad1dee0dEF4866018E4d
EXP_L2DA=0x0000000000000000000000000000000000000004

fail=0
check() { if [ "${2,,}" = "${3,,}" ]; then printf "  ✅ %s\n" "$1"; else printf "  ❌ %s\n     got=%s\n     want=%s\n" "$1" "$2" "$3"; fail=1; fi; }
get()   { cast call "$@" --rpc-url "$RPC" 2>/dev/null | head -1 | awk '{print $1}'; }

command -v cast >/dev/null || { echo "ERROR: 'cast' not found (install Foundry: https://book.getfoundry.sh/getting-started/installation)"; exit 1; }

echo "checking chain 626 on $RPC ..."
check "diamond protocolVersion == v0.30.1"        "$(get $DIAMOND 'getProtocolVersion()(uint256)')" "$EXP_PV"
check "CTM.storedBatchZero matches Dawn"          "$(get $CTM     'storedBatchZero()(bytes32)')"    "$EXP_SBZ"
check "verifier VK matches Dawn"                  "$(get $VER     'verificationKeyHash()(bytes32)')" "$EXP_VK"
check "bridgehub.owner == Governance"             "$(get $BH      'owner()(address)')"              "$GOV"
check "bridgehub.admin == ChainAdmin"             "$(get $BH      'admin()(address)')"              "$CA"
check "CTM is registered on bridgehub"            "$(get $BH      'chainTypeManagerIsRegistered(address)(bool)' $CTM)" "true"
check "bridgehub.chainTypeManager(626) == CTM"    "$(get $BH      'chainTypeManager(uint256)(address)' 626)" "$CTM"
check "bridgehub.getZKChain(626) == diamond"      "$(get $BH      'getZKChain(uint256)(address)' 626)" "$DIAMOND"
check "diamond.getChainId == 626"                 "$(get $DIAMOND 'getChainId()(uint256)')" "626"
check "diamond.getBaseToken == ETH"               "$(get $DIAMOND 'getBaseToken()(address)')" "0x0000000000000000000000000000000000000001"
check "L1ERC20Bridge.ERA_CHAIN_ID == 324"         "$(get $L1ERC20 'ERA_CHAIN_ID()(uint256)')" "324"

read -r L1DA L2DA < <(cast call $DIAMOND 'getDAValidatorPair()(address,address)' --rpc-url "$RPC" 2>/dev/null | tr '\n' ' ')
check "DA L1 validator = BlobsL1DAValidatorZKsyncOS" "$L1DA" "$EXP_L1DA"
check "DA L2 commitment scheme = BLOBS_ZKSYNC_OS"    "$L2DA" "$EXP_L2DA"

echo
[ $fail -eq 0 ] && echo "ALL STATE CHECKS PASSED — for full bytecode verification, see README." \
                || { echo "SOME CHECKS FAILED — see above."; exit 1; }
