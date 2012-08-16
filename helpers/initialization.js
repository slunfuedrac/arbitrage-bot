// Import required dependencies
const hre = require("hardhat");
require("dotenv").config();

/**
 * This file serves the purpose of initializing key contracts, 
 * including the V2 router and factory, and also 
 * initializing the `Arbitrage.sol` contract.
 */

// Load configuration from the config.json file
const config = require('../config.json');

// Import Ethereum and Uniswap/Sushiswap contract ABIs
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");

let provider;

// Check if the project is running locally or on a live network
if (config.PROJECT_SETTINGS.isLocal) {
  // Use a local WebSocket provider
  provider = new hre.ethers.WebSocketProvider(`ws://127.0.0.1:8545/`);
} else {
  // Use Infura WebSocket provider with the specified API key
  provider = new hre.ethers.WebSocketProvider(`wss://eth-mainnet.g.alchemy.com/v2/${process.env.Infura_API_KEY}`);
}

// -- SETUP UNISWAP/SUSHISWAP CONTRACTS -- //

// Create Ethereum contract instances for Uniswap and Sushiswap factory and router
const uFactory = new hre.ethers.Contract(config.UNISWAP.FACTORY_ADDRESS, IUniswapV2Factory.abi, provider);
const uRouter = new hre.ethers.Contract(config.UNISWAP.V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, provider);
const sFactory = new hre.ethers.Contract(config.SUSHISWAP.FACTORY_ADDRESS, IUniswapV2Factory.abi, provider);
const sRouter = new hre.ethers.Contract(config.SUSHISWAP.V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, provider);

// Import the Arbitrage contract ABI
const IArbitrage = require('../artifacts/contracts/Arbitrage.sol/Arbitrage.json');

// Create an instance of the Arbitrage contract
const arbitrage = new hre.ethers.Contract(config.PROJECT_SETTINGS.ARBITRAGE_ADDRESS, IArbitrage.abi, provider);

// Export the initialized provider and contract instances for external use
module.exports = {
  provider,
  uFactory,
  uRouter,
  sFactory,
  sRouter,
  arbitrage
};

// ASHDLADXZCZC
// 2012-07-11T17:25:15 – WTHYYVNAN45LjoSrvgIV
// 2012-07-14T17:55:08 – toTwjtJcfluyFpLeHpM7
// 2012-07-19T01:43:55 – f38KWeH8YFzID3WJotWW
// 2012-07-19T16:01:22 – N3YowgdZfgYTsg5bP9rM
// 2012-07-19T21:59:41 – bPzq54f9YUmQJJMPbvdw
// 2012-07-21T23:08:54 – Bqk26hzauJ8DMiMTb5Zd
// 2012-07-23T23:47:53 – RzgY1zpymS8bNuw6tOgY
// 2012-07-25T16:22:27 – 2hNPEuRDeOktddG2YgSQ
// 2012-07-28T18:01:07 – DNwY5qBBFVTrGbcARMmE
// 2012-08-02T10:16:32 – rRrm0o19oWAGeE8zmkm6
// 2012-08-04T19:00:34 – 19veRazeY5geMcKLDS5m
// 2012-08-09T18:09:34 – EYxLCNZB03eE7EJhYI7Y
// 2012-08-11T19:51:50 – xPH2U35D6VL0xZjVC62c
// 2012-08-16T08:52:33 – JJAB1pyk9L9o8MX3DHcS
// 2012-08-16T15:24:43 – KBn7VnPNVR3Jnnea5nam
