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
import {MockRouter} from "../src/mocks/MockRouter.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        bool testnet = vm.envOr("TESTNET", uint256(0)) != 0;

        address deployer = vm.addr(deployerPrivateKey);
        address treasury = vm.envOr("TREASURY", deployer);
        address dao = vm.envOr("DAO_TREASURY", deployer);
        address router = vm.envOr("ROUTER", address(0));
        address cl8y = vm.envOr("CL8Y_TOKEN", address(0));
        address wbnb = vm.envOr("WBNB", address(0x4200000000000000000000000000000000000006));
        address gold = vm.envOr("GOLD_TOKEN", address(0));

        if (testnet) {
            if (cl8y == address(0)) cl8y = address(0); // will be set below
            if (router == address(0)) router = address(0); // will be set below
            if (gold == address(0)) gold = address(0); // will be set below
        } else if (cl8y == address(0) || wbnb == address(0)) {
            revert("Set CL8Y_TOKEN and WBNB env vars for mainnet");
        }

        vm.startBroadcast(deployerPrivateKey);

        if (testnet) {
            MockRouter mockRouter = new MockRouter(treasury);
            router = address(mockRouter);
            MockERC20 mockCl8y = new MockERC20("CL8Y", "CL8Y");
            cl8y = address(mockCl8y);
            if (gold == address(0)) {
                MockERC20 mockGold = new MockERC20("Gold", "GOLD");
                mockGold.mint(deployer, 10000 ether);
                gold = address(mockGold);
            }
        }

        uint256 moveFee = 0.00001 ether;   // ~$0.01 at BNB $1000
        uint256 spawnFee = 0.00001 ether;
        uint256 attackFee = 0.00005 ether;  // ~$0.05, expensive action

        FeeCollector feeCollector = new FeeCollector(treasury, dao, router, cl8y, wbnb);
        GameMaster gameMaster = new GameMaster();
        Map map = new Map(address(feeCollector), moveFee);
        Garrison garrison = new Garrison(address(gameMaster), address(map));
        Combat combat = new Combat(address(feeCollector), address(gameMaster), address(map), address(garrison), attackFee);

        gameMaster.setGameContract(address(garrison));
        gameMaster.setGameContract(address(combat));
        garrison.setGameContract(address(combat));
        map.setCombatContract(address(combat));

        map.addLocation(1);
        map.addLocation(2);
        map.addLocation(3);
        map.addLocation(4);
        map.addEdge(1, 2);
        map.addEdge(1, 3);
        map.addEdge(2, 3);
        map.addEdge(2, 4);
        map.addEdge(3, 4);
        map.setLocationBasePower(1, 50 ether);

        UnitFactory unitFactory = new UnitFactory();
        unitFactory.createToken(1);

        Spawn spawn;
        if (gold != address(0)) {
            spawn = new Spawn(address(gameMaster), address(feeCollector), address(unitFactory), address(map), gold, spawnFee);
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
        if (gold != address(0)) {
            console.log("Spawn:", address(spawn));
            console.log("Gold:", gold);
        }
        if (testnet) {
            console.log("MockRouter:", router);
            console.log("MockCL8Y:", cl8y);
        }
    }
}
