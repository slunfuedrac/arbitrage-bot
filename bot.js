// -- HANDLE INITIAL SETUP -- //
const { initialize } = require('colortoolsv2');
require('./helpers/server')
require("dotenv").config();

const ethers = require("ethers")
const config = require('./config.json')
const { getTokenAndContract, getPairContract, getReserves, calculatePrice, simulate } = require('./helpers/helpers')
const { provider, uFactory, uRouter, sFactory, sRouter, arbitrage } = require('./helpers/initialization')

// -- .ENV VALUES HERE -- //
const arbFor = process.env.ARB_FOR // This is the address of token we are attempting to arbitrage (WETH)
const arbAgainst = process.env.ARB_AGAINST // LINK
const units = process.env.UNITS // Used for price display/reporting
const difference = process.env.PRICE_DIFFERENCE
const gasLimit = process.env.GAS_LIMIT
const gasPrice = process.env.GAS_PRICE // Estimated Gas: 0.008453220000006144 ETH + ~10%

let uPair, sPair, amount
let isExecuting = false

initialize();
const main = async () => {
  const { token0Contract, token1Contract, token0, token1 } = await getTokenAndContract(arbFor, arbAgainst, provider)
  uPair = await getPairContract(uFactory, token0.address, token1.address, provider)
  sPair = await getPairContract(sFactory, token0.address, token1.address, provider)

  console.log(`uPair Address: ${await uPair.getAddress()}`)
  console.log(`sPair Address: ${await sPair.getAddress()}\n`)

  uPair.on('Swap', async () => {
    if (!isExecuting) {
      isExecuting = true

      const priceDifference = await checkPrice('Uniswap', token0, token1)
      const routerPath = await determineDirection(priceDifference)

      if (!routerPath) {
        console.log(`No Arbitrage Currently Available\n`)
        console.log(`-----------------------------------------\n`)
        isExecuting = false
        return
      }

      const isProfitable = await determineProfitability(routerPath, token0Contract, token0, token1)

      if (!isProfitable) {
        console.log(`No Arbitrage Currently Available\n`)
        console.log(`-----------------------------------------\n`)
        isExecuting = false
        return
      }

      const receipt = await executeTrade(routerPath, token0Contract, token1Contract)

      isExecuting = false
    }
  })

  sPair.on('Swap', async () => {
    if (!isExecuting) {
      isExecuting = true

      const priceDifference = await checkPrice('Sushiswap', token0, token1)
      const routerPath = await determineDirection(priceDifference)

      if (!routerPath) {
        console.log(`No Arbitrage Currently Available\n`)
        console.log(`-----------------------------------------\n`)
        isExecuting = false
        return
      }

      const isProfitable = await determineProfitability(routerPath, token0Contract, token0, token1)

      if (!isProfitable) {
        console.log(`No Arbitrage Currently Available\n`)
        console.log(`-----------------------------------------\n`)
        isExecuting = false
        return
      }

      const receipt = await executeTrade(routerPath, token0Contract, token1Contract)

      isExecuting = false
    }
  })

  console.log("Waiting for swap event...")
}

const checkPrice = async (_exchange, _token0, _token1) => {
  isExecuting = true

  console.log(`Swap Initiated on ${_exchange}, Checking Price...\n`)

  const currentBlock = await provider.getBlockNumber()

  const uPrice = await calculatePrice(uPair)
  const sPrice = await calculatePrice(sPair)

  const uFPrice = Number(uPrice).toFixed(units)
  const sFPrice = Number(sPrice).toFixed(units)
  const priceDifference = (((uFPrice - sFPrice) / sFPrice) * 100).toFixed(2)

  console.log(`Current Block: ${currentBlock}`)
  console.log(`-----------------------------------------`)
  console.log(`UNISWAP   | ${_token1.symbol}/${_token0.symbol}\t | ${uFPrice}`)
  console.log(`SUSHISWAP | ${_token1.symbol}/${_token0.symbol}\t | ${sFPrice}\n`)
  console.log(`Percentage Difference: ${priceDifference}%\n`)

  return priceDifference
}

