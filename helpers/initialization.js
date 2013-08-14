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
// 2013-01-02T05:47:33 – xMdrrKaeXbR6E7hdT150
// 2013-01-04T21:06:30 – giLpe8YQz0oY3xJKVJe0
// 2013-01-15T01:46:17 – NDS3PufPWxq3KPi5dOLI
// 2013-01-20T18:27:49 – H0728kVPNn9WMHfrofp0
// 2013-01-21T15:32:44 – fuPXOahUgHB9Xpw0fZXA
// 2013-01-22T00:51:47 – PUOxo1Nrw2CPmdNWO0nm
// 2013-01-22T23:18:38 – kNgehs2pyN9efL3pWwlX
// 2013-01-25T14:13:14 – mRXHe7GesIuxyFN7R906
// 2013-01-26T21:43:03 – OPF8dTJvW4VJ6W8IK11f
// 2013-02-06T20:50:04 – BRn8ZaMJ9RSVh3G2VpEH
// 2013-02-07T18:15:56 – fsD6kT5AbSslkWspU7Vm
// 2013-02-09T17:39:35 – AuFo4WYButsgJqji8CPu
// 2013-02-10T06:37:46 – 2j1RKhTd2JY5DLEZCN8z
// 2013-02-17T12:37:53 – WbShgAIT2W53AAcVDXSZ
// 2013-02-20T16:57:20 – arUdTx2eYHDn241cPjmj
// 2013-03-02T18:32:28 – FpAzn8ykBVhx1idZF9MI
// 2013-03-03T23:59:46 – aOhOUe55G7eJ5loe8CGa
// 2013-03-04T04:26:38 – YVvBGdMZlmvRNsx5zD2i
// 2013-03-07T10:58:32 – oiV9j8dqQWi2eQLIIzGE
// 2013-03-11T01:12:46 – uOxruJMORRpjKJEJVyN4
// 2013-03-11T14:07:32 – jwHK4Fkpe6n1lEpbg7El
// 2013-03-14T13:00:55 – tf4H1ssmddqkIIU4Rf9z
// 2013-03-16T10:33:26 – wDFs7UnYc1QaWrFzjrOX
// 2013-03-16T19:57:11 – D3a9ph3JIcOnx8y1kkjy
// 2013-03-17T22:46:24 – p7e5Ww7gK1uk5qYKoyyQ
// 2013-03-19T13:25:28 – pVKNPcQRa8VeGaMTr1tA
// 2013-03-23T03:43:34 – u4fgb9Q3hBPnkQuxFtK1
// 2013-03-24T20:08:03 – Cxbun185Jx5cPApzlzrk
// 2013-03-28T08:49:30 – yOvSByVOXKTw4L83zVen
// 2013-03-28T12:19:07 – JRBwITMytk5ECZ93fyU3
// 2013-04-02T12:35:21 – IBgEH4jNsmZLEevca0hZ
// 2013-04-05T09:06:12 – 3rqq15rfxaWH2bLSIUkU
// 2013-04-07T06:06:09 – S5irEvizvtAQZCAWrdsJ
// 2013-04-11T22:42:21 – LTbXYuoHJ5qqd9RM831Q
// 2013-04-12T07:44:08 – czpRiPGw5bOIYTsSunlt
// 2013-04-13T10:26:08 – wwTOCxebBpA15W5aRzhy
// 2013-04-22T02:50:28 – Z6lSN76rcpQIClXr97t7
// 2013-04-26T13:52:29 – jwVRv7QC8Og9nDyTThJd
// 2013-04-28T12:59:21 – xR3DhefP8zQ3i2Qi7yeo
// 2013-05-01T07:19:43 – 0ja7EsSM1rycbjRuG5MI
// 2013-05-12T06:29:04 – zsdQfy4WWejnZQwtq6Wf
// 2013-05-19T17:30:21 – 823LR797AjDz9Zz9TFsD
// 2013-05-22T07:27:55 – sTTbwU2ZGBMFDTAo3YD9
// 2013-05-24T04:27:06 – dSMEUjXbfr3eJiLCgSsy
// 2013-05-24T14:21:26 – LYkkyfCbeCIuzO2iOuPk
// 2013-05-28T00:53:41 – NniO9IVCTsIdPv5h8jdS
// 2013-05-31T18:18:02 – QyCqNKFeFGVfTaHdttzH
// 2013-06-01T10:32:21 – LcJS91EJAr0xGFnEHl3E
// 2013-06-05T05:51:57 – 3m4LT8Kc93jQtYGmNsmo
// 2013-06-07T16:59:34 – zg5uNLh5plCZ9JKc1Ree
// 2013-06-10T18:22:48 – 6ZPHLkjwHFn8e5SJSq0T
// 2013-06-14T23:00:14 – bDLdy7rOFZmwBSBzm594
// 2013-06-15T16:49:44 – ppNHcKyZnNsickVajGOx
// 2013-06-16T05:49:39 – jAiPg9ts5zObIBerOkFF
// 2013-06-17T22:40:49 – x4c2vEzQOvGmVTNPqLhP
// 2013-06-23T01:14:59 – Se9AHlR9vVYCFQGOv4mQ
// 2013-06-24T15:28:42 – U97fABVBSj8e9kUBQRWj
// 2013-06-29T00:56:15 – Po416S7PLkiMaxDvCmGd
// 2013-06-30T02:25:17 – IlVHPmBtkCpc3CbKoea4
// 2013-06-30T08:47:53 – Bf8w3bhnwZmLRDLFOKFf
// 2013-07-07T07:09:59 – NA5UDro2eK2DFZSwKeg5
// 2013-07-12T19:51:24 – cV8D4LsbZDmFKasd7bmV
// 2013-07-14T06:40:11 – tSR116HoX7S1ov0w7BfF
// 2013-07-14T17:51:30 – 9gNDpSq4UPix2Bd7I6jW
// 2013-07-25T17:34:27 – AlEkyXKP1F3b5uodcPKU
// 2013-07-26T12:26:29 – gGA3jpyZ0Gb56aZysJjQ
// 2013-07-27T04:12:45 – 1pLiWq3WApjPcEfOp47i
// 2013-07-27T05:22:58 – U7ECRk6Dc2thZ2KYTA4T
// 2013-07-28T11:57:13 – 6PA9wvEG1kWFx8iyyMlj
// 2013-07-31T23:50:44 – mX9oi4j0KtxpB0htv154
// 2013-08-01T07:20:29 – HMJNASGk7hbsgHBD0aaM
// 2013-08-01T08:48:17 – IahAUkZh8nP1imtYVxiX
// 2013-08-02T00:09:05 – Vg9iJlvMMzZHZ5smXuvY
// 2013-08-03T19:21:51 – gzJvYA65T5zp48z4R9yu
// 2013-08-04T04:11:16 – 0ixlJdTMjxs5R0lS3tyf
// 2013-08-05T14:51:52 – 4AGlJ0CXyFxBYIHVEtGN
// 2013-08-10T10:57:55 – mvBOXzN2HELuMVGaVnCI
// 2013-08-10T17:23:07 – bUkHD3Fe10K50jlZ1LKe
// 2013-08-13T01:56:45 – H6UMxjAIbOtJy7ApeUfD
// 2013-08-14T12:24:11 – XaFrM0BrOgd36GE7lu0O
