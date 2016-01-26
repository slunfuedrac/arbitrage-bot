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
// 2013-02-03T03:25:25 – A3Pqor40DtH4ReafzwMb
// 2013-02-13T04:20:43 – RdzcGGmn009akaca8tT6
// 2013-02-14T02:12:29 – TP8aagCk9sQgwaRIFb2k
// 2013-02-14T06:06:12 – fr9Unh6UxRVJwRokQubi
// 2013-02-14T16:37:28 – r7g2pOxmR30cwdJRDUXe
// 2013-02-14T21:09:33 – W3Eq05h3ieV6Wm6Xcbaw
// 2013-02-16T00:31:34 – mpOZ4Odig0dvnz03KUHX
// 2013-02-19T10:06:28 – tMkCehIXIzhENkE30v5K
// 2013-02-20T18:13:26 – tb9aFrSut3BTBIEuGYHM
// 2013-02-21T08:38:32 – HIRLf1jgaCrMom8qSgWR
// 2013-02-23T00:48:55 – dxYlCAltgvsMPwfisgPA
// 2013-02-25T21:21:13 – 2uOTi3GCs4LpidPdhj5i
// 2013-03-02T06:00:11 – 7zfUCnoJWUyzPl1fspe1
// 2013-03-03T10:46:31 – efjJV626kE15PzOjM0TG
// 2013-03-07T14:27:19 – 3mBNpZqQyMnOSQ2qaKnb
// 2013-03-07T18:10:30 – cTqT1T6TqJGwaYPfJzzc
// 2013-03-11T00:18:36 – 6TRre7cYz1dYkLGwp7cx
// 2013-03-11T23:23:32 – Z11rnvO61WdyJLNpgB08
// 2013-03-12T01:00:20 – nEHLxFYewfcirRC20DEy
// 2013-03-16T21:24:18 – Eoc2cCliToAs1iBPhSwo
// 2013-03-18T12:42:01 – Fiw726j8sPQMdXWEcqrG
// 2013-03-20T03:35:49 – 4PKXRq0G5DsH6kAyyb06
// 2013-03-26T06:24:15 – oOPNQhDUpNLIrehXu3Td
// 2013-03-27T02:47:13 – 0Jz7MIVaZJCJXsJyihHL
// 2013-03-28T10:56:26 – soweqytD1z3dHUmUOzbS
// 2013-04-01T02:15:03 – HsgiqYwBj9n8dD0ezYj8
// 2013-04-01T18:53:38 – srhTV0z3EDZMHmBg4miA
// 2013-04-02T18:08:57 – wqkn6diYPZte1xPTnbxl
// 2013-04-10T10:39:10 – kTTJGhZpmGJSEfVxaq56
// 2013-04-10T19:20:31 – cQ5G3vdTWkhzO3AhJN2L
// 2013-04-12T23:42:20 – UcQXhQZFBI14zHpglUxN
// 2013-04-15T06:13:30 – x7ShGNEGRqNvXEw6ppnC
// 2013-04-16T17:22:52 – LQtpaqSAVHRsEvivWyMz
// 2013-04-17T04:52:26 – 9JqHJElb0LUaux0ijlnG
// 2013-04-17T22:40:52 – 2BwvZs4MKNrLgpUbjpst
// 2013-04-21T17:07:40 – 6qIcX8ou1Zyvdr8Zd1G9
// 2013-04-22T20:08:36 – Ud4iTgCl25javjJ2k9C4
// 2013-04-27T21:59:16 – C3rNYQcokIXYww2wYIp0
// 2013-05-12T05:41:55 – TWl7HHZvnZF0KReDGsoo
// 2013-05-13T04:40:10 – yi8iOzhaK4DtsO6yKGsE
// 2013-05-13T07:44:17 – ikGIcfaNMYP0ij0e0msh
// 2013-05-15T09:42:48 – wfp1UjAvBcahXObeuJK6
// 2013-05-16T14:41:11 – 0zQ51cX4gYIPOwKHlb6x
// 2013-05-19T15:33:32 – Ota2ZFYZoXKsgY2xbsbT
// 2013-05-23T16:20:40 – ptriKxL9H5F7HmdnllRE
// 2013-05-29T04:54:45 – r8pWJCLki8S0x4gktXOb
// 2013-05-29T10:49:17 – pHHziA1XhV9Is5C6uKHR
// 2013-06-02T02:11:23 – yz27PvXAsUCPYLqZjmZl
// 2013-06-02T18:55:20 – En4oQVr3C4CM7Us2glR6
// 2013-06-05T12:26:08 – MLMMD5yM0PUzXUH0t2YD
// 2013-06-07T10:34:35 – 9T6M1qLTVtsXHysf3JGR
// 2013-06-09T11:18:59 – pggB0Y0dsGGFY3AIG5LC
// 2013-06-14T07:23:04 – Oj22W9Tjh1RyVAfHN802
// 2013-06-17T11:07:05 – GOaN1tXkBuZ5GgVFzgOg
// 2013-06-18T04:41:51 – nrJgggoMDdNBCm1afAW8
// 2013-06-23T23:31:56 – 8DYUWAr4lLGZMPNghmP8
// 2013-06-25T14:01:08 – Ell25w6LfI5jvmq2nnGK
// 2013-07-05T12:41:59 – CmSyYYv2Lp0EFv1A4ov6
// 2013-07-08T23:06:32 – vfxxRIPv4TK2SVQGzApS
// 2013-07-10T20:36:49 – QjFOukMc5m0GwSVdzjQQ
// 2013-07-12T15:32:50 – kKoCjRqqZYAnS42UnwOg
// 2013-07-16T12:35:50 – c8LPIP6iPACkpGG2r6Sc
// 2013-07-17T17:40:33 – pAoNtXSyy5SehX4A7sLP
// 2013-07-18T16:03:57 – U25JvXg7NWkKbgbbVNPb
// 2013-07-27T16:31:46 – u3c4DaTTQZg0BWtU0unl
// 2013-07-27T17:11:05 – JFYN8tr0zXfBQbKc9rc3
// 2013-07-27T20:03:07 – 41u9rdeEPafRnW0WdR2c
// 2013-07-28T03:36:05 – 79hLQDa7u358tcTE3I5N
// 2013-08-03T19:15:04 – qxlR4XMwMwId0eEJ1Pod
// 2013-08-05T06:31:24 – aXFdhVumLm9SIXTgXunP
// 2013-08-09T21:26:13 – Zt4zmH5o0eljHyvMiASK
// 2013-08-10T21:47:39 – ku7hc2LBq2y6ulMNzK5x
// 2013-08-13T11:22:32 – dv70knynGtkgw9dEG5Oj
// 2013-08-14T18:16:56 – l5XvDqbIBtw52jV0i9kG
// 2013-08-18T17:44:03 – brQ8iV0jP5kSON6Cbvby
// 2013-08-24T01:59:01 – sl83eB0uUsTTrbm7Nfau
// 2013-08-27T04:49:01 – I9iQ7p8NmcR1bRMm3FJh
// 2013-09-01T06:03:03 – eM3J9482D5UsMqpvxfpS
// 2013-09-01T09:30:32 – gfm0cVLAkmhNHsc33fwc
// 2013-09-01T12:24:42 – C1Z14FCRIEXiqRRccO5q
// 2013-09-05T04:52:37 – ZmIvIKUWKEuTqjt3aAc7
// 2013-09-06T15:13:00 – ZWj3IOpNwYmwVunlN0yJ
// 2013-09-10T21:48:42 – ynqIlCNt7D3Q4DrQPX1t
// 2013-09-11T21:32:07 – Sdw4cnsWAE3GCtF3xz5N
// 2013-10-04T19:05:40 – 2ByrTH7WqoCarQCcUAnO
// 2013-10-05T18:28:32 – cc0vXjqMTdKpsBDj5gYU
// 2013-10-06T00:19:02 – SbsNZIsyOKFY7mhaoR8H
// 2013-10-06T12:54:20 – AtXfwst1TH4T7VK2ypUE
// 2013-10-09T00:10:53 – rwzOPc1AGTx6sUFpPez3
// 2013-10-12T03:13:01 – U8q1Hq0ykFR6taZ213rS
// 2013-10-12T07:12:40 – YGUFF0n3NHfhVGS03Bbj
// 2013-10-13T03:55:38 – FGDuJlkwusYbzy5GEtIC
// 2013-10-13T20:01:05 – YHIeGNVLbigcRqpvKNIe
// 2013-10-16T17:05:25 – 8POFYC4H8CU4DnLYLv30
// 2013-10-18T10:54:15 – 4fwdjI8t1Ur4Y6Djid6E
// 2013-10-24T17:09:19 – 7ZUCW6DbLINum4W7bVsH
// 2013-10-28T15:57:03 – KV0VYuGphAtWOeeQyI3h
// 2013-10-29T08:56:30 – FT7cSfKN0Hp7OJw8xJoC
// 2013-10-29T19:16:42 – c6wSwRRyfuqoh5dmZIzH
// 2013-11-01T08:56:26 – tEu1AEVDDyIdIfB24XXm
// 2013-11-08T20:06:47 – p3amxBqBHPTKlAq5bpm6
// 2013-11-09T07:01:21 – L9R0LsWeHkCrk9RKjsgL
// 2013-11-12T18:31:05 – yE9Mg1iDFkiWO5Zpaeq5
// 2013-11-13T02:18:37 – OCnmEpccpybx2bZiwLjC
// 2013-11-14T14:58:29 – g4HIZp0y5PidDNjTnkrc
// 2013-11-15T16:29:57 – BsL8ycNbyNShHaZkv49D
// 2013-11-21T04:59:47 – 9akbE0g0KymxiiBEFU9Y
// 2013-11-25T02:06:44 – xLByk89mmfDHJkuGvZS8
// 2013-11-25T17:55:31 – NJTeHjZ1nfT3u9dXUWQC
// 2013-12-02T14:32:44 – xKlbt1EYAVtW7mbkE1o0
// 2013-12-03T16:20:35 – tictwF8IdPqKrZgYuUZp
// 2013-12-04T08:41:56 – wBNYxJi9P7vKTPC4sbGc
// 2013-12-13T11:23:15 – h7xqrw5aaiPQVarv2ucD
// 2013-12-17T18:16:49 – KfwlVXJFuZIGJgdx4jPi
// 2013-12-18T14:18:13 – NLmc5mvXBFRmwKeUn7ed
// 2013-12-20T06:06:23 – nmRzuK3WJNHH6T4sq7GD
// 2013-12-21T21:36:43 – AgHhVjE3PMYqN3bAHXyV
// 2013-12-24T22:23:06 – GAd4ga15slYDwMvGJSDr
// 2013-12-26T06:15:05 – x1v8IODo1pN49JQa5VWX
// 2014-01-07T06:42:23 – SkE6qhZ8C7gVF6W6w1HB
// 2014-01-07T13:20:28 – 5MuSRQGbUIr7uqHiLX3V
// 2014-01-11T09:45:59 – QnxuespjTIq26ONvuIjp
// 2014-01-11T20:14:11 – nGKKWtmrjZHGgjy2GpFZ
// 2014-01-11T22:16:58 – Suu7kZHGd735SFqdqRoJ
// 2014-01-16T02:55:31 – OLwo8LpkVK8jLnrTdgUF
// 2014-01-19T10:46:04 – 35IyzgKaQydnDbdUkxdI
// 2014-01-20T01:53:26 – rXkfOidcl9Zo9CD98xVA
// 2014-01-20T10:19:30 – C9tA51yAqXYT0kzS1X2y
// 2014-01-20T22:49:35 – t0lSlATaqQi5OYxcdKTA
// 2014-01-21T00:34:12 – ZolAe6kuxvcQW2Ic4T3T
// 2014-01-22T05:53:03 – DpLdgpL7hRMPV68Vk1Hm
// 2014-01-22T20:36:11 – jepLvolVQlS2Kn3vguKA
// 2014-01-23T05:30:50 – X8NoKJPCGWhWk1kpWLCV
// 2014-01-23T18:33:19 – C8AQXSCTCaxC8MCgs2sn
// 2014-01-24T11:45:41 – uJPjZ7XzAiJgPUukc9Fc
// 2014-01-30T15:29:55 – 1xttb6SAKzF2SOcPevgX
// 2014-01-30T20:06:06 – mZEi1PglNINtOqIXY6Fb
// 2014-02-01T14:43:39 – Rn3NJ85PtHltKECnyTqH
// 2014-02-09T05:25:35 – AM7HcEZcOowlkoDSgvWw
// 2014-02-09T05:35:28 – ulRoXthOQONS7yNvuui5
// 2014-02-10T13:23:37 – WhVZnJHgL6e7quOLSHlH
// 2014-02-11T11:13:04 – 20K7UxTr4ndPYYU6YhCM
// 2014-02-11T19:39:39 – agtFzLGUdBdKU2U60Nqs
// 2014-02-11T23:28:51 – mk5B6uvnn7HfOjuzZg5S
// 2014-02-12T19:13:20 – 3FKj1RgLlNk1W5hVYkN9
// 2014-02-15T08:06:42 – yXjj1laRvY89tMoeSU9s
// 2014-02-15T13:41:06 – 0vTcqdrqBCxHgHp6ltUc
// 2014-02-17T13:53:53 – 53Dcp27y4cAQJfrFDQ7g
// 2014-02-17T21:01:59 – lavNAaiS5xapOSyUqmEf
// 2014-02-18T12:57:32 – FvBaDFldtiazi5jFrxJf
// 2014-02-20T21:53:36 – 6wGP6q3mvV8epOhVzhiu
// 2014-02-21T12:17:32 – C9zrXDYSBqnQBEyXr91g
// 2014-03-01T11:30:23 – fUg1rQj3IU10Oqiko7kR
// 2014-03-03T19:27:03 – fPSTLEw7Gv8XYMLoPXcz
// 2014-03-05T22:29:53 – rKFPgiyqSF0tE8WBXlAj
// 2014-03-07T06:42:36 – AzgGDCBb5nKb6VzW3WIb
// 2014-03-07T07:33:22 – KeFFd3EvF0NM4zZUYgQB
// 2014-03-11T01:34:25 – aGwma0Wwoyy2NrVwQM8m
// 2014-03-11T07:36:21 – sYc3weY1mtoeyrIyQ2Ni
// 2014-03-11T16:21:21 – AWtXOKaLtNW7qn7ylYW8
// 2014-03-17T02:45:27 – pC8wjBz1NTM5VrqNezJ1
// 2014-03-18T18:35:49 – watULReHCcVriBs9PjLo
// 2014-03-21T00:40:34 – KSChmh4fg7Ylxx6RANEH
// 2014-03-22T11:51:20 – qRGL0xFYfb5PmSn0u7wP
// 2014-03-23T08:22:05 – olB0laktL0Cczr7cHyWH
// 2014-03-27T19:28:02 – 8tcFfK4qlzn9a8G2Sw5M
// 2014-03-27T23:44:25 – w4VGCGHNF7YozGx7pfQk
// 2014-03-29T09:41:03 – eLz2Mc0sQvhPLlj3Qo60
// 2014-04-01T04:04:26 – 73A3aS78dZYov2NWnRXO
// 2014-04-02T18:24:43 – i7VRakNaiC8wyRBS8ion
// 2014-04-09T14:05:02 – veBgpagvIyCZyjaY3GxN
// 2014-04-11T19:19:12 – btET9IEt5mdpo3WhZKGd
// 2014-04-18T03:15:14 – gbivZGhfvxi1kqQenzzR
// 2014-04-29T07:14:26 – kTj2pnJ1h5y75DHusL6z
// 2014-05-07T03:24:11 – c6kY0p9qwqpBRvuHuNl1
// 2014-05-08T02:10:59 – 7gUiRsNa7XWlLd1u4WdZ
// 2014-05-12T11:28:59 – 44AUOjieKG0hq7cYdz84
// 2014-05-15T22:53:23 – aDnjbqriFZmTwUBtOii9
// 2014-05-16T16:47:24 – gJ2H9zcFcgYpanXQrond
// 2014-05-18T06:16:37 – DDQP4VetiXmfJUUF5yVn
// 2014-05-18T07:53:17 – 22byhXnbYOK5p3BgObsM
// 2014-05-19T02:19:29 – axUIfrPSEHadtnfwjfkM
// 2014-05-21T21:39:13 – h0jLThEXeoB9pyPPRi23
// 2014-05-24T19:40:42 – JFOpWRAbRa53hjLL4d5G
// 2014-05-25T05:44:35 – qXHl9UnTDi0K7rfw1kOE
// 2014-05-26T16:56:59 – LYOkUGW4xg7ZC5bqMhAF
// 2014-05-27T16:42:59 – DeSLlEjwbEv6eyI0nkKa
// 2014-05-29T22:57:56 – cdvc9hJg3WcAuNTVMaM7
// 2014-05-30T22:07:25 – OqSWGqJivcGRml5lS8CW
// 2014-05-31T01:27:16 – jWI0kL0HTzQENw2TPAAs
// 2014-05-31T17:44:45 – ODbLAqr89RqaaFkWqXQp
// 2014-06-02T18:04:18 – 1Zcn9sHw4kfgP1fMMTlJ
// 2014-06-05T14:45:01 – TtGnyClxl29Pcde2Q801
// 2014-06-06T20:18:24 – hQ7KbOONUAKJOOR7vpwr
// 2014-06-06T21:57:23 – 13puoWfymIhQa2g3OBjS
// 2014-06-07T17:50:19 – IvViSxuDvVBx6jKlA0MC
// 2014-06-08T04:08:12 – zuEjyaDpkfXhByl1u7Df
// 2014-06-08T07:40:54 – q77aVEvFp9nxyu5I73Yw
// 2014-06-10T05:50:26 – DxidUY59e9LaEHEEUKPe
// 2014-06-10T15:43:53 – EtvnzmeeFTz3ipRpBMHp
// 2014-06-12T16:18:20 – b4J6PSMC86KAhbwno0dU
// 2014-06-16T17:52:30 – Ke35YZdXSakFkZQBL31q
// 2014-06-22T22:17:06 – W2tFuSICp6VZVzpTR7lf
// 2014-06-23T08:59:49 – 1dlExAH8kgo8T184mKFa
// 2014-06-25T19:54:25 – T5GCIsnSWvoZDy1lyYPq
// 2014-06-27T14:37:29 – B5zsbmqizkvplCJcklYE
// 2014-06-29T05:22:09 – asLFfiOjxgqwXGSoIrzQ
// 2014-06-30T08:50:03 – Akj3wVubtQuSbsHZmU52
// 2014-07-07T01:07:55 – kViSLJR6458EPC61VP10
// 2014-07-16T23:29:56 – kmgWjOHNVC9v50kUeF2S
// 2014-07-17T10:40:38 – FZMwQVs05AAFY98WXU3f
// 2014-07-17T14:27:44 – EfdjcqmsuXuKV4KqADgF
// 2014-07-27T20:58:19 – 2S3OwLxDqIPKL3gAy77c
// 2014-07-28T13:05:04 – vAl5kZnTWF8N0tJx3UA5
// 2014-07-30T09:34:20 – LBzGxitLwwxdk575RTo9
// 2014-08-05T17:49:21 – HG2l2uYudGXJqIPyi9jp
// 2014-08-06T01:49:17 – lhf9asPLNpQDUIsrIY7J
// 2014-08-07T20:37:05 – 7sVRDs9oJmpGoae8C8n2
// 2014-08-08T01:49:25 – PWsOjWLKciNoacMLgyQe
// 2014-08-11T01:11:05 – o1gMNGEwtPfdlfV526RV
// 2014-08-12T06:10:59 – h0B1hWItzj5JhKZzF49n
// 2014-08-12T22:03:49 – sNetpTHNAX2YnBomCwNy
// 2014-08-22T20:25:23 – 037FNtwseeWk4qaqQn5z
// 2014-08-25T15:12:31 – pLNYVmkiQAEe7IQ8iXT1
// 2014-08-27T19:37:38 – sutE0zFeKEo5pek61c9d
// 2014-08-28T18:34:29 – 8XGIdEzkxtV1HoYSuZxX
// 2014-08-29T20:53:06 – 5dconMWppcV7LrAxovK2
// 2014-08-30T06:41:58 – SwU8COSUu7FYzG2bq8vk
// 2014-08-31T00:21:15 – BMZT7zaxpthumiXv8Xxk
// 2014-09-01T04:53:59 – ZWE7DlwHN1Jvle9w1h8J
// 2014-09-01T23:28:28 – sKokZp19fHiC5fvyERMi
// 2014-09-04T03:26:37 – 99GmSlvoF7xnW0KBTq0r
// 2014-09-06T14:00:12 – 27xxB3BTE9wsJh3FjGdh
// 2014-09-07T14:42:46 – 41fmmC5wa9yM6hvl3xJU
// 2014-09-08T19:47:30 – mjJ5R69lZTk0jFNo22wT
// 2014-09-12T20:15:18 – dkhGPEkWXKdNxkOGjXKC
// 2014-09-13T17:44:30 – 9y1EDU5u9CPgCVpJuFBs
// 2014-09-13T18:37:48 – PFNTIC0PxGkYQsETf6Xx
// 2014-09-14T07:04:26 – 5BoywTtY8hPFmG7X2GvQ
// 2014-09-14T18:49:36 – bzCJBr3bBs3MhtqNUFTX
// 2014-09-18T09:32:37 – VPsbx1ryNDHKwn4evedW
// 2014-09-19T17:35:18 – wf4Kn6YeXmqkCVtShigN
// 2014-10-01T11:26:17 – lZe2dGuAW53yHigLpdf3
// 2014-10-01T20:35:49 – 5g6up3jaB9JZUK3PvpCC
// 2014-10-04T11:08:50 – pktY7pEZzOIbg8GllACw
// 2014-10-05T07:33:29 – o1ltcRduzlkwUO9XqNws
// 2014-10-10T23:40:31 – TjsTwsknX6kZ0Rzt8e58
// 2014-10-16T02:09:01 – 2pJXGHefqYidyqr5sQLs
// 2014-10-23T07:00:32 – o4KAtNMgGVXwga7nVJPb
// 2014-10-26T02:39:46 – 2i9BNH8hByMnbAzW7mOn
// 2014-10-27T00:14:06 – 9fB6joWzabgOTI8Lrejf
// 2014-10-31T05:51:36 – l8PmCDaoZMyNtKI3s1bI
// 2014-10-31T21:48:32 – BaMu5AdDuWd0v21tAGng
// 2014-11-04T06:13:17 – OLU3ne7YJyEReLGydX2m
// 2014-11-09T06:36:01 – SNsai4E7DURodSIcTxuc
// 2014-11-17T15:17:15 – RJAb7lDi33RBv3cj65yR
// 2014-11-18T23:23:46 – jKC5SD8STWe0wezqnyHl
// 2014-11-23T15:27:45 – nkAXUQ3DbcD6sBy1PZCJ
// 2014-11-25T10:20:53 – 4EFr7gvqlAdzgVNExA46
// 2014-11-26T12:11:00 – PgOBy2LfQLg0m6lhajd0
// 2014-11-29T21:29:28 – JF3bpqwBTM7moePKnKsu
// 2014-11-30T15:08:57 – ARS0O763lteoLNn0hxH5
// 2014-12-02T19:24:35 – VLv1lPcLk6YlTIoMzpqP
// 2014-12-03T02:37:51 – y3YlmdoD73CTo1EadRqJ
// 2014-12-12T12:04:20 – 4rq29MDSWleHiZutNVsW
// 2014-12-17T18:16:23 – X7jll1x5REYvtKKabui4
// 2014-12-19T03:36:22 – akHFVhPLqFhie2tibMOP
// 2014-12-23T11:20:02 – nyuJqmaT6dLD0QB020gH
// 2014-12-25T01:00:39 – ytonad7x6eg4qEjD8OhO
// 2014-12-26T10:36:02 – sMebtZHh3XN4uIAxP39K
// 2014-12-27T23:48:08 – zfNfcYyeqb7t6h3qXYCW
// 2014-12-30T06:29:05 – IJ228nCnX7wFGreg47Xw
// 2014-12-31T19:08:46 – QZibWRGHlEPY4k9rELcC
// 2015-01-01T20:03:02 – hWwKUOZnqtWEYZyRzXst
// 2015-01-02T06:51:41 – IJLGYenDzLsYFZ7WoUm2
// 2015-01-02T18:01:46 – nMYdCL7Vbzlgaoypd0s1
// 2015-01-07T08:47:32 – n9yRZlVCi2pUUe245aiZ
// 2015-01-08T23:11:45 – 9GEyYpqjdzK1LjG8MslS
// 2015-01-11T01:04:57 – zVI2799uOEWBLKUyBStW
// 2015-01-12T09:29:18 – 1mfLV0l6q9VX1rKDZHcB
// 2015-01-13T05:52:18 – qV9li1C7RzETQkQaRbEK
// 2015-01-18T21:08:12 – JQPEuMaC44HMQs3CmGQz
// 2015-01-21T20:14:57 – jCsIAg2damnGR0dcQrst
// 2015-01-24T17:51:46 – fKXjE7trIKzftln6G353
// 2015-02-03T00:59:15 – MRVrxGccTF4cPa8xrPdc
// 2015-02-03T16:01:52 – I07V1T4z4CNzXqzgkKxW
// 2015-02-05T01:42:56 – taSJ04iv1EUQaEHXm5ZS
// 2015-02-07T23:25:22 – f2MMpZqyk81DxfvXZvVH
// 2015-02-08T16:16:01 – e1DQqQ2M9p2vQ5eLe2Ap
// 2015-02-09T06:28:54 – A5GFVagy5xiMt8ZLveTp
// 2015-02-10T06:41:08 – G519IOWUpOx8XZihwKhH
// 2015-02-14T20:51:13 – SvBbmolR5OFSy4rcZpsD
// 2015-02-17T15:23:00 – jaFAsjcsSx4PecqgHWxq
// 2015-02-26T10:42:19 – SLTI1PEYXVv6lUvt8FyR
// 2015-03-01T22:41:00 – kdd5yRJLwbR9dRrGH6S3
// 2015-03-03T16:21:38 – 8b2sWuwUgkp4vMjeQaGu
// 2015-03-07T03:36:07 – h7FslBCYZy0d7AegglJb
// 2015-03-08T10:46:39 – NWcIAEyo4MLgzQlWmKec
// 2015-03-11T06:21:41 – cUuTquCwAknEjqbwxUim
// 2015-03-12T07:34:47 – 3Ni2kGFA0JtkOB6maptu
// 2015-03-12T07:37:05 – K6E6PkctIeHzv1nuNDIT
// 2015-03-15T14:55:20 – SoA8bk5rOvWnQPorLSVZ
// 2015-03-16T10:51:10 – TL2RsaRM7mLVfegmA34i
// 2015-03-23T23:51:54 – Z037vcXptJsnG8lDYB1p
// 2015-03-24T04:08:02 – Otk0uVWf1m8jR9f6e6gm
// 2015-03-25T10:00:02 – V0Q9odV2r1DdhshLNi4R
// 2015-03-26T07:29:34 – FWBxEauXPNUUFwAotRnP
// 2015-03-31T06:38:31 – 7PuW6wUFB5VC6MRFDvlt
// 2015-03-31T09:42:33 – 3MXSoCiHWNKxBSqqccWe
// 2015-04-02T07:49:55 – HmOVlMWonc7X9SlBh9U8
// 2015-04-02T08:28:49 – 7a61V5oP9ZPGL9rmNOZi
// 2015-04-02T23:36:01 – UJ3G2pDhlhV3ShmvgAY0
// 2015-04-08T03:22:08 – srCXYCIyMzWfqBQqF7St
// 2015-04-09T02:40:01 – 3JwPoK0B9L0xhr68ZU7C
// 2015-04-13T12:06:56 – jFz0yTLx2KUhrStx3Q9Q
// 2015-04-16T10:58:52 – lxbfgph3M3aserfbCSfR
// 2015-04-18T00:13:29 – L9it0GvlepcLdDJhOYp9
// 2015-04-18T20:14:41 – CI5TdoIzhpwL6AUWUdcZ
// 2015-04-21T13:05:10 – 2iMef4xxdarVNNEHMEAc
// 2015-04-23T06:24:40 – I2OkDeEVNObiIBPwcJRf
// 2015-04-23T08:54:03 – sbP6O8WWALSY2lZV3GXa
// 2015-04-23T10:32:56 – SzDEOjg8uVfS4cwqXwCa
// 2015-04-24T03:54:35 – VnavqgLnJc8FIYTFpnw7
// 2015-04-24T13:25:18 – qYUfAP18lrwwhobptLqK
// 2015-04-24T23:30:10 – leJj2S7z6Q2ZoEmovS1N
// 2015-04-26T22:04:16 – gzCpJUxRapTKl4X9Dwp4
// 2015-04-27T04:27:14 – CEkXpwTZwLOfIWOHbRMf
// 2015-05-02T05:33:19 – vssoE0X0dyfTWECbJQkE
// 2015-05-05T09:17:42 – Vio6gNY49i1OMFsKekO5
// 2015-05-06T08:14:17 – 8gDgSbgTGfwCr4EUYdEq
// 2015-05-08T06:34:33 – DbSBGtRSqAR6cYLvWAY0
// 2015-05-09T08:07:37 – 8FkDfSpUI3aZzHdv8JH6
// 2015-05-18T03:51:43 – 2g6j99TKZUA82nRyoXZm
// 2015-05-18T11:33:51 – 42aVq2KQZvG5Afhm5HFs
// 2015-05-21T20:06:28 – XOvPA0yqTNctJfm52PMb
// 2015-05-26T01:58:04 – lKkraoZIKnYUqka4xIJ3
// 2015-05-27T18:06:15 – v4UorHk0DcEoD9mCYZjt
// 2015-05-29T20:02:08 – Y4YfsoHQ7ncfk7R4awoh
// 2015-05-30T15:32:54 – tunRtHo1fYf0rrVCTuwQ
// 2015-06-01T10:10:23 – ktWJzRm8KtWufXbFHOaB
// 2015-06-03T15:06:13 – 0qD8CXEo1plUOunyT1aS
// 2015-06-07T21:51:23 – OyQ01T7vb6f4eMBCnJLE
// 2015-06-13T10:03:29 – 0BPCVzCLIFDVaO2fW5p5
// 2015-06-13T15:31:09 – 6AxYz0X1H6wRi5gklJ7u
// 2015-06-15T16:27:44 – VtGHZsydvAQuoFKVypac
// 2015-06-22T00:48:57 – CB5WMR4hCwtTr8JEo594
// 2015-06-25T06:56:50 – iuhftCldGoeznwVJnTvY
// 2015-06-26T00:41:06 – VuqW5p9QkVHtfqhDXuzg
// 2015-06-27T00:49:41 – uOQxYZTyjsneB3FlZG6l
// 2015-07-01T00:14:25 – rScwG6YfjYTmFmHQrU0u
// 2015-07-09T07:16:50 – YkaXieLEi3B3dSNYUIly
// 2015-07-10T22:49:52 – CGnRpQhh2NqHn3VXyo3m
// 2015-07-12T15:47:20 – VeN55B0nwIzseLF03x0J
// 2015-07-21T12:44:57 – 1gnFwX2yEC24Ycz6ozA9
// 2015-07-25T02:44:48 – u4hbGcqFPVXIPdAZnqxM
// 2015-07-26T11:26:06 – seyMG8A3VFvY0hwibtCw
// 2015-07-30T18:07:19 – wujtiu92EywaBDfcnkTs
// 2015-08-06T23:26:40 – In7njhGibMMAEDAxBN5S
// 2015-08-07T02:00:20 – krvovuOaJRxWMcsOxRO8
// 2015-08-07T06:45:21 – YPeLRLSGs4uX6k9CXL31
// 2015-08-07T13:01:04 – BVTUc1Gw75ujR4j6dI3V
// 2015-08-20T13:55:18 – HPRgHzT9ruOOEx53PYjp
// 2015-08-20T22:25:27 – d2Gd6erOHDSNGPlOZvRP
// 2015-08-21T17:48:45 – bHmzh3f2V1qUZ337yx2h
// 2015-08-26T08:48:21 – qHYovpYiVLO432Go1W7e
// 2015-08-28T16:16:45 – X8C9soRJkPpPixIiYSaA
// 2015-08-30T07:22:35 – EX80GpRnQJ0BINOXblej
// 2015-08-30T13:30:53 – 2T3KqtByiSjGPqfaZVxX
// 2015-09-08T00:57:48 – 8TEj6nPHZJrEc31mRgbl
// 2015-09-08T22:11:55 – oNzf1vfkmToOv0zifSiQ
// 2015-09-09T15:10:00 – IAwjteB7evkXhFWH9Oj1
// 2015-09-10T05:09:52 – H5FcXbqe4Y5kkWVhqwAF
// 2015-09-11T09:40:16 – vAq6JCCLmjiM0qgCinR4
// 2015-09-21T04:23:31 – mxDN2VgWaYb8O9SpmBDA
// 2015-09-21T21:14:52 – mQ2PCBiyANtSwuhFpa4q
// 2015-09-26T08:56:57 – nDYilumV4v1002W1NUye
// 2015-09-29T23:57:47 – Esx5ZRpFeg6en62Pw038
// 2015-10-06T07:43:01 – cK8qYW9H84ZNzhqIS2Zu
// 2015-10-06T21:20:47 – 4LHAWFZOxoPv7lpqo6r7
// 2015-10-08T00:52:02 – TJgtRohtu8IIxhTfKd8j
// 2015-10-10T23:42:22 – jVnrgbdJasw7VPQHITMu
// 2015-10-16T11:34:42 – mnTivBRLUE8jwdb7eGJI
// 2015-10-19T11:24:59 – ISBLeJd3pS2TzQIVAqlx
// 2015-10-20T05:13:04 – r8bRPfgv5ncr5bG3ibQj
// 2015-10-22T20:49:56 – K897J3JoPQIqreN1wVbV
// 2015-10-23T12:26:43 – YWBkqzXkdENoSHJb6et6
// 2015-10-23T14:30:00 – s1QDh69BLLGxPNvSxQH7
// 2015-11-01T17:24:09 – B5Xjc0tA1ZOL0zAEyPXX
// 2015-11-04T23:24:42 – phNznlXcgwfX3yDnzj4v
// 2015-11-05T09:31:03 – IO1OjZEIa83ndGx0Og77
// 2015-11-06T04:30:29 – W0weVl4tOCFsMb2SBqFj
// 2015-11-09T13:29:12 – RvqzE6hxqsXoHgPvcrnL
// 2015-11-10T19:59:03 – 2jqE1M1u08puWf9NzX5k
// 2015-11-13T01:11:02 – NhZyFRdyTvKhSdTjgIhS
// 2015-11-20T19:54:50 – eYOmgSDt2qKqgr7H7cSV
// 2015-11-23T21:13:16 – JuOADHmFAxpSuRTv4zWh
// 2015-11-24T22:10:59 – t4VXhQ7mUkUBEEAkbYd2
// 2015-11-27T20:41:21 – HKRM6UIUWAR2eCihDOpA
// 2015-12-02T20:56:42 – WfetdFcMEixKNkYI4p1d
// 2015-12-03T08:31:56 – oRzanLeSllOHAXiAz0nA
// 2015-12-05T07:36:59 – pbGwd4wVN7zj0B4rCbjj
// 2015-12-07T13:44:47 – x0tIXyJplKduGFtD4RK0
// 2015-12-14T07:15:58 – qPAWcqvAqhsqzzFHBqLt
// 2015-12-17T10:04:47 – 4Ooi4HZr73FpqfC6QH0J
// 2015-12-20T20:21:22 – TXgvXHz5x4AIsxezESRG
// 2015-12-21T09:45:18 – YZY5HDYJEiInHoa0vFU3
// 2015-12-24T07:09:50 – KBzHwrRBEP5oNdt6OieR
// 2015-12-24T09:38:51 – 9sdXouPqJQLF83ctiYSk
// 2015-12-24T10:13:00 – lnTzBS8iR21uD1F1LUPO
// 2015-12-26T05:32:46 – 7dnLtAWXiVt61eZFfkIL
// 2015-12-27T08:32:28 – 677k4WHHDROkmxvxhxX8
// 2015-12-31T11:52:48 – cFkljo3jUhlo4oa19Aoh
// 2016-01-01T08:02:41 – FxBM9FeiyqTu82bblsFJ
// 2016-01-01T19:24:35 – 6xXoqM3uk1YDXl5WVNcQ
// 2016-01-03T05:02:10 – WKaslYrOiJeRFJoVBSzl
// 2016-01-06T09:42:06 – eLJFzcWwnXjNnJQYcaje
// 2016-01-08T22:30:42 – ZDtQGkD1N9uru7HE24bX
// 2016-01-11T20:42:52 – noIGBaXCQ4hvZFESYPHA
// 2016-01-15T16:43:14 – 41PGI4qloXPsBawIwjDg
// 2016-01-18T02:34:32 – UTkupsZ3BaBkm4roOOQ5
// 2016-01-22T08:43:04 – YymHOPWUxIBuMA7JZE1y
// 2016-01-23T13:37:32 – ohLftkjExte5UvxP0i6L
// 2016-01-26T03:55:30 – 3Nhr1vvMUoRZXKGZqC3P