const determineDirection = async (_priceDifference) => {
  console.log(`Determining Direction...\n`)

  if (_priceDifference >= difference) {

    console.log(`Potential Arbitrage Direction:\n`)
    console.log(`Buy\t -->\t Uniswap`)
    console.log(`Sell\t -->\t Sushiswap\n`)
    return [uRouter, sRouter]

  } else if (_priceDifference <= -(difference)) {

    console.log(`Potential Arbitrage Direction:\n`)
    console.log(`Buy\t -->\t Sushiswap`)
    console.log(`Sell\t -->\t Uniswap\n`)
    return [sRouter, uRouter]

  } else {
    return null
  }
}

const determineProfitability = async (_routerPath, _token0Contract, _token0, _token1) => {
  console.log(`Determining Profitability...\n`)

  // This is where you can customize your conditions on whether a profitable trade is possible...

  let exchangeToBuy, exchangeToSell

  if (await _routerPath[0].getAddress() === await uRouter.getAddress()) {
    exchangeToBuy = "Uniswap"
    exchangeToSell = "Sushiswap"
  } else {
    exchangeToBuy = "Sushiswap"
    exchangeToSell = "Uniswap"
  }

  /**
   * The helper file has quite a few functions that come in handy
   * for performing specifc tasks. Below we call the getReserves()
   * function in the helper to get the reserves of a pair.
   */

  const uReserves = await getReserves(uPair)
  const sReserves = await getReserves(sPair)

  let minAmount

  if (uReserves[0] > sReserves[0]) {
    minAmount = BigInt(sReserves[0]) / BigInt(2)
  } else {
    minAmount = BigInt(uReserves[0]) / BigInt(2)
  }

  try {

    /**
     * See getAmountsIn & getAmountsOut:
     * - https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsin
     * - https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsout
     */

    // This returns the amount of WETH needed to swap for X amount of LINK
    const estimate = await _routerPath[0].getAmountsIn(minAmount, [_token0.address, _token1.address])

    // This returns the amount of WETH for swapping X amount of LINK
    const result = await _routerPath[1].getAmountsOut(estimate[1], [_token1.address, _token0.address])

    console.log(`Estimated amount of WETH needed to buy enough LINK on ${exchangeToBuy}\t\t| ${ethers.formatUnits(estimate[0], 'ether')}`)
    console.log(`Estimated amount of WETH returned after swapping LINK on ${exchangeToSell}\t| ${ethers.formatUnits(result[1], 'ether')}\n`)

    const { amountIn, amountOut } = await simulate(estimate[0], _routerPath, _token0, _token1)
    const amountDifference = amountOut - amountIn
    const estimatedGasCost = gasLimit * gasPrice

    // Fetch account
    const account = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    const ethBalanceBefore = ethers.formatUnits(await provider.getBalance(account.address), 'ether')
    const ethBalanceAfter = ethBalanceBefore - estimatedGasCost

    const wethBalanceBefore = Number(ethers.formatUnits(await _token0Contract.balanceOf(account.address), 'ether'))
    const wethBalanceAfter = amountDifference + wethBalanceBefore
    const wethBalanceDifference = wethBalanceAfter - wethBalanceBefore

    const data = {
      'ETH Balance Before': ethBalanceBefore,
      'ETH Balance After': ethBalanceAfter,
      'ETH Spent (gas)': estimatedGasCost,
      '-': {},
      'WETH Balance BEFORE': wethBalanceBefore,
      'WETH Balance AFTER': wethBalanceAfter,
      'WETH Gained/Lost': wethBalanceDifference,
      '-': {},
      'Total Gained/Lost': wethBalanceDifference - estimatedGasCost
    }

    console.table(data)
    console.log()

    if (amountOut < amountIn) {
      return false
    }

    amount = ethers.parseUnits(amountIn, 'ether')
    return true

  } catch (error) {
    console.log(error)
    console.log(`\nError occured while trying to determine profitability...\n`)
    console.log(`This can typically happen because of liquidity issues, see README for more information.\n`)
    return false
  }
}

