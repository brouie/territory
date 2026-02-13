// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import {FeeCollector} from "../src/FeeCollector.sol";
import {GameMaster} from "../src/GameMaster.sol";
import {Map} from "../src/Map.sol";
import {Garrison} from "../src/Garrison.sol";
import {Combat} from "../src/Combat.sol";
import {UnitFactory} from "../src/UnitFactory.sol";
import {Spawn} from "../src/Spawn.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address treasury = vm.envOr("TREASURY", address(0x1111111111111111111111111111111111111111));
        address router = vm.envOr("ROUTER", address(0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb));
        address cl8y = vm.envOr("CL8Y_TOKEN", address(0));
        address wbnb = vm.envOr("WBNB", address(0x4200000000000000000000000000000000000006));
        address gold = vm.envOr("GOLD_TOKEN", address(0));

        if (cl8y == address(0) || wbnb == address(0)) {
            revert("Set CL8Y_TOKEN and WBNB env vars for mainnet");
        }

        vm.startBroadcast(deployerPrivateKey);

        FeeCollector feeCollector = new FeeCollector(treasury, router, cl8y, wbnb);
        GameMaster gameMaster = new GameMaster();
        Map map = new Map(address(feeCollector), 0.001 ether);
        Garrison garrison = new Garrison(address(gameMaster), address(map));
        Combat combat = new Combat(address(feeCollector), address(gameMaster), address(map), address(garrison));

        gameMaster.setGameContract(address(garrison));
        gameMaster.setGameContract(address(combat));
        garrison.setGameContract(address(combat));
        map.setCombatContract(address(combat));

        UnitFactory unitFactory = new UnitFactory();
        unitFactory.createToken(1);

        Spawn spawn;
        if (gold != address(0)) {
            spawn = new Spawn(address(gameMaster), address(feeCollector), address(unitFactory), address(map), gold);
            gameMaster.setGameContract(address(spawn));
            unitFactory.setTokenMinter(1, address(spawn));
        }

        vm.stopBroadcast();

        console.log("FeeCollector:", address(feeCollector));
        console.log("GameMaster:", address(gameMaster));
        console.log("Map:", address(map));
        console.log("Garrison:", address(garrison));
        console.log("Combat:", address(combat));
        console.log("UnitFactory:", address(unitFactory));
        if (gold != address(0)) console.log("Spawn:", address(spawn));
    }
}
