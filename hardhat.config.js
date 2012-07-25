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