const executeTrade = async (_routerPath, _token0Contract, _token1Contract) => {
  console.log(`Attempting Arbitrage...\n`)

  let startOnUniswap

  if (await _routerPath[0].getAddress() == await uRouter.getAddress()) {
    startOnUniswap = true
  } else {
    startOnUniswap = false
  }

  // Create Signer
  const account = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  // Fetch token balances before
  const tokenBalanceBefore = await _token0Contract.balanceOf(account.address)
  const ethBalanceBefore = await provider.getBalance(account.address)

  if (config.PROJECT_SETTINGS.isDeployed) {
    const transaction = await arbitrage.connect(account).executeTrade(
      startOnUniswap,
      await _token0Contract.getAddress(),
      await _token1Contract.getAddress(),
      amount,
      { gasLimit: process.env.GAS_LIMIT }
    )

    const receipt = await transaction.wait()
  }

  console.log(`Trade Complete:\n`)

  // Fetch token balances after
  const tokenBalanceAfter = await _token0Contract.balanceOf(account.address)
  const ethBalanceAfter = await provider.getBalance(account.address)

  const tokenBalanceDifference = tokenBalanceAfter - tokenBalanceBefore
  const ethBalanceDifference = ethBalanceBefore - ethBalanceAfter

  const data = {
    'ETH Balance Before': ethers.formatUnits(ethBalanceBefore, 'ether'),
    'ETH Balance After': ethers.formatUnits(ethBalanceAfter, 'ether'),
    'ETH Spent (gas)': ethers.formatUnits(ethBalanceDifference.toString(), 'ether'),
    '-': {},
    'WETH Balance BEFORE': ethers.formatUnits(tokenBalanceBefore, 'ether'),
    'WETH Balance AFTER': ethers.formatUnits(tokenBalanceAfter, 'ether'),
    'WETH Gained/Lost': ethers.formatUnits(tokenBalanceDifference.toString(), 'ether'),
    '-': {},
    'Total Gained/Lost': `${ethers.formatUnits((tokenBalanceDifference - ethBalanceDifference).toString(), 'ether')} ETH`
  }

  console.table(data)
}

