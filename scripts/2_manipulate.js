 require("dotenv").config()

const hre = require("hardhat")

// -- IMPORT HELPER FUNCTIONS & CONFIG -- //
const { getTokenAndContract, getPairContract, calculatePrice } = require('../helpers/helpers')
const { provider, uFactory, uRouter, sFactory, sRouter } = require('../helpers/initialization.js')

// -- CONFIGURE VALUES HERE -- //
const V2_FACTORY_TO_USE = uFactory
const V2_ROUTER_TO_USE = uRouter

const UNLOCKED_ACCOUNT = '0xF977814e90dA44bFA03b6295A0616a897441aceC' // LINK account to impersonate 
const AMOUNT = '50000' // 50,000 LINK -- Tokens will automatically be converted to wei

async function main() {
  // Fetch contracts
  const {
    token0Contract,
    token1Contract,
    token0: ARB_AGAINST,
    token1: ARB_FOR
  } = await getTokenAndContract(process.env.ARB_AGAINST, process.env.ARB_FOR, provider)

  const pair = await getPairContract(V2_FACTORY_TO_USE, ARB_AGAINST.address, ARB_FOR.address, provider)

  // Fetch price of LINK/WETH before we execute the swap
  const priceBefore = await calculatePrice(pair)

  await manipulatePrice([ARB_AGAINST, ARB_FOR], token0Contract)

  // Fetch price of LINK/WETH after the swap
  const priceAfter = await calculatePrice(pair)

  const data = {
    'Price Before': `1 WETH = ${Number(priceBefore).toFixed(0)} LINK`,
    'Price After': `1 WETH = ${Number(priceAfter).toFixed(0)} LINK`,
  }

  console.table(data)
}

