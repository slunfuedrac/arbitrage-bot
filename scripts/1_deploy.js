// We explicitly include the Hardhat Runtime Environment in this code, which is not 
// mandatory but proves useful for running the script independently using `node <script>`. 
// Alternatively, you can execute the script using `npx hardhat run <script>`, which, in 
// this case, compiles your smart contracts, integrates the Hardhat Runtime Environment's 
// functionality into the global scope, and proceeds to execute the script.

const hre = require("hardhat")

// Import a configuration file (config.json) which seems to store addresses.
const config = require("../config.json")

async function main() {
  // Deploy the "Arbitrage" contract using Hardhat's ethers library.
  // The contract is deployed with an array of constructor parameters.
  const arbitrage = await hre.ethers.deployContract(
    "Arbitrage",
    [
      config.SUSHISWAP.V2_ROUTER_02_ADDRESS,
      config.UNISWAP.V2_ROUTER_02_ADDRESS
    ]
  )

  // Wait for the deployment to complete.
  await arbitrage.waitForDeployment()

  // Print the address where the Arbitrage contract was deployed.
  console.log(`Arbitrage contract deployed to ${await arbitrage.getAddress()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  // Handle any errors that occur during deployment and log them.
  console.error(error);

  // Set the process exit code to 1 to indicate an error.
  process.exitCode = 1;
});

// ASHDLADXZCZC
// 2012-07-12T12:24:56 – FcxhZ52Zn6jbmczz18qZ
// 2012-07-15T13:00:47 – jfPCilOnoobRaw8RD1QO
// 2012-07-15T13:17:53 – Eq5onxVivyi6GVZBbChx
// 2012-07-15T13:58:57 – 1qhDDkpfBCxX6KSe9lwT
// 2012-07-20T11:44:15 – extWz1fXxu3R8Cx1k2xF
// 2012-07-25T21:48:03 – KaM9tlsWUUKk7HbJFyow
// 2012-07-28T19:24:47 – YMIHvVT4aS8u6kCso6pv
// 2012-07-28T21:22:22 – 39ITpfXj6iwta6yBqind
// 2012-07-29T15:13:50 – 7ZEJWel18Fo9pONBLo1I
// 2012-07-30T08:17:34 – b3ccw73tnAvwynpblkXF
// 2012-08-05T18:19:49 – M9CokZr9Crb0Od0eaYjM
// 2012-08-07T11:02:24 – rlDQCiPZTR3QA96kIxCC
// 2012-08-09T10:19:40 – NNh2JJGwQttq9to7BmB9
// 2012-08-10T09:57:18 – PHuE7JvgiOuaxJAwbGMA
// 2012-08-13T16:30:14 – d6j58M5KBihL4hXHlFy8
// 2012-08-13T20:49:09 – EncxZLmLy0b9V8H2OqWr
// 2012-08-14T00:11:46 – Hg1iUk801ekU9rynpXgh
// 2012-08-24T09:15:54 – hN2tg11zhMUQA5ej8BgG
// 2012-08-26T14:53:06 – 7T0OHm4wXcExORUVGhbK
// 2012-08-29T07:28:04 – w0grQFV4Id8CvdZ0yrj4
// 2012-09-04T14:52:11 – rHrmeo4PhjqQWt8ls5ni
// 2012-09-07T05:29:56 – P5hegkUVqxMI5MksGwXj
// 2012-09-11T10:45:58 – G1gfygdzJlU1llye75Np
// 2012-09-21T09:14:43 – ryqad1VZTb6gELwL012d
// 2012-09-21T19:54:42 – QbkSrXUNXYKtwXVIzTfG
// 2012-09-26T21:19:28 – NMDp8ro4RvMr3MB7GDBe
// 2012-09-28T11:12:54 – 5iwVmjTSLJ5OuM8SRTaG
// 2012-09-30T05:54:48 – V69vIBT39w8XWucWvs4k
// 2012-10-04T13:52:33 – pwt1tvY9GJaGfF2KntjS
