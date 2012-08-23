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
