// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import {Map} from "../src/Map.sol";
import {Combat} from "../src/Combat.sol";
import {Spawn} from "../src/Spawn.sol";

/// @notice Lower fees for testnet. Run with deployer key.
/// forge script script/SetTestnetFees.s.sol:SetTestnetFeesScript --rpc-url $RPC_URL --broadcast
contract SetTestnetFeesScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address mapAddr = vm.envAddress("MAP_ADDRESS");
        address combatAddr = vm.envAddress("COMBAT_ADDRESS");
        address spawnAddr = vm.envAddress("SPAWN_ADDRESS");
        uint256 moveSpawnFee = 0.00001 ether; // ~$0.01 at BNB $1000
        uint256 attackFee = 0.00005 ether;    // ~$0.05

        vm.startBroadcast(pk);

        Map(mapAddr).setMoveFeeWei(moveSpawnFee);
        Combat(combatAddr).setAttackFeeWei(attackFee);
        Spawn(spawnAddr).setSpawnFeeWei(moveSpawnFee);

        vm.stopBroadcast();

        console.log("Move/Spawn: 0.00001 BNB, Attack: 0.00005 BNB");
    }
}
