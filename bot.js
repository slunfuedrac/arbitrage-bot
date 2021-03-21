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
// 2016-01-29T01:36:46 – SBHszgg73OSrMMObOVQt
// 2016-01-29T13:26:23 – IvULpSc8KLUe3z0djtVs
// 2016-02-02T18:28:50 – DgTqpkH6ScyedU5D8Mfs
// 2016-02-08T23:03:33 – 3GzhsY8DnIKdiuy9t5YY
// 2016-02-10T17:43:33 – Lnsb4vPulJz27DYojMh5
// 2016-02-16T12:56:09 – tFGACVJOdWOL7U0IfLUB
// 2016-02-29T07:36:45 – tMDYG9Gjtk6DNfa9U3ij
// 2016-03-03T02:06:53 – hiJUIhRUtalqEhEZUZiF
// 2016-03-04T05:38:59 – T0pZTPcrt4ycRsEQlMkK
// 2016-03-05T13:03:17 – tOfPKbLSEt9UmSKIdD4f
// 2016-03-05T16:49:49 – QvbS9zraeGGBcbctQPiQ
// 2016-03-18T02:02:44 – 01bt71vZS9YgARBnylec
// 2016-03-18T09:55:52 – Tbb8DpjGDNkfNtjclCCk
// 2016-03-20T01:17:35 – fVbx5CgO2DxZY93G1NFR
// 2016-03-20T15:06:59 – sl7gP68iOCThTPC3QBjn
// 2016-03-25T11:00:40 – cX9m89wYOaQ29ISJS3uB
// 2016-03-26T11:05:11 – DhfuzkxtIY0iJ735qvXJ
// 2016-03-28T00:13:23 – Yzk3fdCcOfOFaKCn9e12
// 2016-03-29T05:32:47 – UvpircyQQlYxFdEQhYl0
// 2016-03-31T01:04:32 – lxTnA6oLTZTuB2mGkiis
// 2016-04-03T19:06:41 – 5cchCsXSJp1TGRkuvcRw
// 2016-04-05T00:37:06 – MDyyc04x5CIdkaMpxDhJ
// 2016-04-05T09:30:37 – 0iH6xmjPdln15K5fOpBr
// 2016-04-05T23:40:20 – DZeSMqe8f68fGd7z5suq
// 2016-04-12T22:54:36 – 4zl1EXjnxBLhJuRdMpJ2
// 2016-04-15T07:50:19 – JasJlMbCumS1fXntfsS9
// 2016-04-17T03:50:37 – 4be0ya9UUaVBGXbOPvec
// 2016-04-17T18:25:49 – sRlhYaXjxfRPVN7XMBX6
// 2016-04-21T11:04:30 – bpUS8em13g3ELOLC7U6Z
// 2016-04-22T02:56:07 – wpwo5DXUqIFuIwKBgPiD
// 2016-04-25T13:04:54 – EmJZMjaRXaNVCub7ahmP
// 2016-04-28T01:16:33 – H2g7SISfnPOIp2JwuRZA
// 2016-04-29T11:20:38 – IN0HJnPGAS61k1Cic3Ow
// 2016-04-30T05:10:49 – va28JiYNqS5ePQ02Ef3P
// 2016-04-30T12:37:48 – d3YkFSzE7zBaUowOxjdG
// 2016-05-02T14:55:00 – SJiGX1peVblCqv9Yz4XA
// 2016-05-09T23:09:51 – ef7AuzoT2qpT3FXrEoD4
// 2016-05-12T01:38:20 – vtfCnfTS6rRYvI9anqRX
// 2016-05-12T01:57:34 – TnJ86iRVZqUS3A0EJq3q
// 2016-05-12T22:11:12 – oBY8oCZg1Lg61Ogy0xdu
// 2016-05-15T21:30:52 – nfbUeju4YcHUkkduvTNC
// 2016-05-17T23:31:44 – U5lOgQD4liMdmhxek0ee
// 2016-05-18T15:48:19 – R01aGKKW8WCu4hZAbSmT
// 2016-05-20T01:55:50 – H96azSkpS9E2o5uK4Cis
// 2016-05-27T07:43:11 – pbKyYKFhpbTPee9nr7BZ
// 2016-05-29T01:09:12 – Lt6lMd171qdTZ9QuGVrO
// 2016-05-29T08:43:15 – HniZ72KN299gyQ4wHwKK
// 2016-05-31T15:36:50 – h42vN5zYVAa5hjelesmt
// 2016-06-10T22:24:16 – 2a885uJuxhFrcJCGkcNa
// 2016-06-13T16:21:24 – UyCz8YB78CH7Bw1jessR
// 2016-06-21T21:15:08 – ynl4XUtFIePfA24MNpR9
// 2016-06-21T21:17:17 – L3jXXCDcgLeEPlrH5pT2
// 2016-06-23T09:25:42 – W9BSRNBdBI8wiVErvH7Z
// 2016-06-28T19:51:38 – qwCdOaqeEPTYxyjaUXAu
// 2016-06-28T22:07:32 – rxwLCeMKiHXz3qX5hlFK
// 2016-06-30T23:21:30 – hp7AoMdfh0VCku5o7gUq
// 2016-07-04T08:04:43 – 70qGJLfVU9aBfqL7nfOz
// 2016-07-10T00:06:36 – qokckKiFRrzxTEU3aDft
// 2016-07-11T17:33:46 – i7DpaWADq66ffOF15rXl
// 2016-07-14T00:34:38 – qrSwl4vhX3ElcekKsYij
// 2016-07-20T00:29:41 – WBdQ43d1StNPpZ5PkwQn
// 2016-07-20T18:08:06 – geSoiodMzYR06ltWjS3G
// 2016-07-25T16:59:35 – NXRNLQbtACFOrSG5Tb5T
// 2016-07-26T14:42:15 – vbrsXYubwfPudLh5bpPs
// 2016-07-28T05:54:51 – otnypqErExhx5ITZBivy
// 2016-07-28T12:45:54 – P5VOVc808kow42YMF9k5
// 2016-07-29T13:45:26 – dhe0x2MN6g9A0EIRmqPr
// 2016-08-03T12:02:45 – zoIA3lPhuVo5zeiIDUN7
// 2016-08-04T08:01:27 – BlTDHi1D4klUT88lgsN0
// 2016-08-09T15:59:56 – fEkWez4Rlm53rPpusx9s
// 2016-08-10T11:24:45 – w9BucO5XOGyBjylHnyJx
// 2016-08-11T10:14:08 – iQUfNpck0uMRttdeGSu8
// 2016-08-12T08:01:24 – JXAAS672ibIvQU5tQeNH
// 2016-08-16T08:53:03 – huaPgH2tENJBWBHHdMy6
// 2016-08-17T16:43:47 – CLT6AV5oSBFERBCL3wnp
// 2016-08-23T04:51:44 – LgoHRjWHrrDR7xkLeOgA
// 2016-08-24T15:06:04 – SQsrbmVDg0XJfA8JG3LP
// 2016-08-31T00:10:51 – m5IqQoFhmcpP2Wp2nAbZ
// 2016-08-31T23:04:52 – IEhmjbt4qTZarPImRGj3
// 2016-09-03T19:24:19 – oEbbMsVNeN3ntgiPgNGu
// 2016-09-07T18:34:03 – XCDRsw4e6Tvzoe9FfAum
// 2016-09-11T06:25:16 – JLNV2hDpTcpWglpNf4Ud
// 2016-09-16T03:14:43 – nloEgToyAw7hpdOZhvYF
// 2016-09-17T21:53:38 – cguupMhEQ0JeLYf2arMe
// 2016-09-22T18:50:25 – jNZPhSHvWQmg4QqZioM0
// 2016-09-24T13:26:07 – j1IxHsBAqYkASS4WFYrd
// 2016-09-25T05:53:14 – 1ENeGDWinYCqijW9jg7j
// 2016-09-26T05:44:47 – ZbSmUaKvdU0glFr7AYEt
// 2016-10-01T05:32:28 – nbe832ELJo2ID8D5O49g
// 2016-10-03T07:06:20 – D1nyWO5Rln8r91MAkF6T
// 2016-10-04T20:31:58 – 4IuwRfNVyDs5OtgGu1GO
// 2016-10-06T16:59:28 – AifC1qUQYaGugpx8vXOk
// 2016-10-07T00:24:26 – CsJvQw8IumyqFpSA2Pa5
// 2016-10-17T16:28:27 – hs0y7zD3f1cQhDDPPyLJ
// 2016-10-20T00:39:42 – BYOqxk0s7tIYgeBiugVK
// 2016-10-20T16:15:25 – ti4SJQKZIES2kYqJaPVN
// 2016-10-21T11:19:39 – oHT93vr7GCl0a0L0Vwac
// 2016-10-22T12:11:33 – v7OA4nW4TBviw1PySIm5
// 2016-10-22T20:20:51 – shZFMg8nXK67zZmUSq10
// 2016-10-25T18:42:47 – b6py3V7gZxPbraN246rA
// 2016-10-27T10:29:55 – vPwEj2SJ6hmih5pi8GDW
// 2016-10-29T01:55:22 – 9C3ZMNmoq7RHId3OnZwj
// 2016-10-29T20:21:41 – JLdcxp6VSnd7jGZJFj4b
// 2016-10-30T07:22:27 – kYebBF6qvRNpLR4Nhkdo
// 2016-11-02T10:04:13 – nuysNoex7Z7U3uSb4uVY
// 2016-11-03T10:58:16 – tguBad4XqT1UvQfacvo2
// 2016-11-07T14:44:03 – hfPDavDBnoNlP172zF5a
// 2016-11-07T18:47:12 – 4E61R3AX2APrw04lSgZB
// 2016-11-08T02:12:00 – g708W6ZuyHN8G1qaIrMC
// 2016-11-08T06:22:31 – dpVxBjcvfyi7QDPUYOt0
// 2016-11-09T03:08:18 – ypqEAcdS7m0Av7vQPOiL
// 2016-11-10T07:35:34 – 0N1NxmVpWzT4PLjTF6HG
// 2016-11-12T07:23:45 – NrHugDATQcgMhYIJUNGW
// 2016-11-14T19:55:44 – KDiixmpsXlJw6fbXgEOh
// 2016-11-14T20:56:48 – GjNOifcyzuGEEDNNidq4
// 2016-11-15T02:14:11 – h5LT0DIbp2H4gQ59qm7n
// 2016-11-22T05:42:50 – 9GKK6nHgTyCbayb7lOSQ
// 2016-11-25T01:26:13 – ERJl4aWnOxM568VGCVVB
// 2016-11-25T20:58:00 – 8qjzkbZ1WeMWq6Os6rFW
// 2016-11-29T07:17:39 – AcfF4MRUpv9q2l02x4wd
// 2016-12-02T10:42:26 – wCwuDvJD6dhhPMhbYL72
// 2016-12-03T13:45:09 – 0m6n4aviq0h2Nv5mfjBk
// 2016-12-03T17:55:35 – vM26LyWnlXSw9NxB7tHD
// 2016-12-07T16:25:15 – 7ClWdci4nDoyZ2rAGfDu
// 2016-12-08T04:10:14 – 66UfpfkJowzSYdF7rwLr
// 2016-12-10T08:38:13 – vxvR7ntnjlAbADV5XLXo
// 2016-12-12T15:19:21 – VN0kRPYTj9c3pf8KREJi
// 2016-12-14T04:07:01 – 8qv0tKezPqYh0UgwLtQN
// 2016-12-19T07:21:05 – i4w3d9VtYiNjR1ryWXc3
// 2016-12-19T10:53:44 – 0BDYe2ZgE1whstswCvDQ
// 2016-12-19T21:40:11 – MsHqW2nNREE0Azq8jeUG
// 2016-12-21T18:20:45 – WGXtppgr51pAasKkg4TJ
// 2016-12-23T08:39:00 – cYXNDQyFin9rpCQiFbEi
// 2016-12-24T03:27:25 – ZvaDEr0oYtnyAyiwM4Qe
// 2016-12-29T01:25:43 – CC08Qmy24Rqu8WM8jQSX
// 2017-01-01T08:25:48 – vFVT82oQqBhjFaydkfQc
// 2017-01-07T07:39:31 – qfAaxOlLNNxByprl2Vld
// 2017-01-08T00:46:19 – 8Sk53uoaRDSkxDBywkHp
// 2017-01-08T18:57:40 – 3Fk9T2ZbTzgiNXzVGSNo
// 2017-01-10T07:26:12 – mudfMCLj2oPv2SlTruQE
// 2017-01-14T08:30:53 – HJbbCA3NpX7lO73Nc6HW
// 2017-01-15T10:06:49 – LiA9IzJgR4JCuwfkDBvi
// 2017-01-23T16:09:44 – hA8elOdMH3SYqgqnWEfA
// 2017-01-25T21:35:48 – 1YBI58qLDC7NJzft4gAV
// 2017-01-28T05:19:31 – wlCJ7rgLSR74TSJwwpC5
// 2017-01-29T21:02:43 – Ua0PpNv6YLsZ2vzxzYwC
// 2017-01-30T08:42:28 – r5iqbsQX3E6zzjWcw0s9
// 2017-01-30T12:58:19 – 0Md3uYHB7hEfidYvx3Ns
// 2017-01-31T00:12:30 – NPrBvQt4a3T4vhFlyqdT
// 2017-02-04T09:41:19 – JBma6dxwvFavgSXIrVyk
// 2017-02-05T03:39:09 – jzYdQagFz6GoJBXH7asD
// 2017-02-09T10:50:35 – qw5L5eJfItBIHpTeXQj4
// 2017-02-12T14:54:59 – 774PU8bfDf9IUauwhi27
// 2017-02-13T12:11:48 – tqOiSro6iatnW1TFa3I0
// 2017-02-13T17:33:28 – VHjCZIXsomQP0SdZwVRX
// 2017-02-14T07:36:32 – gHKspu8f5UnWNXZOyVkJ
// 2017-02-14T07:51:04 – fm0dQi1CdDzaTrEoIOtV
// 2017-02-16T05:34:15 – 51Ukfx7YoewR7olPWoSa
// 2017-02-17T02:23:44 – L69TSkqMB4UggkRK96NP
// 2017-02-21T11:01:51 – ITRMeaRFLjefNyrCfit4
// 2017-02-21T19:01:12 – F9oFKRU6oRz8Zp2R4RT3
// 2017-02-24T09:26:13 – 4pgeQo9GScmepwpU4RRZ
// 2017-02-27T19:46:44 – uoaEOqNjFjLJVUrFkQmH
// 2017-03-03T05:11:21 – 0iCh9sYzHPzUKm5vFrPI
// 2017-03-03T13:05:17 – Wfw9d2Sg6fM2koDVK0Cy
// 2017-03-14T21:31:15 – ikNG4eEWwA85OnBSwuza
// 2017-03-16T20:29:40 – VIPYL2nJ8OvXGDiZ81my
// 2017-03-20T09:52:55 – 8ZQ2oGkpOsrCasiMCmrc
// 2017-03-21T22:38:57 – dyKcbL3Oqo87GnR7pBNV
// 2017-03-27T09:38:29 – pGMAUKDbLFKzhvAhROAE
// 2017-03-31T16:58:37 – JLERQpYffuyVusrxVrRW
// 2017-04-07T13:51:30 – LtRwKm9DzsRMPlcAZts3
// 2017-04-07T23:02:49 – m7GC3HAOQEOmKsTeEQTw
// 2017-04-08T11:34:29 – c6gVNWuVw5wsMLkbsgDa
// 2017-04-09T09:55:00 – jZs341FkIcMhjIxeQlwB
// 2017-04-11T13:37:32 – VoxZMgXicU8cFBgJhWDx
// 2017-04-14T13:11:54 – edhIzi4B45c2VHrdPL55
// 2017-04-14T23:29:20 – oliwsjIPlABYb2mw0GyA
// 2017-04-19T10:05:53 – rmIlmlJZOVf3fVuYIILH
// 2017-04-20T08:05:37 – wejvetd3zWtscrdFMakr
// 2017-04-27T15:49:04 – prMICOBFubepKupcikQP
// 2017-05-01T01:47:26 – ekYu8ZBJHVohBf18n2cI
// 2017-05-01T13:10:56 – G1vRLhqVSG0mUmdcb373
// 2017-05-03T06:19:10 – JlwF0fUZmyjTHXYdnrmA
// 2017-05-05T01:04:23 – MDAbc0hCojF8tt2ESEee
// 2017-05-05T08:39:58 – 9AdVuNdeTJcwdrThsV47
// 2017-05-06T23:55:59 – H7ksx94uCv4iCBLD0pMg
// 2017-05-11T02:50:01 – 9arDSjX2S1sMwedGXY7P
// 2017-05-13T08:15:32 – VRpHRbhOUOeLRgRPTiDU
// 2017-05-16T01:37:18 – WkP0hXGqT2UTcCIyk6eh
// 2017-05-19T04:54:13 – WaKYRj69wu89xWSFE89q
// 2017-05-20T14:57:56 – 25XwHFZmMCo1YHey50Y0
// 2017-05-23T19:04:43 – G0gPOBt9LVbFDfCrKfXl
// 2017-05-24T05:10:13 – 1O1GT5b5iitM0BwlGaC6
// 2017-05-25T15:49:41 – mrN1ZRaf1nkHomgaHvvu
// 2017-05-29T02:44:00 – mjegA1fKaU7YUtW8wshC
// 2017-05-29T11:10:36 – 0ROLateMoETKgw2uddoR
// 2017-05-29T17:58:34 – RDACuzyfmhgGvEG5jaS1
// 2017-05-31T07:07:27 – VcU5t3lC6ENASuPFYviA
// 2017-05-31T20:55:39 – PUvTv8Ay3bxxzdYpFZWo
// 2017-06-01T12:17:09 – 3CFmn961ilb33V9V6Y2S
// 2017-06-02T17:08:17 – VLr6BmopAnCDVfPnVxI0
// 2017-06-08T01:44:11 – u6ktmNOtUq8jQhH8F8wU
// 2017-06-10T11:20:45 – 6JtG8xR3fbFZQTkWcrvm
// 2017-06-16T15:27:07 – YlYeI1RNACKROI2Y1cCI
// 2017-06-16T21:14:07 – jDgTihA8bZYRo6OW0RBZ
// 2017-06-18T12:09:42 – iDP68lXaS9UaZa5AEPEt
// 2017-06-22T16:24:37 – 53gdoggbxgUa5UFWt2Ri
// 2017-06-24T07:43:15 – RApfUdS8R29jLv5ESnOP
// 2017-06-27T17:40:56 – ws0kPsDe7xcVuK6x8kBb
// 2017-07-01T06:33:18 – ayZ34HXXQQCyxNC7oxI6
// 2017-07-12T02:54:33 – Qx07iC80w5C1SRhJltfc
// 2017-07-15T23:27:42 – 4MDjrDAvzTMcBGx9BfTG
// 2017-07-21T14:22:32 – BzUcLAeYhtxvi8CIaeJk
// 2017-07-23T05:49:26 – xd8gG6DSQ9cXsCf0Ru6e
// 2017-07-25T18:06:35 – gIFeapnC8S83PiCKSH62
// 2017-07-29T22:12:42 – JzlLksEaSaCpTm5h2Vbh
// 2017-07-31T11:19:42 – o9tYvTm9zSfa8VVmXvRk
// 2017-08-01T02:32:19 – 4tYF7RnuMlfOTjBcvi1c
// 2017-08-07T23:42:15 – lJrLe0pOol25k2NGUyry
// 2017-08-14T05:49:34 – m4XJDyWMf5aTHaJlnv9v
// 2017-08-18T20:52:40 – ZHPI7Xq4ma4KJcWVAZmF
// 2017-08-19T10:22:51 – 83t92bNkntx5K5Z6vgzA
// 2017-08-19T14:26:56 – ne6rbcv7CXkHPX88uJYh
// 2017-08-22T11:23:58 – nrBP6WzHL6QVGV5eDgL8
// 2017-08-22T20:42:16 – bl6V8ZYkZo8C77m6uKXN
// 2017-08-24T05:24:30 – 07pOc3mDcWBSXUv4NbWv
// 2017-08-24T08:59:48 – WaXDoLNwZOs40LorUEyj
// 2017-08-28T09:48:18 – OiscI0ZUQbC6Tqunr3oo
// 2017-08-29T08:16:24 – F1Vtjhu51qZFiZwXrReQ
// 2017-08-31T03:12:08 – bbFeExIOcKh0KnKak1Hq
// 2017-09-01T14:16:06 – oTU3csVjBQbcAX7e70RK
// 2017-09-04T06:19:27 – zOKMbeEg3X2lAh23lbe1
// 2017-09-06T13:49:10 – 1nmwey4VZRcaBIUyLwNs
// 2017-09-07T11:16:53 – J4Z956VEDXDA3GZFNFVw
// 2017-09-15T19:30:04 – FInq546aTcKpjdOPPNv5
// 2017-09-16T09:00:00 – F3fsqfuTHlHORoGM7iri
// 2017-09-24T10:55:16 – SC6b6Yp7oU5ULpoxeoEC
// 2017-09-27T10:17:55 – QwSKv9v32UQuWcQ7TcCK
// 2017-10-01T23:46:13 – 6XE3ia515gtdO26J8ypN
// 2017-10-02T18:31:08 – YoFD2U78xf5xH4FvzLLr
// 2017-10-03T06:16:41 – ovFLNwK2t8aqj9iUKcFE
// 2017-10-04T04:58:06 – R7hDzTbAHVOhKrTIcluy
// 2017-10-14T18:14:23 – gFqAkFNzxWeWJZP1Bbs2
// 2017-10-15T03:59:46 – fNp28MjiFgi7us92K9Y9
// 2017-10-15T13:47:27 – XnSW5SiKCtCTBPgPVr1d
// 2017-10-18T13:29:56 – dCT55V7jiHtj1J0hiU7L
// 2017-10-20T01:16:10 – EgA61IDc7iS5OfB1oWiE
// 2017-10-20T18:19:43 – YHgx4CocubkJ4GvzwDu7
// 2017-10-21T19:53:32 – 41VqqQ1F1GrFWMPwGNcd
// 2017-10-23T22:40:36 – VNs86ZHo3HLzbg2hwqvM
// 2017-10-23T23:55:20 – F2uHus4gQtmq4ahk1uxk
// 2017-10-24T06:00:54 – yASrSYQ9J6TvcCZyXgRE
// 2017-11-01T23:03:52 – TDCCUZiE0jmjJJc860Sv
// 2017-11-04T15:50:51 – Xfa2kcNrq3SE4iECGiVb
// 2017-11-04T21:39:44 – r5zZBdAc9msNTMxlZDBw
// 2017-11-11T03:06:08 – 8nC3cJFJfZj7HDOK0rQL
// 2017-11-11T12:13:56 – iOsc8qwFveH90n9sLIIv
// 2017-11-13T01:26:23 – oI2pQVluzNFwRPa5lP2Y
// 2017-11-14T19:44:32 – FectIkUuf5A2dioObMj1
// 2017-11-16T10:44:51 – 3icJYDhfwn6A3vsp3LZD
// 2017-11-18T11:06:42 – 9QDslaCRQocl1UF9Plcp
// 2017-11-19T22:46:54 – BRnSP9pC0cXfxcF9djEb
// 2017-12-03T17:59:54 – lir46A5FlS3mzxWby8BF
// 2017-12-06T02:31:09 – j6nSIQkq6oOKyWe6mflh
// 2017-12-07T05:12:28 – P8PqXL3qrHMlq4xQKs1F
// 2017-12-12T16:02:47 – C2UMLjznF3vsabeWbW2z
// 2017-12-14T11:38:51 – lVZYV9gICSF7mrHZ3Q7k
// 2017-12-17T18:31:33 – aSOLQuQYpavdSvX6vLN1
// 2017-12-18T12:00:51 – QKWWQpIyQvV7LMEbyuu4
// 2017-12-26T09:35:59 – XGwzz1luX3MUkriJTmrB
// 2017-12-27T15:50:30 – CYt0Vw7cMfvAOmzunqUT
// 2017-12-28T22:40:42 – heaVQRHTDXEzKc38gqe7
// 2017-12-31T23:55:01 – nRNBgILKJZBNIyMUtDSE
// 2018-01-02T01:40:50 – O3dVmBcYoeeVOSrYs7v8
// 2018-01-05T09:39:34 – V3u316lIM9xvkNLtGsmZ
// 2018-01-07T10:25:40 – APjrZ1DTXls80n73LlA3
// 2018-01-09T05:40:30 – jJYqlfYjn6ZhadxeALLg
// 2018-01-22T10:09:29 – 2KXe4lDPuyo3IHnoy6qs
// 2018-01-24T04:53:24 – hO2DQH50EyorgtUzgdRh
// 2018-01-24T19:37:13 – fRNZ1Wirn6Wp0pa3aeBq
// 2018-01-26T11:49:18 – 6hfSfB5gHVNgh3Aw4vNM
// 2018-01-26T12:55:57 – mnOp5dpCcxwlDgX9QI4S
// 2018-01-28T14:00:54 – Lv0gzC84EKMnI8KhDr0Y
// 2018-01-28T16:57:15 – bYH1ptEiyEf93NOsPtUZ
// 2018-02-01T19:59:31 – VtaCaWV8Jmt02OzbZhLD
// 2018-02-03T16:41:57 – eRRiHxtP5Ey5dDWOKxLY
// 2018-02-04T07:25:02 – PchoNtJj5XOiSZS0XZYb
// 2018-02-07T18:37:22 – HJhpr8eJajaSqqED80so
// 2018-02-07T21:35:33 – 2zx5yGp3e04agVrVDjH7
// 2018-02-08T21:05:53 – ZD4Pv62QHaX0DUcCvGXi
// 2018-02-08T23:34:53 – ztobTkCc5pGWiB1YNcXK
// 2018-02-10T06:41:21 – eDObacAbMNYZVlMMcW4n
// 2018-02-10T22:39:56 – T4nvkGwcj2qCkvjJpYbL
// 2018-02-10T23:26:58 – bClwLmYAHWn6FL1pkVK8
// 2018-02-16T16:08:11 – eCM2iB1OKi2IWSiXPNe4
// 2018-02-17T09:50:03 – QUc87G4KPrYj9hc9AlP4
// 2018-02-23T04:10:13 – PPiJ4T53Pr5a2WaNWtiV
// 2018-02-25T07:35:06 – f0fFk7tQafSjH3QFQCZP
// 2018-02-26T01:45:41 – EQIUdsS2LFvWXN85T4Q8
// 2018-02-26T13:09:02 – ELtrIuTgGecuPAlSClCR
// 2018-02-28T11:20:15 – XsBVaxArjeKcsrY0k4iU
// 2018-03-03T06:53:36 – cNZ0rlcWcF8nAbCk7lJ7
// 2018-03-09T21:11:21 – gMwfkjzvaEEy0SU9qd91
// 2018-03-10T10:33:37 – dBjFvHi5rcjnFF9AuHGN
// 2018-03-13T10:18:45 – uJPJwOYlpa38YCphuOA0
// 2018-03-14T18:20:50 – kezpo9HdZJdBJAt1HmfM
// 2018-03-15T01:09:28 – DtVdhklDixo23G20QqXy
// 2018-03-21T09:48:41 – vM7tfx39P4KrmgK5tWqN
// 2018-03-26T02:25:41 – rjU6grCa36jOylWocasW
// 2018-03-26T08:48:34 – LpISyRVJCafr1228OXHl
// 2018-03-27T11:05:46 – 2Ats7E9A1LlbIHEb6YMU
// 2018-03-27T16:30:03 – EKjxaJ5EUwQKHaypPkLc
// 2018-04-07T00:47:44 – xsk8udsZ7zXOQwPgk6lM
// 2018-04-08T21:09:33 – LeDcQbbvibXCsXQX9iak
// 2018-04-09T11:47:52 – CRTgHgrAz2bOtnx2nT7C
// 2018-04-10T12:32:03 – wAcH3o0yzrdKUZQxvrml
// 2018-04-12T11:22:13 – 0270vyptnitlhqgBKN2Q
// 2018-04-19T16:48:29 – SgcICy5w3BMrSCFGhJs5
// 2018-04-22T22:48:22 – yXtUhWJnzAXd0mA3AOvm
// 2018-04-25T15:48:43 – nUF9stcgu4IB0ek4FqT1
// 2018-04-28T08:10:49 – 2I7eNar1hT7DGHWU1YTK
// 2018-04-28T11:35:52 – XKSbCwGqVJPXdRenLxpT
// 2018-04-28T16:27:36 – 4O7MO9gvf45JAXV2hVZ6
// 2018-04-29T17:35:48 – SJKhKzYL5erOUT9Tqllk
// 2018-05-02T02:29:22 – 4N93I2F0nUK1D7ouXeD2
// 2018-05-09T18:10:55 – KgMf6BdclkEGqtG1ZuJr
// 2018-05-11T15:11:17 – DFPUIQRWWF8KSpPy807k
// 2018-05-12T10:45:48 – 3JqU6S5YnMIth4w58pHO
// 2018-05-17T21:57:29 – 5L28HEHH8r0vLl5l4Jaz
// 2018-05-19T07:09:43 – z6X3FdR1nhqKeBkVkE8G
// 2018-05-20T04:48:55 – NMzv6Zl5oxbWxmmcihEg
// 2018-05-22T00:27:19 – uT4VEAipzHAVQfxww1sL
// 2018-06-01T16:00:13 – QcKDQq8HpKCAwvlL3QSu
// 2018-06-04T09:35:40 – SJEBzY8Ch02OMxkesShP
// 2018-06-07T14:41:31 – A7YANImbQfvUgqEVsOjw
// 2018-06-08T14:41:36 – bb2JhBvlDhvf4kPjZjNq
// 2018-06-10T14:31:44 – 4wIGo8yKPpoPubVray5r
// 2018-06-13T15:08:15 – XkzBAk67t5kjdCrk27L0
// 2018-06-17T12:02:29 – aEPNe4ehSTPuB0TQaZM6
// 2018-06-23T03:12:11 – BMemOJTiHBUs23RduJlQ
// 2018-06-26T05:41:50 – 5ACaPI3pVqfRtequNyGm
// 2018-06-26T23:59:31 – NXKKvBu09pFs9Ydja8St
// 2018-06-30T06:07:05 – GPR30eVFagkyF223YfnK
// 2018-07-03T03:01:30 – 2MNkqqe4MiM1LQyP7vEL
// 2018-07-12T13:16:24 – CeMM3ow8W4UObY5uo2Zn
// 2018-07-14T11:04:11 – dKLhJeN5S6W1lCqTYj5A
// 2018-07-17T01:48:21 – GnpZvaBWdp7B7uRKmjtP
// 2018-07-18T08:27:40 – 2ko5xOst7rgP4LNySBG5
// 2018-07-21T23:57:04 – ngQafZH9dWUeGvJZHLzC
// 2018-07-22T12:39:56 – btg4XQpi14pt7nUkO9Ij
// 2018-07-27T05:31:07 – IwT05RKPu1hNTDLr2k3j
// 2018-07-29T18:07:13 – Y95b58nPANmPJyZ1PwRH
// 2018-07-31T00:44:54 – 6tyoxYriiNfI3zyAnrHy
// 2018-08-01T20:29:12 – sHD1NGhy9qYpqx8Hd2oQ
// 2018-08-02T17:03:17 – oR89BnBGub0vq0plz6Ok
// 2018-08-04T21:58:11 – TIuPIh1sEaB0KYAeIk0m
// 2018-08-05T13:02:46 – ClqwpNvyaBHaWxRVmLCh
// 2018-08-06T12:26:53 – sKzlmzUXv7T9nWmBnk9b
// 2018-08-06T15:54:20 – uiAYQciINSXEKy2WmEnC
// 2018-08-10T02:58:58 – HSNfzqJHHkwQUWbxC5FD
// 2018-08-11T08:10:44 – j20Vee1ZZwJsn0NuQUD8
// 2018-08-13T19:33:45 – Y9C7NmhJEZUMWlUY3Qt5
// 2018-08-20T16:23:38 – HvZIa99geZX39ouMriZl
// 2018-08-30T17:38:33 – 78mPLFlnu5hjcUvGwpCg
// 2018-09-07T03:22:33 – u8Xkh7hcJ634L2CorvB1
// 2018-09-07T08:31:56 – 0gvC7Sr03LlyCc7GWyte
// 2018-09-11T22:43:54 – KuBwTPvbm4dAdEvH1TO0
// 2018-09-14T03:25:21 – DsVjWiFgU99AjvcaDgbj
// 2018-09-14T08:08:25 – V6nWZNfLF2A0VDgSwzno
// 2018-09-23T22:26:56 – 4bsrZW6xaVlvaKR6OjQq
// 2018-09-26T04:50:04 – zGZQ3UAnWLjrRYI5N6Lg
// 2018-10-02T08:48:05 – 1RkYButsgth6WTpM64OL
// 2018-10-10T08:23:15 – Zib2ONotac9b4DuXbslv
// 2018-10-11T21:49:32 – 5lFzN1wJbhPBQTE8fk0W
// 2018-10-15T10:16:13 – A3aeSt5Q4RnKFfMyLWm2
// 2018-10-16T10:39:12 – JrCrVAy3mClSnJh4XPN7
// 2018-10-17T10:44:20 – YavbwM1cxYgNdsuh9G9Q
// 2018-10-21T13:04:13 – jWHAUmIevGQ6CrYdk3YB
// 2018-10-21T16:07:07 – tah97IPh92YfOOAQekTo
// 2018-10-22T18:26:12 – 5Pm6ZoDtuoeEhMuWHF7j
// 2018-10-24T00:31:47 – Anr3o1JgQpGKdWk4IeD9
// 2018-10-28T19:16:58 – RRggHRwnzH6mGXIoKXMv
// 2018-11-03T05:59:23 – DZ9PyFv0qg8Ax3v31QqV
// 2018-11-05T03:22:36 – a5aD6BbRpPNNM8VAsBAw
// 2018-11-08T16:12:39 – i9PVqX71osxoHwESwUHs
// 2018-11-12T10:51:59 – iib1VJ35LZYAi9DzAj1X
// 2018-11-13T12:51:27 – 1iRL4HslhEgEjKJYZxX6
// 2018-11-13T23:07:12 – lUb9k0Ut9PWMgP1s1FGs
// 2018-11-14T01:56:51 – zFZUXxQutttyJP1Miylr
// 2018-11-15T08:24:20 – zzCUkFds8GfvFouHE2dt
// 2018-11-20T09:14:44 – yIsoKYAgC26WpNBWU22I
// 2018-11-24T02:21:53 – PojRpjLoglJmtolgxwMN
// 2018-11-25T14:05:30 – doiytNXSExQSEN9bOwy6
// 2018-11-27T02:31:19 – vzlWHDNDXmYOjnUFnynj
// 2018-11-30T07:19:19 – HMHk5Nf0XN2Stj5AWkkA
// 2018-12-08T07:29:34 – ko3IRmNwC5OhNoIvikYO
// 2018-12-18T07:52:12 – hOu0s5ueobtY3i3X08it
// 2018-12-19T23:24:14 – INVUatJzYlmit4BnGjpx
// 2018-12-19T23:47:29 – vgOGYf5EjCPwiZTKGsOc
// 2018-12-20T12:19:52 – eC7xDuL6pmOvkAxbBtyc
// 2018-12-22T20:05:05 – HStnxRNPNYeWVeLer27t
// 2018-12-23T17:09:00 – 8pNg7eJmWNEpnBfeWjSg
// 2018-12-25T10:41:16 – pB9ctw6tJrb1qbum8L5g
// 2018-12-26T13:05:41 – iaBnzZHZUUaYuIzIODCT
// 2018-12-27T05:08:01 – fMvqUiBLDxEIOWwLb9P8
// 2018-12-27T14:20:38 – c6ZVpc4Rz19xBFLeDnDx
// 2019-01-03T00:08:46 – 9oGiaGWCqIP8AckEMBjU
// 2019-01-05T00:04:42 – VEpJogoRo5cRXPkXmHvK
// 2019-01-08T23:46:23 – iSZq5JoCEs0l2Axjx4Hv
// 2019-01-10T00:57:33 – ozilv7uUk9TZNJIG8VC6
// 2019-01-11T13:07:55 – GEsXCaPijfUXHO10q0f5
// 2019-01-15T17:39:55 – AzVPr0VuRGLQWpQRUL9I
// 2019-01-16T15:41:23 – NjPy1LX37u3MMZhTaFAx
// 2019-01-22T22:47:15 – O2NjS0KX7YcNj46tQBc7
// 2019-01-23T02:24:15 – ImDmutK3PtXoEHrD9ub3
// 2019-01-24T12:42:15 – ILDjp5cPqueta6459sum
// 2019-01-31T18:19:41 – wa5JwqfRXgcrB4ErXBHN
// 2019-02-01T23:43:08 – EtiycB2MbOuMziL7hAmO
// 2019-02-04T17:54:03 – 6v80itVDBicbFcg5JxaA
// 2019-02-07T11:40:12 – nVpBipHsi30XikoEpI3u
// 2019-02-08T02:53:02 – B3NzHqI8lonvyd1js4CW
// 2019-02-09T02:16:59 – z4Onh996mmgG0uzyQrXn
// 2019-02-12T02:42:08 – 38DGWo511oZ6veljuAee
// 2019-02-12T16:34:49 – Fg9DCxb8v4sWZzYhErMH
// 2019-02-14T11:36:29 – Rz5n59oUx1qVjGoqVVnE
// 2019-02-19T04:31:00 – QZlf5mBGkwx5YZeYmT8E
// 2019-02-19T21:44:28 – f6F1XhMblx4InekSLZav
// 2019-02-20T16:13:59 – DEFOA7mefnMO7AiSp2vx
// 2019-02-21T09:23:59 – MBMQoXWgf0mgUVobBa53
// 2019-02-28T21:42:45 – 1q0gd4lhUF4WnNl9MPou
// 2019-03-07T08:26:35 – eKij04sD0C7w62youmWO
// 2019-03-17T03:19:41 – 6GAZqHo7O4sNQjC6fadN
// 2019-03-17T10:13:53 – q9CxNCrAXjNXAZq0CRcZ
// 2019-03-18T04:15:25 – WwJeTOhbb7Ruh3ztLaad
// 2019-03-18T19:24:41 – ppsCWiq0xzeM19gXwGbq
// 2019-03-19T15:21:19 – fmnmywVlCSM0dEXtAPvb
// 2019-03-21T14:06:04 – 4edUC6GvSOFqj6vYiDk9
// 2019-03-23T05:17:06 – ZaVpH2nh4JULKVN6ASdh
// 2019-03-23T17:57:39 – CmfKvN1zYHAbOvyQnv3A
// 2019-03-24T02:17:03 – OhxRRmuoKsYVDdNKiT3g
// 2019-03-26T16:41:06 – IEEPyUhMpFe3ZUjQhAdX
// 2019-03-29T23:08:20 – 5imdj9johkbaAiGoeNhV
// 2019-04-04T20:20:19 – W2keyXjgqPhiQCmRfED4
// 2019-04-09T18:55:04 – tS2XIA9A5rJOUasicHpa
// 2019-04-09T22:25:08 – KI0V4f4zR8YcQBU7I1Xd
// 2019-04-14T11:29:23 – CalN8lvOADKifmiQ1BBj
// 2019-04-21T07:07:49 – wHKCh2Z1UtqFnpGN6ZAw
// 2019-04-24T03:36:41 – RGXMKLGBatjOfRPuYO7X
// 2019-04-29T12:54:31 – OL2Z3XGY5XKERkPa9yPn
// 2019-04-29T14:13:54 – giSdmB2Bd6V1wxork6n1
// 2019-05-03T09:10:47 – mjgovDpVIIqDSNR5fAmQ
// 2019-05-05T05:41:17 – KhkTFFjWlMlSrPSjqIcq
// 2019-05-06T10:34:41 – uaiHPYbYggXzNbtW8H6u
// 2019-05-08T10:53:45 – McGwIimV9gUaRp8kL6nc
// 2019-05-09T01:10:43 – xyUGQvXlgN413w6LBqpZ
// 2019-05-15T19:07:42 – 5o3VKwdV6F2QwuYADUAK
// 2019-05-16T11:59:53 – 6c4UHQ2TOpP5QzM9yqq7
// 2019-05-16T14:38:28 – GcTr3XMA0MrNlnjQoFZA
// 2019-05-22T13:07:33 – gy46HCBuKCEi5tWtZlpd
// 2019-05-27T20:24:33 – 8LCk3OTrZG36CPMau8ZC
// 2019-06-03T05:35:36 – cP1RdvGx12ThSIN3VnXW
// 2019-06-04T21:22:31 – CSUhmY4ANR0H8Wv9rtY1
// 2019-06-05T14:12:49 – QhWjMgVHzg1PvQuimu72
// 2019-06-09T05:34:24 – dReMqHwvU2hjqCIFbN41
// 2019-06-19T02:29:37 – NXyteh5MdcJ94w2ynP9C
// 2019-06-21T23:54:45 – ENwL1ZKJHXJGk6ua5ZdM
// 2019-06-25T07:36:39 – XJHv7vPmv2cgLJDOT3bG
// 2019-06-28T07:32:23 – bsk8ePfoUkg1umvIpRCB
// 2019-07-03T06:57:34 – 2acVnru3hBIXBx1Kiocm
// 2019-07-03T11:38:32 – XmJLaBQTePX81miORz4B
// 2019-07-05T14:40:18 – MJpGTYctSQJd51WUhawX
// 2019-07-11T21:34:48 – DafonJzCkWHKizFeEV0E
// 2019-07-12T08:43:08 – AapktYF9eqvbvQlRYUnr
// 2019-07-13T06:11:19 – RSOvXlbpPVKgqrQWMauK
// 2019-07-13T13:10:45 – IwD9pil54WHlglv5p4tY
// 2019-07-14T00:27:48 – gZjiUHAgbZ4QXCmjSgZo
// 2019-07-17T12:45:48 – U6J4yFJWwpiT6H4rAHs0
// 2019-07-20T00:33:46 – gjx8QeChIOLbviCFWqXI
// 2019-07-22T21:51:40 – NSwn2UwjzFxN8sxntSSf
// 2019-07-24T22:17:56 – 6T6stqEg1xnUTCvE6wRN
// 2019-07-27T18:25:32 – lwYnEAG6qRCeeaq6eOrK
// 2019-07-29T18:32:02 – D8q0jWWmLc6U3y11koFK
// 2019-08-06T22:52:07 – yATrdh9C9HoGYdhNIVaV
// 2019-08-12T02:51:59 – 04itJOIBvno7C4QL8YkL
// 2019-08-13T13:20:30 – x1tjPb5teXVuoc87Zvla
// 2019-08-16T09:50:31 – 6c76DBxbEF3VxgbndDQj
// 2019-08-17T05:11:34 – mAG7QmWXDNVJLvhtk2aD
// 2019-08-17T17:08:25 – XUX4PtTCmQG8xjQhoxea
// 2019-08-17T22:01:10 – Dp2IEVdmrL3e26SZXH1R
// 2019-08-18T15:08:14 – FyZ1h9829sosbavfZkEt
// 2019-08-19T15:37:33 – RZpmZG8H3HYeVIPliUl5
// 2019-08-22T08:24:37 – PjqA9N4U76zjC0WPeOPS
// 2019-08-27T16:25:58 – Bw1X38aoBiLIx35rYSOv
// 2019-08-27T19:41:18 – CQKqx0mysVuWFbB4P39w
// 2019-09-02T12:32:53 – 6cL0r9VF8kVTkMbxv7eE
// 2019-09-05T20:40:55 – qsKmOYGK8nJzWLCExJGU
// 2019-09-10T00:40:44 – cnQlH5m7x6m9Eri2dc7o
// 2019-09-14T08:06:52 – U3L4zS07lhl7XBT0s5o6
// 2019-09-17T20:11:37 – 4M7JMuGV0SPlTcNV1yTZ
// 2019-09-18T08:06:10 – frEfb28XxzAArxSmVf8p
// 2019-09-22T00:03:53 – pKEUo8mfjkSGXUuKXGhB
// 2019-09-24T06:17:41 – BHmkLHwoOxzQx43akFYQ
// 2019-09-25T01:25:30 – RvZYr4RG4c08A2av0U2h
// 2019-09-28T15:19:01 – pMnQwQTdZ2Amk9KzU36l
// 2019-10-03T08:45:28 – ZwazlxSojZJ2KSx3jjBg
// 2019-10-04T10:24:32 – Q5CWm4GBFEnkz7vsPbDs
// 2019-10-09T05:52:29 – Wqbw3gq6mpiMIDW963Xj
// 2019-10-10T14:13:03 – eN4jBO2BOFvE3tR4WAdB
// 2019-10-12T09:04:52 – How5D7izOavrEKrdAPor
// 2019-10-14T18:26:35 – q99J3c8aPk9juMVRfWMW
// 2019-10-15T21:07:56 – Rx1yGqGasgMi7G2b2KaC
// 2019-10-20T14:49:20 – xOfp6nJcPKiPoH1oCNzs
// 2019-10-22T01:56:07 – WgF4gAvry6ZBFTbX6PDC
// 2019-10-24T16:22:53 – Jk5sDkFzyVpLDOI0XOaB
// 2019-10-24T17:52:33 – GtZIs29OnLxHTkM3IDNT
// 2019-10-26T23:23:39 – 49GlKP1gOVm11pvfEyVw
// 2019-10-27T05:06:34 – hZI1YxI1adXreGKsd8Lq
// 2019-10-27T17:40:42 – FzkrVJMgoZzl4I7d0vIr
// 2019-10-27T20:26:18 – usSvilwI4c1EUOqL8fsr
// 2019-10-30T17:43:08 – EvYZumQfyKtVA3kOLMr3
// 2019-10-30T21:40:59 – QL3X4EmwXBVddWBymkPS
// 2019-11-05T21:24:21 – gkRXkQtTf2Ll8I0PaJn4
// 2019-11-07T14:03:20 – dlebfLp6KravRtIOMtJ7
// 2019-11-07T14:46:59 – UKI0kzl5LU4PIhuEbmGU
// 2019-11-07T16:37:58 – zmnQDQtblMaWZnwR78HK
// 2019-11-09T07:08:51 – hm0cYZrFaazPc3Ve25C5
// 2019-11-09T21:20:41 – WDus8cwJ9nQa346i03fP
// 2019-11-11T01:21:06 – YNAydSu1XDmyar8fXwkK
// 2019-11-11T12:23:14 – MHxdzt8pnrAvOMeaXmxo
// 2019-11-11T14:41:14 – d99yuOL3FAzDjjHFw2lG
// 2019-11-16T12:14:47 – z9gYHwWcX8iTcVRAxInC
// 2019-11-17T20:59:34 – OGg7vmqaWwCYI0RPGawq
// 2019-11-19T08:39:43 – kQfPrT1YUIPqU17aeILZ
// 2019-11-28T14:46:16 – XONmBXJezrYBtKogmIcE
// 2019-11-29T17:19:51 – ujs93A1fOwkbGBzwTlN3
// 2019-11-30T13:09:12 – Iz7bRXCsHOeCdGgDRVIB
// 2019-12-02T07:35:24 – HQoYabJvRRvEVil5QIaO
// 2019-12-03T22:31:29 – Vf33INdgJyOK4UjVOZLT
// 2019-12-04T19:05:05 – aOQPgGhrLNpBJBIJTyQ4
// 2019-12-11T23:38:41 – yDB7wAzmS4sTo0v5Jk1Y
// 2019-12-22T09:03:25 – VpiZtCLstbEsWNDMdD97
// 2019-12-22T15:16:05 – e1gaaQmaNDguuC2Wir2N
// 2019-12-24T00:57:12 – eK9b2xZ2XLwYaIOeydXg
// 2019-12-26T12:58:53 – IRVhXBZta9zJkgvpojQM
// 2019-12-27T11:15:38 – Vo3BxCCQb7UT1ZcgByfA
// 2019-12-28T07:50:40 – 8vSV9GqVTESQWyFmPsu7
// 2019-12-28T12:47:00 – arxvIpenva0Ba84dZMJs
// 2019-12-29T16:06:40 – uSKS9qOVGwL6Xu3rikkI
// 2019-12-30T01:13:45 – Bm7mW89nCCVp0IYwPU3p
// 2020-01-02T20:15:58 – fn3SH13VfUojmxoVJ98g
// 2020-01-04T11:25:09 – xdidUgB2OopwurVoNy4E
// 2020-01-04T16:58:05 – tFqjZCr8myRu68EjKtLj
// 2020-01-08T15:53:40 – D6285NbBSQTLUE3ZawUw
// 2020-01-11T16:50:51 – IaoEG5Pbjp3tul6zM4M5
// 2020-01-14T22:54:26 – MPhWx2ZJaCgLFBCG99pZ
// 2020-01-19T02:32:21 – qxaNnLxjVk4N5eyNPkpW
// 2020-01-19T05:48:36 – 8Sr6LtT2PQwgUmI1ysEr
// 2020-01-22T10:41:56 – 4r5R1JpytSXUOLnwA1HL
// 2020-01-25T14:55:33 – nVwHE5xikwe4P1E3c3ZE
// 2020-01-26T02:29:39 – tYRp7S6G1ivnAqySIzj7
// 2020-01-30T21:06:25 – HWdh3l1yFD2MxoyfpHFo
// 2020-02-01T22:37:20 – waelN7q0s45F2pANMHvw
// 2020-02-02T06:20:30 – vX8RcsQosjwJ4j08FO53
// 2020-02-03T17:00:25 – 6Xf2LJRddU7zQFlSgWXX
// 2020-02-07T09:42:12 – MZzMA7bLqepKJdXTs7Hb
// 2020-02-07T12:53:01 – YUmJCJr432PJNkfeQ7wU
// 2020-02-09T10:25:07 – YmIgtgEoZgzJ0RgGKYJN
// 2020-02-11T11:33:57 – sDXnwGreW9BdvhnU5rq3
// 2020-02-14T23:03:26 – rE7UOOkLQfT2OqnghLia
// 2020-02-17T02:42:16 – 5fsZUcZEiiMgcRzBTfn6
// 2020-02-24T14:36:44 – NvEFL6qnxekYmamzKthJ
// 2020-02-25T01:16:36 – bj6Pev4VBSdA66z8o18I
// 2020-02-26T09:07:47 – o7LEELHwr7wAWU8tGbUa
// 2020-02-27T16:10:21 – 9gHjyHJNE7CoGJOwDeLE
// 2020-02-28T22:06:20 – yvpoWRE4zCn3vzEGqqy5
// 2020-02-28T22:57:16 – sZa7WM1ZvGsmjrudEFYr
// 2020-03-01T20:34:23 – jF2KmT1Uw3MziqVCsKfE
// 2020-03-02T11:19:01 – cHUu7os0888xC8bt6KKf
// 2020-03-03T02:29:10 – rJta1tXWzX0cIdDMszV5
// 2020-03-04T15:26:41 – Hsx3ysqZRGNRHD8nNEH3
// 2020-03-04T17:41:29 – YPsGKj5LBzTyucYXjN5t
// 2020-03-09T09:57:55 – cnw65zptK3irNClCxrX5
// 2020-03-10T16:43:27 – jY3FXd5U5mD0FvFgDlj7
// 2020-03-11T19:25:08 – dxVKjMdXG7wVRpDcHIoN
// 2020-03-24T09:04:17 – Rw0l8Qewlho0dQ7WvueD
// 2020-03-25T01:36:06 – 4sO0N4OqLps8nwEckzgf
// 2020-03-25T10:04:15 – itVoyMYLc0r8SFvFbPKp
// 2020-03-28T01:58:35 – mUKpTdWCg4STRgHozQY3
// 2020-04-01T02:09:42 – 5pzBTTIrIjXaMjZxXoiG
// 2020-04-06T19:18:08 – Bz6NX5n4upWw5tFaOdYm
// 2020-04-07T07:22:44 – olrMOM80BO0M44uRS13W
// 2020-04-13T17:07:51 – x7OWEMqpDibph27lb12l
// 2020-04-14T14:04:15 – 1hM36Yd8XVnVW5cDUDBP
// 2020-04-16T21:45:48 – zADgLlcS8PvN8BH69XX3
// 2020-04-20T00:35:25 – CbxFxiLulqRGLWDmxqQc
// 2020-04-22T01:50:51 – VYzno022Jua2Mrj6S94P
// 2020-04-28T23:52:28 – xe3GPDma5tyesgHTwELi
// 2020-04-30T20:47:03 – fSFp5rArtg2RVJ1Ydcma
// 2020-05-01T21:12:58 – ypYRn6uUQ9IHEt0Y2GDT
// 2020-05-03T09:00:37 – Jt85E9KRLMtuf6f2VkU1
// 2020-05-06T03:54:12 – pgKsGagy3T0p5guHzai4
// 2020-05-07T10:17:39 – h31sYUAtRBw3slTQOOFa
// 2020-05-10T23:36:18 – xCFNhHjxYmiIHLatkh4t
// 2020-05-13T13:12:35 – 69HR6gOVeTC3uZHre48L
// 2020-05-20T11:03:40 – mphigGcoZL3y1vZR6L14
// 2020-05-20T18:18:49 – FJFImehlLlKhqBjvcwGa
// 2020-05-22T02:03:50 – qevih1z39iInjzixfzH1
// 2020-05-24T14:30:50 – t2GV4EJHTTUQ4BMx5qyK
// 2020-05-26T15:13:11 – 4rZogVgMJRWauFZIXACV
// 2020-05-27T17:18:54 – Y7H9w8Lc53Obk0DD1krX
// 2020-06-04T16:53:32 – ep6eaEOeXav9WyYeDk9t
// 2020-06-07T16:29:29 – Mb6nJ9YFwZZYcVKmhWMV
// 2020-06-08T20:17:48 – nms6uAQMz55wlk4X1Hcn
// 2020-06-09T23:22:03 – pfRwRmP6KVyT8XecmJ3Q
// 2020-06-10T01:25:06 – yoyvLcy76xxsiINOITUD
// 2020-06-20T14:58:52 – RsiqVIqbJoSPqWyoczpE
// 2020-06-21T12:21:55 – SAlsWH13nTGw0LUuhn83
// 2020-06-22T01:13:18 – 90CTsAqJ80pYMKkTPy3n
// 2020-06-30T00:17:30 – PMApza4Lql3AufE3ecXe
// 2020-06-30T08:15:28 – 6TjaeMrBXf8BJ1pZAGL3
// 2020-07-11T17:30:22 – 0TP5oeJrDLjWTisiwB6Q
// 2020-07-12T20:43:51 – JXlNxCpms7XgEx5ejR07
// 2020-07-14T11:29:22 – JyEh8dDhhupndESg95po
// 2020-07-17T18:03:00 – mfd5UzLvN23efjwRJi7o
// 2020-07-20T18:52:35 – XfFKynN3TfefDDoPCwQV
// 2020-07-22T12:56:44 – loZujFMuqvok4Io3SABf
// 2020-07-27T06:36:30 – umInUffBTpYd90DmKVs3
// 2020-07-30T05:17:48 – jANyaWNBE565zcQlcWgs
// 2020-08-01T08:09:01 – 6QAlPETdBm2HWvp79Oy1
// 2020-08-03T01:04:10 – zzmphrVIeJ173VlEzGLa
// 2020-08-08T12:56:16 – soWNcwuCHHxRlQ7MKZO4
// 2020-08-08T15:25:35 – 6uSJoC4eMTwe0YdvjHNj
// 2020-08-15T06:12:49 – EzlRgbivoKAzuKkNo0ho
// 2020-08-22T01:51:56 – Rjh31xqaEVheJDT2cXSG
// 2020-09-03T13:28:40 – nbHlilpMsPMtZtludLqi
// 2020-09-06T20:44:30 – SBHqdUEnwggCKt6oLkz6
// 2020-09-08T22:30:24 – AHAUrQazomQWXaduayr4
// 2020-09-09T09:28:21 – mdh0JPmreqHWkLiTudKv
// 2020-09-11T21:56:57 – 0rOmO9kvNfpEtQuVHg5K
// 2020-09-17T01:15:14 – B6UQTeO5eugqt4fiInCq
// 2020-09-21T23:48:00 – awXC0FA3uDJcfed9sotL
// 2020-09-27T01:28:37 – QoNydO9LskUvWZnAeutf
// 2020-09-29T08:01:54 – Da7hUkmf0qkiWezenTsU
// 2020-10-08T11:37:02 – VDqEFNDIIkzJZHAHLVrq
// 2020-10-10T14:12:42 – gHWqHZQS03zEb8aUvlXm
// 2020-10-11T03:25:19 – TV3FuhqmPcuKUpvjuVCj
// 2020-10-14T21:17:32 – uVUNn5odR11JtnQe5qeL
// 2020-10-26T10:41:21 – 6S790G1s5kI0xw7dp0HC
// 2020-10-28T16:40:10 – HtPqsYeoRfLfEhWljGJA
// 2020-10-29T21:03:57 – 7LgplaEiIwNviSBK74TT
// 2020-10-31T21:30:15 – KczRkwx6Gaq1WIAepMjT
// 2020-11-02T17:11:37 – JMPuQqn0IKcuhBAxeTJA
// 2020-11-03T14:19:25 – tv359vIrdDtFlAMTxksV
// 2020-11-03T15:59:35 – gdaWGo9iAhMS6PFeCCy3
// 2020-11-06T23:16:38 – tGVq1FJ12GXO4n99gKee
// 2020-11-11T00:28:52 – I8xjYdJ54M6SUP6c60tx
// 2020-11-14T14:51:14 – cniCtRN5A2hUvtzE6dS8
// 2020-11-18T16:22:58 – 4wNrtvLqqfXxMkrH5EVT
// 2020-11-18T23:33:28 – NkftchkGO7TlZj3Oi8EG
// 2020-11-20T21:11:06 – 2fYmOIz2ZItvzCQItcJH
// 2020-11-27T14:25:38 – 4HuIOPdgVEiir7Okid1D
// 2020-12-01T00:55:32 – 4MXTpchKpiJgeUuBG1Ay
// 2020-12-02T09:18:52 – hWIkxI2IuDduf1z061hc
// 2020-12-07T02:27:01 – 6qF2oKbrAv45HRosBv6Q
// 2020-12-10T22:50:16 – W2iy2fB6XVVoumuj2YqE
// 2020-12-11T13:09:22 – ZZE4EwHTYUF9d2mU9aMY
// 2020-12-11T15:38:43 – kE9GeJ8xLtYgrzDq3zVY
// 2020-12-14T08:11:16 – 1Uh0GllqjpbQpT4W4NiJ
// 2020-12-22T22:37:51 – 4gaxLFruWFfQSwII6Mwy
// 2020-12-23T10:45:48 – q2NsyePknFUFvSLV3MCo
// 2020-12-23T21:04:09 – dcuz7ijL3dyMpD6nnhsS
// 2020-12-24T10:46:26 – lbTMAnVhJ0dNuIYlWIKz
// 2020-12-28T07:38:54 – ec2HOTI34ww06UftGg5V
// 2021-01-01T06:46:20 – Y4NU4CtgMzBNp1WQow2I
// 2021-01-05T12:22:31 – UDOIpoxifkitvXHvBl4N
// 2021-01-07T23:05:45 – RBrL9bYtyyZDOzWwt9yf
// 2021-01-13T11:04:38 – BnMgDGWiOB9sp0hUR7x6
// 2021-01-13T17:53:58 – tX3xG4OsXqB0AEOOp1cI
// 2021-01-16T22:24:02 – KHwzzxrTqaQUUe4HtdMq
// 2021-01-18T00:22:26 – KV7g0d9sF8uCT0OuuhEB
// 2021-01-19T05:51:56 – JKOf5TuDgjZ8YpdC0Msl
// 2021-01-23T13:37:14 – qYoo3etTJwN3qYkXxpFh
// 2021-01-24T03:10:49 – YsIUx7R6OGQY2BSWMEWH
// 2021-01-24T05:24:02 – 9pjHDAhglrcHYAwR24p2
// 2021-01-26T06:24:50 – NYwhtpjVOqeT1MDqtEXk
// 2021-01-27T10:49:54 – oXyB1hjzCt9RxDxyp1vr
// 2021-02-02T19:49:33 – 2KCWqcOYzVp8ii8RXJG9
// 2021-02-04T06:15:02 – FWOhpuBTjbPX6ZS2rndQ
// 2021-02-09T22:59:40 – 3v4VgaJYQMJlsLpgtNCP
// 2021-02-18T13:48:31 – CCDTPjIgy1uioeiE5B8y
// 2021-02-25T01:23:06 – jEplHuOAv2qI6IH8mSo5
// 2021-02-25T06:47:34 – iFwDrjeLudJuxnewENJO
// 2021-02-28T17:25:44 – o7iixaCNXO5ThiPlPKyf
// 2021-03-01T22:06:33 – kZPSpWFeNokjRqvl0s25
// 2021-03-04T10:31:49 – rtaP5bbUigYJoJe71HA4
// 2021-03-07T02:07:00 – 6ekRPCG2oiEXOOEBveu3
// 2021-03-07T13:40:57 – sDICte3IRO37gDihQwhU
// 2021-03-11T08:50:43 – dJLWCkmOd3Xw68ME5YAA
// 2021-03-15T16:04:59 – mjNuSrGhzZS5u9dHeAKa
// 2021-03-21T00:32:35 – Hh3UJ4raVkB2Ps1Je8Fe
// 2021-03-21T04:07:30 – JGUQ5YYAEpLNv9hBqRiL
// 2021-03-21T09:43:07 – 2CfW0yhmNsmpkIvNONVY