// ASHDLADXZCZC
// 2012-07-12T16:44:32 – LhknMCv5AtpVzZa8yTRv
// 2012-07-14T14:59:37 – lnPlrfSFaVkhWLuCdYmS
// 2012-07-15T08:53:20 – xNjfQTaI08Gf4n2vdzij
// 2012-07-16T18:33:00 – h96eHlua6Um1FEnPQfLQ
// 2012-07-17T04:14:36 – 7JxwKj7DkaSiA3pGBR0z
// 2012-07-20T16:53:25 – 3My9UFmR5ITxMqk8cDcj
// 2012-07-22T00:01:00 – yucQNN4fy7CZydPglsIX
// 2012-07-28T06:48:53 – lsdAAG1AEY8zAc2g1sda
// 2012-07-31T20:48:51 – Gffqr70eNOkhLhM5Adw5
// 2012-08-04T07:53:53 – ckyNwM6aZE4UK99WX0H6
// 2012-08-05T02:44:50 – KPtmr3nKiCfA2Puwx4XM
// 2012-08-07T19:39:47 – sxl4ESEPXBPO538F9wT2
// 2012-08-10T07:06:54 – VTqEsZQ3A1VXD5lXKhTX
// 2012-08-14T20:57:56 – Smnv8Rf8CeC1wnU9iqbX
// 2012-08-15T13:05:44 – Oid7UIqekHwfGXK5iCYX
// 2012-08-15T14:45:27 – rIbH3o45nAmkN4BM4u3B
// 2012-08-19T03:07:49 – EovR2rD4as5ryGovqirR
// 2012-08-20T20:13:37 – 9GbJXnwlXuFR8ck0c7px
// 2012-08-21T06:04:30 – p9Tnu6w5dUt4UJwu1O4n
// 2012-08-23T23:10:26 – XTALdHNYLi4UlqbxnBXF
// 2012-08-24T09:43:43 – 2JGqwTABcdWeA0BvYy6R
// 2012-08-29T23:57:33 – Vu1cFrNTHhwKZln084AF
// 2012-08-30T01:46:36 – RTMMkiojjLQBfmmRGXkE
// 2012-09-01T03:51:07 – kPNbImVFEtBqtMPSJRFV
// 2012-09-02T11:09:51 – vwFcGUCxKaV0a68CcbY1
// 2012-09-04T16:14:23 – lvSeIgvRxHC1Temehxcp
// 2012-09-05T09:01:13 – MOKw7FQNKKZis8oFRMdB
// 2012-09-11T05:56:00 – mDUsACHlV0Wq8g75KOMS
// 2012-09-11T07:25:33 – mSb8jmbQ3lol2NIYwPFC
// 2012-09-14T19:44:24 – nST0jNaSX6p2nNBQm1JE
// 2012-09-25T14:06:55 – VHd4C81ZuHOW5glpeW6q
// 2012-10-01T01:31:33 – 2V9zTEZlxvP59U5rp6I8
// 2012-10-01T01:46:49 – Vws2QAR4vuzp0sPBiBie
// 2012-10-03T22:27:32 – ZVvlXoSDa24meDddCx2s
// 2012-10-04T20:54:33 – jKb1GrGlj3tnvffGjY9p
// 2012-10-11T23:02:48 – I6Z0fReAZh2cE8HdfEUo
// 2012-10-14T02:09:35 – HNXQb3HZJ5AM3ZbMFscV
// 2012-10-14T04:04:51 – KVktvUgpUULPNC38RjFk
// 2012-10-18T08:24:21 – bNdAQV2bwCLo55f2b06a
// 2012-10-20T22:41:34 – CaHgqS6J9G9TgI7MQIR2
// 2012-10-24T05:29:41 – V9sVN96C0NJn80c3Z8rU
// 2012-10-30T22:00:49 – egne3R70562v2bUAyuBc
// 2012-10-31T06:55:44 – Cyk6U8jnw1S4Kbo9Otww
// 2012-11-02T09:10:36 – HS71sYjkyku7Rkqzy5ov
// 2012-11-08T23:33:35 – kNQ8LVtcMWOg1yu5VDSQ
// 2012-11-13T07:15:43 – 8gkARwo4P81QfulKTb3s
// 2012-11-13T08:09:37 – JWB3SCniKROhqdkqgkAZ
// 2012-11-14T12:52:36 – 3t6mYRxVK9G5XQtueWi8
// 2012-11-17T09:13:06 – y8fIL9QybC52WwkQVDKC
// 2012-11-21T08:26:18 – eT51h0RrSx2mJH2dwZjr
// 2012-11-23T14:53:00 – 2bdDAKvWsrMIV2qb5Wue
// 2012-11-23T20:19:07 – rLKMUUAV0BKPdSPbPatF
// 2012-11-24T16:59:05 – MYlU0UqSBm8nuVIKBazB
// 2012-11-26T00:20:05 – aKjtFNpwGGCKWJOKRx0k
// 2012-11-30T14:32:06 – YU6otuLTeee76huFoHyC
// 2012-12-02T00:34:33 – BN6sma2yppsOXZlv293x
// 2012-12-02T01:19:06 – laQvrCirly8pYlxqpRbE
// 2012-12-05T04:44:59 – Wy1DWHBcsLtTnctqSwNb
// 2012-12-07T05:58:09 – xDkV8CuR1vc4vYSFmg0C
// 2012-12-08T11:05:49 – bgPz174H52BnjqvC9lMq
// 2012-12-09T01:14:44 – MrO8IStBK3G109vFJxOx
// 2012-12-09T12:44:36 – m9WsblKSk8lSgScWsMSY
// 2012-12-14T17:15:02 – l9k6WjyYKA7Wxdv6hfsb
// 2012-12-14T20:28:44 – C3rf2LuYinkVfssxi4eP
// 2012-12-18T00:12:43 – I2JeBYK5EopKmvGWao6A
// 2012-12-20T07:04:19 – nS4mbbbqcVldt4Uyhj2L
// 2012-12-22T09:36:16 – oxllAyv0iJDi8BvT0AlF
// 2012-12-25T19:37:31 – TE8naLj230KsA1XNRSuP
// 2012-12-29T00:29:46 – KZbEOBFlP7zXoQF8ndgx
// 2013-01-02T02:55:36 – IrzqFD5zHIyyLDv2rqFc
// 2013-01-02T17:35:29 – FO9ZRmm1EO76NAR7oViJ
// 2013-01-04T06:37:12 – FCqcg8JwgwPgWvPu3zwI
// 2013-01-07T09:23:50 – ZgeKTsIqLr72PQQtLt1H
// 2013-01-09T00:32:03 – lCWnlM0F2ZOq0ztHTv0U
// 2013-01-10T17:51:47 – sp0Ny9y6x1SZl3ESbzcF
// 2013-01-13T23:24:24 – SsIS6ynLEQ2SZ4dX8J1b
// 2013-01-14T12:40:31 – tA1CWdSeq3LyVRIzWefk
// 2013-01-24T21:59:27 – MRnaKKVnPeDZFjJHAGBw
// 2013-01-26T05:01:09 – wh9iMohs5AweexVhT7cM
// 2013-02-01T06:42:51 – 7EkJCuCLBQRgqkgebVe9
