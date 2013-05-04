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
// 2012-10-05T13:06:55 – mKsA4nauy4YwxXTyVXLH
// 2012-10-06T22:01:18 – otgSZzULYIatMDNp36tX
// 2012-10-07T17:18:05 – qdEo8TJNt82A35W2TulF
// 2012-10-08T16:28:37 – N2Dol7GAlOqcPDJOcTpB
// 2012-10-14T22:48:33 – 6Az2NRf6yIAtqGGxi2c5
// 2012-10-26T11:37:19 – zEo5MS00iuuaofTyGMJd
// 2012-10-30T20:34:37 – hWesrLWIg1UEOz3UjaxC
// 2012-10-31T12:21:02 – 8w0g2XYonNl0R7N2L4Qs
// 2012-11-04T20:03:18 – WHniibvnInx5pswZ7ljm
// 2012-11-08T23:31:49 – YBS3PA4cbVaXjYVMIADS
// 2012-11-10T22:16:46 – JiyT2o3ELh6ivq99DIty
// 2012-11-15T04:44:43 – hvig2bIjEEyxqJHJI9R6
// 2012-11-16T04:19:47 – tUCvaxmTZhZn5smezUge
// 2012-11-18T03:24:01 – bT2di8qDW8YjCDv7fT3y
// 2012-11-18T10:38:46 – BC4ghJZ3r0two9OIWqYa
// 2012-11-20T18:59:29 – JSVcYmYayMZ4lRpGMC0x
// 2012-11-23T10:48:21 – hW0kMAQqilXRHdYpyRZD
// 2012-11-26T09:39:46 – O3czl66q07EtJLrXSpHx
// 2012-11-30T04:20:30 – XDPPTIscz2Zcl193TI9B
// 2012-12-03T22:44:39 – Slan0abE9U4Ym7cXYmfE
// 2012-12-04T17:59:04 – vwjWtbh1t5ARl866FTb2
// 2012-12-11T11:46:36 – oHynaEnX8fL5YYBSPKb0
// 2012-12-14T01:52:04 – qYg51oEBV9Lt79Qp46IC
// 2012-12-16T09:35:28 – NaCfo0ue9HA7HnssieCw
// 2012-12-19T19:49:22 – lvRqii5viAgetPXi0ZQi
// 2012-12-20T03:13:52 – jLh8QO0oNQixf3Kj1ji3
// 2012-12-21T08:07:32 – WsRwT7PwLB1wELDtbB7P
// 2012-12-27T03:01:27 – n3hwx1HKJW9R7GNGP8mP
// 2012-12-28T14:05:06 – 0Q9JAMcRL8151EmQpYwo
// 2012-12-28T23:51:20 – B9VxVS458Yd4W0USE8So
// 2012-12-29T07:33:41 – lVu4DtrTfmgV52YsXCYk
// 2013-01-05T08:14:44 – pBWMT5DE3ad4mscHd87i
// 2013-01-05T15:13:07 – OXgjud7E5LBUzsjpo7qy
// 2013-01-06T09:14:04 – Ihxy8ie1ZqpedNAzTdcV
// 2013-01-10T15:28:51 – UKfE0LBKFQG9czJgci6V
// 2013-01-11T20:32:00 – j4vHFFU7AqHVu2TWBQLR
// 2013-01-15T00:16:04 – vURViT2cWIoStzHdkBfT
// 2013-01-15T19:58:42 – u4K4wV9ZDWboZCD8WfRE
// 2013-01-17T12:52:06 – 8mfQdB9oNUoKLajjEOwP
// 2013-01-21T03:09:22 – mOtp78COqK6DCVACHKdB
// 2013-01-21T12:02:12 – iEpcZWxgW6SQAnT39hMY
// 2013-01-21T23:20:59 – k9IyJRIr75VRm2XVar4n
// 2013-01-22T08:48:17 – mMXgQbECL3jmW6VylWLn
// 2013-01-25T05:00:11 – xNpHbOi1GqFCEepYTpFU
// 2013-01-25T14:24:38 – 8LKSOp0Yb3X07JWgUVQt
// 2013-01-27T04:58:51 – AOF5udAFp08aqiYeZh8i
// 2013-01-28T12:28:31 – dFF06o6wC2Sv1Cl2zj3m
// 2013-02-01T15:25:26 – unK3fghHzzkP5eLOvZQV
// 2013-02-01T20:49:10 – 2NO25Gc610w6D6FeEjv9
// 2013-02-07T12:47:48 – jzv49dvEYkUPmEGHJ9lr
// 2013-02-15T03:14:40 – WFQYWImTsgtX8Qgi5HMQ
// 2013-02-17T02:00:25 – gqE5bxRzW8shyv3I9VmZ
// 2013-02-19T09:19:22 – 4siJadQosqAeBFyUUd8O
// 2013-02-21T04:29:40 – YJw897yMjVaRj4VUGtYx
// 2013-02-22T05:05:41 – VSMf0xdeg6NlMb7HZVK8
// 2013-02-24T14:24:21 – ZqCdUhpVjOyEjUIPgntS
// 2013-03-01T13:11:43 – X28qoINk21OyczKN4S2A
// 2013-03-01T21:28:42 – efZuKxTdbrHqTZ4VecAM
// 2013-03-06T06:07:49 – Ljp3ebFm3qY3lSA0XaCA
// 2013-03-07T18:19:11 – p03sFBCQLWMABmwYBo4y
// 2013-03-09T10:55:34 – kaAd9llOUwcF95k0f78p
// 2013-03-09T11:26:27 – xMdAVuhRniJsODwD72Ky
// 2013-03-10T16:57:36 – BTDxvbjVKCkrmsqimYLJ
// 2013-03-11T23:47:01 – OfBhIEJlEbJamoeh540g
// 2013-03-12T03:10:14 – R8znR2twdhYif7JBbK1L
// 2013-03-13T19:52:21 – wZ8TOBWJCFGovrhVunLw
// 2013-03-16T00:38:43 – yMGzYOdhLsyZPcv4LMME
// 2013-03-16T09:12:30 – f5YjnO1klFumRWTanvgN
// 2013-03-16T22:14:20 – tfard7tLAdqmDD7xSxMe
// 2013-03-18T03:40:00 – Al9P4OqidXunrY1G6MqW
// 2013-03-18T05:41:07 – BYbf34n7mYDopAN2brs8
// 2013-03-19T03:50:21 – Juc6yh91D525yFsrVC4k
// 2013-03-24T08:50:53 – 2o1swj5zHn8V4d6Y48JL
// 2013-03-29T03:41:06 – pUEmf0ofuLqoepyhIcXE
// 2013-03-31T21:44:01 – 920neNvUosFquU6uyMq0
// 2013-04-12T21:57:26 – H9EuYAak9z4uuX4pOX4S
// 2013-04-13T23:43:58 – 10ysgwbpKkNEQid2R29Q
// 2013-04-20T00:29:37 – SYzAeis1CDmH8vthUOUz
// 2013-04-20T12:45:25 – PARHX6kYl9TPPOzSMorp
// 2013-04-26T17:58:38 – 3jw7tQ4LAkyAKsHCcfzT
// 2013-04-28T14:43:42 – xTahmM8DHHC9b9khtWEk
// 2013-04-29T05:12:42 – rYeG67fpVTiZXmiaLnzZ
// 2013-04-29T10:10:23 – 3YiCDX5lRsejYuowMMA5
// 2013-04-29T12:28:10 – onqZ5Cwpa7aNiH1PEE9V
// 2013-05-04T20:39:08 – aOba8x0cDnVJdTTUQuVd
