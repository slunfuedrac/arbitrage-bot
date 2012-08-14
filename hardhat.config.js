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