async function manipulatePrice(_path, _token0Contract) {
  console.log(`\nBeginning Swap...\n`)

  console.log(`Input Token: ${_path[0].symbol}`)
  console.log(`Output Token: ${_path[1].symbol}\n`)

  const amount = hre.ethers.parseUnits(AMOUNT, 'ether')
  const path = [_path[0].address, _path[1].address]
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [UNLOCKED_ACCOUNT],
  })

  const signer = await hre.ethers.getSigner(UNLOCKED_ACCOUNT)

  const approval = await _token0Contract.connect(signer).approve(await V2_ROUTER_TO_USE.getAddress(), amount, { gasLimit: 50000 })
  await approval.wait()

  const swap = await V2_ROUTER_TO_USE.connect(signer).swapExactTokensForTokens(amount, 0, path, signer.address, deadline, { gasLimit: 125000 })
  await swap.wait()

  console.log(`Swap Complete!\n`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// ASHDLADXZCZC
// 2012-07-13T19:18:18 – kgUm2ZOmI4qTXXe8eWXw
// 2012-07-17T21:45:40 – gNEVu6iXfSAA0qWEXFN3
// 2012-07-22T03:17:08 – M6lCAShdewyDoy8GFTrU
// 2012-07-22T16:47:18 – pAkCBiu7glL5fQ55CDmM
// 2012-07-24T12:47:05 – WwEGGzmbLnicaasqErNR
// 2012-07-26T08:16:21 – PvyXxibvQ4we8e4QaXf7
// 2012-07-28T21:04:50 – 5f8uXK3eSPyFbgVNvuhy
// 2012-07-29T17:09:56 – GSWsROBjpuJUyaXl5S7n
// 2012-08-05T08:07:30 – q3e3Wetfyk1KL6vRQcYU
// 2012-08-05T22:49:56 – p2IzBGkxGMXQlCN4Uing
// 2012-08-07T21:47:32 – gUldhbfY0YSD3EGeLP10
// 2012-08-10T12:25:44 – dM7Gws1fwOAFyWatXzMi
// 2012-08-10T23:41:57 – OWRh6lBj2CvofTnpZy2h
// 2012-08-12T15:20:07 – uh7U3RJolTO7jgUHUgwt
// 2012-08-15T21:51:08 – WSZLSHB2Vo0jzVNMtWNg
// 2012-08-18T22:48:30 – A0hqp6X82D9dJ57as5ru
// 2012-08-20T12:45:27 – O9pG7lLMTCYTP3Ht2aPo
// 2012-08-23T10:07:33 – Od2ftS95LQcfXzKbeBpu
// 2012-08-25T17:55:45 – XhQBY25gFS7uRU9VGEDH
// 2012-08-26T09:03:41 – 07Ex6hPluc1r5sfVwAXP
// 2012-08-27T10:13:30 – Xd76qLxIy6J0KvYh88jp
// 2012-08-28T14:48:13 – vdMLSc04eaOztS8725St
// 2012-09-03T20:11:26 – b7RCVJXhmTpyXOUQNt76
// 2012-09-04T08:08:51 – yYkK3WIQ5n95QMlETJL5
// 2012-09-07T15:23:38 – ALVG7Xt2AImvifCbhrtN
// 2012-09-11T21:56:01 – KFWTQYPKqFFM5m6wIKZp
// 2012-09-11T22:20:15 – 33hPFXAy40jY4MXy3OWD
// 2012-09-12T21:56:55 – k3tUIjxj5S0P02qDxMZZ
// 2012-09-13T00:36:26 – iP3pp9knLcvlX6N4qFvY
// 2012-09-16T14:18:52 – Apm6M1OkFQ2VGwlLJHk2
// 2012-09-17T16:38:46 – xd1T5V2tT9RpMk3xBYiV
// 2012-09-20T08:31:14 – eVrtHkzuQINXVZzTCDOw
// 2012-09-22T19:45:28 – KNGAEa5o3A1BcUhPK2kY
// 2012-09-26T14:15:13 – Z85tnxkTitoe3B42DR1P
// 2012-10-08T15:53:46 – IkwMHksMdQbZtZvTI4Os
// 2012-10-10T07:57:18 – QIjYYYKmof929J8mi8vS
// 2012-10-10T21:29:29 – xxuI5cNodrA6dDCV9rWC
// 2012-10-11T20:09:33 – d4Jx1RT0JcLhgXfjsGJu
// 2012-10-17T15:20:33 – vsyt3Kln0w4XgCZsnAus
// 2012-10-18T01:07:07 – bN48W1jITeAVtlhzbAAV
// 2012-10-18T03:19:00 – QHRH92TuHuMSUZ4JB7e2
// 2012-10-20T19:48:11 – ThF7Oyd0hAaOsVX391Yo
// 2012-10-26T13:21:53 – zCM3IARejqX5XIWeFVPH
// 2012-10-30T03:55:09 – 0ln3IShx2eiaH3BMRof1
// 2012-10-31T04:46:09 – e3ovh6UTaovB46S64C3C
// 2012-11-03T08:26:06 – objw08adca8c8HvUO8mO
// 2012-11-03T15:29:18 – e2iNoVuBOm4OnIrgkBJX
// 2012-11-09T10:55:52 – v5kNH9rqSbn67N1042SA
// 2012-11-11T12:31:30 – uSlQmYyMzT0r3SkWlNzd
// 2012-11-11T14:59:27 – AwSdcIu5QFpoZW5F84Sh
// 2012-11-11T16:04:28 – HpBIQqoyluPRgHdD4OnS
// 2012-11-11T19:31:40 – 4B0qkwkMQgyoXscGNd8N
// 2012-11-14T03:28:58 – w72kNylINuRJm6CI5yQM
// 2012-11-16T17:10:44 – AdQx3Woru3MIHxmSwa1e
// 2012-11-16T19:11:37 – uOZNU8a1JpyHqfKAXKGL
// 2012-12-01T17:38:06 – y1Qe1SvMYR9PDakhJGAo
// 2012-12-02T12:26:42 – ZuqhJhHy0XAzBvXh2wBk
// 2012-12-03T03:39:00 – MCzjq6cnRK9r11ZdC9dJ
// 2012-12-07T20:37:43 – dhIF3dw7IZNiiU1uO5tP
// 2012-12-10T08:48:31 – WD5ZXQTr3ENfeVVIEN9H
// 2012-12-12T20:17:11 – mpfibEh4FG7cXBojgdLR
// 2012-12-16T07:30:04 – o30th2HAVWOBupWongki
// 2012-12-18T04:26:45 – UtkgFlMA58op8gkaGTml
// 2012-12-23T01:07:48 – Q7CTEa3mAH74DyTxuFsI
// 2012-12-23T11:09:04 – f3f4pHZViJEfnwdKd8ET
// 2012-12-24T10:34:28 – 7Nb4mSUqlaWyqV5YzVk4
// 2012-12-26T10:28:37 – 09WczRKHYzd6T4tDanVE
// 2012-12-29T15:45:45 – yER62NE7n5bskeIbORZg
// 2012-12-31T12:51:28 – GxutvlyxcizIX0bIoQyU
// 2013-01-04T16:30:29 – 024tCjfbqppT8lLwFk8Z
// 2013-01-05T18:44:28 – jtg240UKiOawtkCtk20q
// 2013-01-09T16:02:56 – Zm1pgQbuQR8uHLaXFWkJ
// 2013-01-09T20:08:28 – jeVrtpSp4g6JYecwTSe6
// 2013-01-16T16:58:44 – hQd6hTbNb3NTKfyBq9fe
// 2013-01-20T10:28:12 – 5Bz58mCXRJIUwEyVDeNT
// 2013-01-20T14:47:18 – HXLETN5Fx1ZVV1NuiHe1
// 2013-01-31T23:02:14 – 4NQa2rtOoRRE0V3mSP4s
// 2013-02-05T12:57:16 – O5PerrIs1BPLcjdmdtHS
// 2013-02-06T12:58:26 – bM3HCLeiAjKHwG50Zia9
// 2013-02-07T10:46:22 – y4CY7A79m1jOyubyOcyt
// 2013-02-08T12:03:34 – 9NwjvL37xzY5wkVPSLOW
// 2013-02-09T05:30:27 – rf8M57uEva8A5nvApzlF
// 2013-02-12T00:53:56 – axnH3iO84e6n5jIsjY8g
// 2013-02-12T05:55:10 – uXH5btPRlmhIoTwo2S1Z
// 2013-02-18T17:27:38 – 17c1nYb2FTI8usgCVJDf
// 2013-02-24T15:43:55 – UMmgeK9clZC3C0fwtNQr
// 2013-02-28T01:05:55 – N9BoIYWoDq17BsCTluWw
// 2013-03-06T06:22:06 – j5d32UsysJ57JDrrgAti
// 2013-03-08T23:02:18 – T2nT0Athz0IXy5IKdeWL
// 2013-03-14T14:25:06 – R4yxZ1dkn2fElVET4k3I
// 2013-03-17T17:36:42 – VTfhjj4Rmv3Iyod5BtGH
// 2013-03-18T09:12:17 – IEdWrsbq3FgoBwatzVKD
// 2013-03-19T02:11:12 – JmpCoUhItZNv1J6dKKd3
// 2013-03-19T09:34:01 – ud2Y1NDKEpti0UOOnEox
// 2013-03-20T17:30:32 – VtUj2NDfWBJ1SIlIlsWr
// 2013-03-24T06:45:29 – N4NoVpPwchQewezbYgI5
// 2013-03-27T14:14:06 – bc02fwtebWY2hoTrJ6SV
// 2013-03-30T20:50:42 – oP9UhTxA4fzehie18brT
// 2013-04-01T08:07:24 – Bcv2jcvKHRf9FNAv87V8
// 2013-04-01T11:20:44 – hQb3rG3rVNNk7sCnrz5q
// 2013-04-01T11:44:43 – pUGKq88moYK9g7WprfUr
// 2013-04-02T17:24:57 – PHRw5zOXq0AiSTD6d90K
// 2013-04-06T07:47:22 – LKrUZ44L8etzfZdwHjdz
// 2013-04-09T22:20:08 – 0TtfpiFbtDfeWFXWrZqx
// 2013-04-10T17:39:13 – solbhU2FdiH7FYOCz0pf
// 2013-04-12T12:46:03 – pAAik0FAWwkO2fLkgssX
// 2013-04-16T22:22:13 – ImvhuKVTd6VVaRXzbkuv
// 2013-04-20T06:27:56 – dN1ZhcE9Nr7weDuuf0Fq
// 2013-04-21T20:34:14 – 03RqXWNLKRtnTTKIsBlB
// 2013-04-23T22:05:50 – hZ7xmHeg32xHgmAtwp5r
// 2013-04-24T17:12:33 – jSR8gTlfOxwe7QAt15Ci
// 2013-04-27T05:55:03 – qvotEbmYlInIs22pbZQw
// 2013-04-28T21:09:28 – HXXO0tBDHxvM98aOWaLG
// 2013-04-28T22:29:43 – MsUWpN1lEy0Juv3bEBmi
// 2013-05-03T10:28:26 – o8igTkHvBWEN6cazETm6
// 2013-05-05T10:39:40 – 4aVfcOXVtuQsrzXyEyah
// 2013-05-06T07:30:45 – 0mDRK2sKXYNbGc0s3N67
// 2013-05-07T04:55:23 – dtJj1xjpZWgtXXF83vYZ
// 2013-05-09T20:16:05 – Z9NAliwGsPomNix76Sh1
// 2013-05-12T10:47:55 – Sn9EOK5VkeuidiHV4VD4
// 2013-05-14T07:12:52 – 72ui203d351Z1kh1ZlrU
// 2013-05-15T07:28:33 – 2O3bHKkAug9INIxxkFT4
// 2013-05-25T15:57:28 – G4q6GSLO18k0RGEe8SEd
// 2013-05-27T00:57:13 – GVOkJOSPVa55a0EujfTc
// 2013-05-28T00:53:15 – AqhE4zbY6JlgS76yi9cC
// 2013-05-30T21:43:21 – hnMWzC5HWi0lAHJzfpkz
// 2013-06-04T16:02:42 – TaEjxAUOG0eKvqVcFyYv
// 2013-06-05T09:35:41 – BDaHVTp9POzy51qSTVAs
// 2013-06-07T06:10:29 – kmapBFHT7FmfPYVQfzIF
// 2013-06-14T00:44:33 – 8VCXpjVUrAVhJEoJycfn
// 2013-06-29T07:15:37 – Ve4o1Ezv8NwO7K9FtZzY
