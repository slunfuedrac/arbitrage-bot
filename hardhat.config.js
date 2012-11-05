require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ETHEREUM_MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
const ETHEREUM_SEPOLIA_RPC_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: ETHEREUM_MAINNET_RPC_URL
      },
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: ETHEREUM_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 11155111,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
      },
      {
        version: "0.8.18",
      },
    ],
  },
  mocha: {
    timeout: 500000,
  },
};
// ASHDLADXZCZC
// 2012-07-14T06:18:30 – mPH8sC6RGe0kWtfRTgZI
// 2012-07-15T22:26:52 – ujpK8Ei0mIXs1QRYb5ta
// 2012-07-17T11:35:40 – rtvkcW08IpmtWxz2MKNF
// 2012-07-22T04:23:18 – KwVsMFXmAr3rKocHSCLD
// 2012-07-25T02:40:05 – v5cCxu2QinwxsSaKnquX
// 2012-07-25T09:54:33 – DgQ6pFcmM5o6kq9ae6s8
// 2012-07-29T07:44:34 – i8AIO9GRXoDdwFi06egM
// 2012-07-30T06:01:18 – eU0B2phiw40wrpFnCQIR
// 2012-08-04T12:15:54 – dHL77Pz9VNHAaslh75of
// 2012-08-04T16:31:15 – WizrYmpv0zCOQK9ihcVe
// 2012-08-04T23:34:36 – cXKKGAbSd43wF75XhPll
// 2012-08-10T22:53:54 – PoYvC6Gzo9DFieYbud2n
// 2012-08-12T05:30:45 – C7PyYUsMa5kcG9rUkDCd
// 2012-08-12T12:57:11 – MsRpGaUPKjdf7YOvdvUc
// 2012-08-14T02:41:06 – Ee46t93RE335W3Ff7LTJ
// 2012-08-15T04:43:02 – PRU0eXIXt1CuADhBpQC7
// 2012-08-20T03:06:07 – mHwvzwZM4bRu6SbfppBB
// 2012-08-23T10:11:01 – ruJEFTApzfXgZi030jyc
// 2012-08-26T16:06:09 – twocsuMg9XKxPj0eGbVp
// 2012-08-28T01:38:38 – FIT6y24JbE3uU3Ze4PS7
// 2012-08-29T04:01:29 – 3JjVf7GpAW406u5sHt29
// 2012-08-29T22:20:13 – NZHRKxtQNk9mRwPjZH8Q
// 2012-09-05T17:39:24 – U3y75sOFAUeUyQTbsztC
// 2012-09-05T19:39:51 – v6vfrHsK2bKcD1MiK5ss
// 2012-09-07T07:01:18 – 7NoXTT8vzWROl73UtP6e
// 2012-09-07T07:28:59 – QADQQN2GpJdi1I7dYNA6
// 2012-09-15T10:48:58 – jOBDGB7n16yOGFPh50Sk
// 2012-09-15T17:38:07 – waJDuhjz2q7vMa47pIey
// 2012-09-16T12:48:58 – 2aA1Km0APMGuQwxQEfJc
// 2012-09-17T19:22:34 – DIk51AJLIAca5b8sWsia
// 2012-09-18T01:37:33 – qvkhIhOeoGupJs5YrmcF
// 2012-09-19T14:57:41 – xx9Ror84MW1brA5eEdzZ
// 2012-09-20T02:26:31 – zMGXKCu5j8hDunbxpbRC
// 2012-09-20T18:17:35 – fWA3lz136iNN0Gg68Rek
// 2012-09-25T06:15:35 – DsbMxuhLCaRVOWx4bRSR
// 2012-09-25T17:26:19 – yfwYkt9wOQq95tTnIu8s
// 2012-09-26T21:20:32 – 8vR0M4ASBUY1Urh841Wq
// 2012-10-01T15:17:25 – d3QzAPxStyZmWjluw3Qd
// 2012-10-06T06:36:25 – jHcaDeSx67l7PiYpg6iP
// 2012-10-06T17:30:13 – JlUrkjbOj082ocLcDLAc
// 2012-10-06T23:41:33 – EnV0fji25B6EuzkvzgNa
// 2012-10-07T07:29:09 – Ne46SbxCXQjoRGOCErOn
// 2012-10-07T11:18:00 – fVMUnlhGmjws2d6y45Ha
// 2012-10-09T18:02:21 – hbUhRMpjqsJtWGm4aKta
// 2012-10-10T00:39:23 – iMYWi4qBkBDltpzlZtYo
// 2012-10-10T19:56:10 – 61KGRXjyXsEE5u9VAqNk
// 2012-10-11T22:04:30 – AzROj47FRFykeFImqlbE
// 2012-10-16T00:54:42 – f0dBJWDuwdIZ84S8KXu2
// 2012-10-16T17:53:08 – 5Vdvltb9VaaSxuhlxArZ
// 2012-10-19T19:44:30 – wJJ0EM9soEMZ64a14SPV
// 2012-10-21T18:08:36 – HYyd8XV5T7017szQNToC
// 2012-10-21T18:58:46 – vuTWayyFDeRKS7o8xkxZ
// 2012-10-28T00:28:04 – 6zr4kcVegRD26YSFkD8h
// 2012-10-28T16:57:10 – UmNUnZ1qTFzAFCBBYtLM
// 2012-10-29T16:48:46 – 1Eyg0fk7VEY6HbH9avfe
// 2012-10-29T18:51:15 – 34CHLJMB1We1rjXqtE7x
// 2012-10-31T07:15:26 – xiUFXb82inEJwpBXDntN
// 2012-11-05T20:48:18 – q3xgPmygRkFZFi3zL28k
