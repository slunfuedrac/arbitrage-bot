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
// 2012-08-21T12:11:22 – pVzFllNkLfnAfyJXaWJM
// 2012-08-22T12:30:31 – e7zYch3z61q3bxxkpLEO
// 2012-08-23T09:39:35 – pX4ChHFfv4kI7yOJs1FE
// 2012-08-24T13:02:58 – tgZjQDPFWnvTNW5cgzUK
// 2012-08-26T12:39:57 – wiDsRoh3NYCCZFQHj3hO
// 2012-09-06T01:07:58 – op1aooHgKkTbTQ2ClwbK
// 2012-09-07T22:51:50 – 1EianfnkbXUP8CeNYNaT
// 2012-09-09T02:25:43 – 9BcXXy1SKUup7pB9wE0Z
// 2012-09-10T06:47:55 – 2ToDKcoAoxF1dj4hdTCk
// 2012-09-11T13:59:50 – oPsVKzTfKsSCmzpaAm3b
// 2012-09-13T23:14:10 – D2Sxwke7WIPyaXYDT3rX
// 2012-09-17T00:46:10 – i2EU8UnkAxx0RhY9TTKm
// 2012-09-17T02:21:23 – jGvFtjzKQqd8ZbYzY75x
// 2012-09-18T20:12:10 – VaeWH4csd2qj5IcNiRGx
// 2012-09-20T15:50:04 – BDiNdzT5Act7jx2jQqWK
// 2012-09-20T17:32:38 – tKeimF1jkokRiDhleMIB
// 2012-09-21T07:13:01 – WQxfQa5cUeBzazlskfBO
// 2012-09-21T17:56:51 – amNHup2KNdn9MupaWPIt
// 2012-09-23T00:24:29 – XrQbYDc6Dl2vBuWQqAR7
// 2012-09-26T04:20:11 – Xmyc9DIwpGYBwQyglQkU
// 2012-09-27T23:47:07 – S5mIJFpmNEGfWRXbqEzA
// 2012-09-30T04:50:15 – pLsLClinykBm6ciAYMk2
// 2012-09-30T15:27:23 – MneIfmKbxxiZdScjG8Ep
// 2012-10-01T10:08:54 – kyxUcOncacEeglamVOSD
// 2012-10-04T15:54:08 – W8kAmrScCHGWgmDAKVo6
// 2012-10-06T17:24:46 – jISAARePkb3y3z87Geyl
// 2012-10-06T21:56:34 – 3MKeD3X4ywzzwtqAHPFV
// 2012-10-10T11:36:18 – WUZRTgeh7mj2qqApAUxr
// 2012-10-11T18:15:45 – VxPKUhSvxsO7YA6nDnY8
// 2012-10-11T23:05:26 – 5VaFoSYBSjU5JSPcaBy1
// 2012-10-14T16:02:12 – bCk5OAyGhl4eHmZXuBD1
// 2012-10-17T08:51:56 – 9FksnLP37LJ5b4LRjcU8
// 2012-10-20T19:17:51 – uyAEPi54hz6UL9Pr1c7T
// 2012-10-21T16:49:11 – OXbqomrYlOW75jGag437
// 2012-10-23T06:47:17 – QOdMH5NW7h0o06oV0mDp
// 2012-10-25T14:59:28 – 2Isf7nj8dlkPDuAv4096
// 2012-10-26T22:22:57 – oNRY64i53MB2nofpiMcD
// 2012-10-29T13:10:24 – 3StQVNjbvC0FctzLDyyv
// 2012-10-30T14:30:51 – uJoKX9sTvQChEv5WwEpf
// 2012-10-31T17:52:06 – eDYPkmgYUvGGB9r9c8eS
// 2012-11-01T14:40:59 – a23LOJOl24IgIN8bYPdc
// 2012-11-06T01:48:33 – GplOiE9u42GP5ckSKWkZ
// 2012-11-06T01:59:24 – umDNh9EpNHVOh5yf6IDV
// 2012-11-08T18:20:47 – QA5dC9qDnh8YlWnVuUcq
// 2012-11-09T03:59:32 – KlBWdfcMgUM47B91sasD
// 2012-11-11T02:13:19 – nUiTExSXlUN6dRHMetNv
// 2012-11-14T09:25:09 – hm7ubaI3mjYIKLZwIpsg
// 2012-11-21T19:28:45 – jki5XyOkX33JJGLee5r0
// 2012-11-24T13:04:33 – AlybRVFzyhHCCpX2K93o
// 2012-11-25T03:20:59 – aYx8pVFCecOA6oBO3t2e
// 2012-11-28T15:18:53 – WyH7WjRTbIQlwzvbAh3L
// 2012-12-01T01:44:52 – wu6DxFmCtdTqUc8gfdvg
// 2012-12-03T06:11:17 – BiLN4ugzGBmK3HblylRJ
// 2012-12-05T15:56:02 – q0MJV0bzba13YZrhKCWE
// 2012-12-07T14:16:44 – 32GQFDScr6x2WJnN5FEm
// 2012-12-08T10:29:27 – IKrieG5uIKddL6fxvNP8
// 2012-12-13T12:06:15 – MazuiK8lTzfcnDmS0kpd
// 2012-12-16T19:49:39 – CH2pujYJ09YjcvpcN8Nr
// 2012-12-21T08:57:24 – UzQJsaDTMrPWhAlToPPJ
// 2012-12-26T13:48:59 – c559XKycRoxwFXiXdT7a
// 2012-12-30T05:50:18 – tG0Ylp0KGma02eRLMBuH
// 2012-12-31T00:41:43 – mAwmV9hg841YAa1fppJy
