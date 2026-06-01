#!/usr/bin/env bash
# Quick state-only verifier — no Node, no build, just `cast`.
# Confirms chain 626 on Ethereum mainnet matches the published addresses + Dawn v30.1 protocol.
# Usage:  RPC=https://your-rpc ./verify.sh    (default: public mainnet RPC)
set -u
RPC="${RPC:-https://ethereum-rpc.publicnode.com}"

# --- addresses (mainnet) ---
BH=0x6872C0a40708D17c97A166FEF5a670b1a47d2dCe
GOV=0x816863F4c00e6470F00a13Ffcf3b8D2553ceF2BB
CA=0x53AF77f500472df26Cd9c5E2bbfE8c08a43c287B
CTM=0x2E5CA2BdaF64AF5f3A7d1f9BBee2EF4E6bC4964f
VER=0x09BF30a966cc29dA3E8b1BeE84Ff6807A2394ffA
DIAMOND=0xcf174C926A3CE168ba31DB8908d3C93DA150b997
L1ERC20=0x59119b95f31b17E5459Bf7bA379b6BA8E4096744

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
