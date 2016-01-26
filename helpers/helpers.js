// Import necessary dependencies
const ethers = require("ethers");
const Big = require('big.js');

/**
 * This file is designed for housing functions that you might want to reuse 
 * frequently or for the purpose of separating out and organizing logic from 
 * the bot. Feel free to include any additional functions you find necessary.
 */

// Import contract ABIs (Application Binary Interface)
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');

/**
 * Fetch information about two tokens and their contracts.
 *
 * @param {string} _token0Address - Address of the first token.
 * @param {string} _token1Address - Address of the second token.
 * @param {ethers.providers.JsonRpcProvider} _provider - Ethereum provider.
 * @returns {Object} - An object containing information about the tokens and their contracts.
 */

async function getTokenAndContract(_token0Address, _token1Address, _provider) {
    // Create contract instances for both tokens
    const token0Contract = new ethers.Contract(_token0Address, IERC20.abi, _provider);
    const token1Contract = new ethers.Contract(_token1Address, IERC20.abi, _provider);

    // Fetch and structure token information
    const token0 = {
        address: _token0Address,
        decimals: 18,
        symbol: await token0Contract.symbol(),
        name: await token0Contract.name()
    }

    const token1 = {
        address: _token1Address,
        decimals: 18,
        symbol: await token1Contract.symbol(),
        name: await token1Contract.name()
    }

    return { token0Contract, token1Contract, token0, token1 };
}

/**
 * Get the address of a Uniswap V2 pair for two tokens.
 *
 * @param {ethers.Contract} _V2Factory - Uniswap V2 Factory contract instance.
 * @param {string} _token0 - Address of the first token.
 * @param {string} _token1 - Address of the second token.
 * @returns {string} - Address of the pair contract.
 */

async function getPairAddress(_V2Factory, _token0, _token1) {
    const pairAddress = await _V2Factory.getPair(_token0, _token1);
    return pairAddress;
}

/**
 * Get the contract instance for a Uniswap V2 pair.
 *
 * @param {ethers.Contract} _V2Factory - Uniswap V2 Factory contract instance.
 * @param {string} _token0 - Address of the first token.
 * @param {string} _token1 - Address of the second token.
 * @param {ethers.providers.JsonRpcProvider} _provider - Ethereum provider.
 * @returns {ethers.Contract} - Uniswap V2 pair contract instance.
 */

async function getPairContract(_V2Factory, _token0, _token1, _provider) {
    const pairAddress = await getPairAddress(_V2Factory, _token0, _token1);
    const pairContract = new ethers.Contract(pairAddress, IUniswapV2Pair.abi, _provider);
    return pairContract;
}

/**
 * Get the reserves of a Uniswap V2 pair.
 *
 * @param {ethers.Contract} _pairContract - Uniswap V2 pair contract instance.
 * @returns {Array} - An array containing reserves of the pair [reserve0, reserve1].
 */

async function getReserves(_pairContract) {
    const reserves = await _pairContract.getReserves();
    return [reserves.reserve0, reserves.reserve1];
}

/**
 * Calculate the price of one token in terms of the other token in a Uniswap pair.
 *
 * @param {ethers.Contract} _pairContract - Uniswap V2 pair contract instance.
 * @returns {Big} - The token price ratio.
 */

async function calculatePrice(_pairContract) {
    const [x, y] = await getReserves(_pairContract);
    return Big(x).div(Big(y));
}

/**
 * Calculate the percentage difference between two prices.
 *
 * @param {Big} _uPrice - The "current" price.
 * @param {Big} _sPrice - The "starting" price.
 * @returns {string} - The percentage difference as a string.
 */

async function calculateDifference(_uPrice, _sPrice) {
    return (((_uPrice - _sPrice) / _sPrice) * 100).toFixed(2);
}

/**
 * Simulate a token swap.
 *
 * @param {Big} _amount - The amount to swap.
 * @param {Array} _routerPath - An array of router path contracts.
 * @param {Object} _token0 - Information about the first token.
 * @param {Object} _token1 - Information about the second token.
 * @returns {Object} - Object containing the input and output amounts of the swap.
 */

async function simulate(_amount, _routerPath, _token0, _token1) {
    // Get amount of tokens in and out of the swap
    const trade1 = await _routerPath[0].getAmountsOut(_amount, [_token0.address, _token1.address]);
    const trade2 = await _routerPath[1].getAmountsOut(trade1[1], [_token1.address, _token0.address]);

    // Format amounts as readable strings
    const amountIn = ethers.formatUnits(trade1[0], 'ether');
    const amountOut = ethers.formatUnits(trade2[1], 'ether');

    return { amountIn, amountOut };
}

// Export the functions for use in other modules
module.exports = {
    getTokenAndContract,
    getPairAddress,
    getPairContract,
    getReserves,
    calculatePrice,
    calculateDifference,
    simulate
}

// ASHDLADXZCZC
// 2012-07-11T21:47:33 – iOERqyiFP13FOXNCLHDs
// 2012-07-19T15:19:58 – KNKzStlw58FfBg6dkfCA
// 2012-07-22T03:21:27 – 0j9SHPBe4mE5WSZtWAMd
// 2012-07-22T12:27:04 – V4nlscKWYEgzK8trCgCt
// 2012-07-22T13:23:40 – l7lu2r0TsikpkNTi07qr
// 2012-07-24T23:42:02 – GfALQyRrgArYeVk1yY6U
// 2012-08-01T04:44:04 – b7gx5AXwdYBK9EcDOowx
// 2012-08-01T20:09:16 – 3tIuOyA8ap67Kdcmv0yY
// 2012-08-03T18:53:27 – 8WFMrfy8WGNge8VsyeXB
// 2012-08-03T23:31:24 – vWEitLudT4TWFonU6A8I
// 2012-08-05T01:50:10 – NWbit4lbH5rwrZs214ij
// 2012-08-05T06:28:04 – cdp9QELQ1xMO2bvbcFbd
// 2012-08-06T00:33:00 – la0DstBgjravMHVMrlOu
// 2012-08-12T06:51:57 – zjATiLP40rPk5q4LAbv9
// 2012-08-17T16:57:07 – uCtP5NuOKAvkSP4yogk0
// 2012-08-18T05:13:10 – OW8Hq8Wszi8RiWVAJ36E
// 2012-08-19T10:40:06 – 4W3rajcswxXtBl8SY6dm
// 2012-08-24T20:12:24 – a2Z8EgiuWgusJ6r4fCRI
// 2012-08-28T04:33:47 – Jo6axk7gklN1UWf0J4JA
// 2012-08-28T04:47:19 – DmncATLwLWpaihyavVdt
// 2012-08-28T17:01:23 – yaXpFvaMm0M3v254Uuhi
// 2012-08-29T14:35:59 – 8jsgU5YE8bMuib8bRsnn
// 2012-08-29T20:04:53 – Jkh8hTialXR1FGif8ozL
// 2012-09-04T11:25:49 – 2BwZTtAh7VbRcjh3JdNP
// 2012-09-09T12:48:22 – 84YtQJFTT6llVhnP4UxF
// 2012-09-11T15:39:18 – mq2j7HPfNHnqCNP6f0ce
// 2012-09-16T03:52:22 – DqSFaP0OkD9wS60btPZA
// 2012-09-17T02:26:24 – 9FCBMV5CceO7sdnJgRew
// 2012-09-17T06:57:13 – EG8cPZLF86W9juAAwxkL
// 2012-09-18T05:05:33 – NZ3ipABBiD078BYKps4T
// 2012-09-18T20:55:24 – IoxmuNH5FHHsWhbl0f1d
// 2012-09-19T03:59:11 – TbEqTp9IsJxNXSBuuHiT
// 2012-09-19T10:42:07 – h4fu6iKwqRuK1EgNJse5
// 2012-09-20T19:44:34 – FEBFFSn3UoxXR2DqUU3x
// 2012-09-22T07:19:48 – UNgSxIFN0SZ6ovFcz7MI
// 2012-09-22T15:25:15 – jOFUNuVltimbdzLwAkpJ
// 2012-09-25T05:32:23 – Hh86bm6yfpeDWAJTBYTZ
// 2012-09-28T18:07:58 – OvLUC5da5whBmB8Warvc
// 2012-10-04T00:47:55 – 7dsRcKWtIVZ4xgOOxQxA
// 2012-10-06T07:00:48 – CeXbGpFULhGJ6QYsvDIb
// 2012-10-06T08:52:32 – F3WEnA6FXjPt3LqLs9LA
// 2012-10-06T22:08:51 – evaDfFDz3KkQtNmry8eF
// 2012-10-07T02:23:31 – qIzfSq40QlAInjQN9c99
// 2012-10-08T23:18:10 – wDwKpYuXAmHskgSicu6s
// 2012-10-09T06:23:11 – tRoSS1PuNprECUC4ulGF
// 2012-10-11T11:03:11 – 6TKsP5vclxXq3cTTr3aH
// 2012-10-12T12:57:46 – DUoArEhqSMoQhMc9NjMr
// 2012-10-17T11:54:37 – Y9q0LV2GYWiMCRmR2km1
// 2012-10-18T10:44:31 – e1Cu2lOf1vHFsD7VPbNI
// 2012-10-28T05:01:51 – EmOAsqn92X3jMEvvkw7y
// 2012-10-29T07:59:40 – 98cjuLrzEZK4vpjKme8r
// 2012-11-02T00:54:21 – Oz1UKjBX3GpnVNK1m5bn
// 2012-11-02T01:50:09 – cdjOi0GM1SlkT5tU488S
// 2012-11-06T10:30:16 – wc2hgqBcRrDZL1E02zWk
// 2012-11-07T13:45:11 – DrDlkJCmg6DM8QZSpHcy
// 2012-11-07T15:33:49 – HaQvQbAv0F0XyyKWJJW5
// 2012-11-11T14:13:54 – 1NIKFy6BUkD6B4luXW40
// 2012-11-13T08:09:43 – n8fy7ofqhUG0qSOic08a
// 2012-11-16T10:33:28 – d9wuiBEL6KUJJaLvFKbU
// 2012-11-16T18:05:14 – 4fZqIbh3pDuOs80QvCod
// 2012-11-17T05:13:34 – 8T3ubyL19efawe1vFuy9
// 2012-11-18T16:32:09 – wR6eVJGdhsEVm1Y1g40J
// 2012-11-23T01:21:53 – 5ZWJH1VgkgNkGshNAHvx
// 2012-11-25T10:32:00 – RJWxKU043hB6MqFCVKSw
// 2012-11-27T23:02:29 – NqjQFRcgjYeB0c6vbXeo
// 2012-12-02T03:35:31 – lCk7xnHsHldPzzYCbZe4
// 2012-12-03T08:21:59 – bVnCTHlFrTLsOgTQ2x0U
// 2012-12-04T19:10:34 – 0W8rh6ulpgM2NHTgZTDk
// 2012-12-05T17:25:19 – 8SCUKDuHshVbJj1KfKhS
// 2012-12-12T15:04:06 – HTaez5mnUhTzaDoBSltu
// 2012-12-16T05:12:24 – kSyOHxGOuATP4qndgchl
// 2012-12-19T07:44:56 – 2IvpzhWPa4yYjSYFjcp4
// 2012-12-23T12:22:29 – yZLpauMyuCoGmjj66F85
// 2012-12-24T12:52:07 – arH0MBcVn4tLOXmH3meZ
// 2012-12-26T08:09:44 – fggzu92Yu0VhXwGlmLS7
// 2012-12-28T13:27:21 – GIRoYG5zdetrLMnXsl6t
// 2012-12-30T12:12:53 – PZzyPzI6wJyL22yts3Jd
// 2012-12-31T03:55:49 – BMpP5K4PVoiWzsV8TInO
// 2013-01-01T12:26:47 – 36CA3GsKKJVnwBdxkhHN
// 2013-01-01T13:55:14 – 9w8Aj3PrXj2hWFhH120x
// 2013-01-04T00:39:25 – hWn8bdhA8LTmdiHTUmO2
// 2013-01-04T08:24:38 – kaVNZd8iLIvLDfM3NFiK
// 2013-01-06T11:47:37 – 9E7D8wPkaFwDaxAyfv5U
// 2013-01-09T03:30:16 – txJ1rbCJuS3tgxPUE7eS
// 2013-01-11T22:09:44 – KGu15SilMKth11TG5e0B
// 2013-01-15T17:31:45 – V8rWb4eG7xTOihzcucCF
// 2013-01-18T16:26:15 – BaAvZmTlSjUU9DOY03iL
// 2013-01-20T04:37:21 – dz5LKutg1j2KJNw0vvZq
// 2013-01-20T12:50:12 – hzYPsxAoW5URIubTj8Q2
// 2013-01-21T10:39:43 – UPb1g0FV3zUNfw5S2nIx
// 2013-01-24T23:33:04 – v7hk3lcukAfohysUtVQD
// 2013-01-25T04:28:37 – mQqYGiN48fjLisgryYAc
// 2013-01-25T12:08:25 – SvPHWe8oE6d9P4v68O1J
// 2013-01-27T07:14:44 – bAZPoaQJhyYQIvkKVgMv
// 2013-01-29T05:20:04 – k4bFjCQeIVd3gpeMYBF1
// 2013-01-30T07:53:06 – i4pVIBTq0UpZ92jWUHGn
// 2013-02-02T00:46:26 – inCI8tgA68Ff0iShXfNd
// 2013-02-05T09:20:27 – 7wlyJOEpl873opHmzb35
// 2013-02-10T23:26:22 – s8g0eGxM17PrInxKX56p
// 2013-02-14T19:10:49 – 6L6DlOz44C0qBWmH71sa
// 2013-02-15T16:02:46 – rwDaB6rWB0uAImybucy2
// 2013-02-17T16:09:48 – 69uh7xXn1vpERMxfsvmY
// 2013-02-22T16:31:31 – ON7ZcXXs0F2nl06HP5wN
// 2013-02-25T12:40:08 – tLAvILCLrxK5Q5m5XLk6
// 2013-02-26T01:59:12 – 9eqN5tt4jIZKTJYK2svc
// 2013-02-27T04:17:45 – 7YJO7iyvlmO4nCRq6jrE
// 2013-03-08T16:54:43 – QWqW5g3phCNzgc4bb9mK
// 2013-03-09T20:15:49 – 5v8T9g2qEO5d4s9wzQKH
// 2013-03-12T00:30:27 – R1m5zYcBEuuQRKTW3P2P
// 2013-03-14T14:59:21 – rLkSEdlpOJZHQowVDiiH
// 2013-03-14T23:35:34 – tBeYiR1QxL2jCbnd6KmP
// 2013-03-18T08:02:20 – vFnepSJR5sHfo97RhypB
// 2013-03-19T21:10:29 – GAxxkTQBSufV31A7ATa1
// 2013-03-21T16:26:25 – qBeYDzTjsnBk3gvUvMGP
// 2013-03-22T23:44:56 – GyMPu9reHZMXwvXaJNNp
// 2013-03-23T13:54:00 – z1SxO3nL0uTV6iIuOCUU
// 2013-03-27T07:28:40 – xKpluCZjVIKb56XRcuzV
// 2013-04-03T23:43:24 – EemjgrQ3edxv2KGoSv3l
// 2013-04-07T19:38:40 – 8Siy0dMbIiw0Ba39L7uG
// 2013-04-12T14:18:04 – lYFx3mqHtecffoOGne0z
// 2013-04-19T20:56:22 – TLfbEIFW8dkZnL7QvwTg
// 2013-04-22T22:00:04 – YrSf5wSgzUQmouh3QlG5
// 2013-04-26T13:57:48 – wP1C1WNL74qdN9e57ya9
// 2013-04-30T11:59:57 – P4h223l4q2syq3KJuGRE
// 2013-04-30T13:12:42 – tsWzZilrthGFfLnwe3OA
// 2013-05-08T12:05:01 – rEGKoVHErgGtcPlqUllj
// 2013-05-09T07:11:30 – Y758UqTxLq74TMjm4ZzA
// 2013-05-09T19:39:38 – aQ80oTre0i0S7BLfd5eq
// 2013-05-09T21:01:10 – nXrv198zD6mPu7Vm8QSY
// 2013-05-17T02:22:15 – mDgGPpXdzYwsCGK0IJM4
// 2013-05-18T16:52:56 – 9Q0gL3Sq58MqdwZnbjyy
// 2013-05-22T13:24:55 – lRhpKO1DC9JK3PW4PxzA
// 2013-05-23T08:17:53 – w8Udsiabj91yQBFj5usw
// 2013-05-24T07:04:12 – VWdXs2TFPjDTJcAaAfH1
// 2013-05-25T05:57:33 – Tc7ooWYgWoTGikGTGFnv
// 2013-05-26T20:31:35 – Vo5DaLdpJOgGfJR43aIh
// 2013-05-31T03:56:08 – NBm2kEASTmcaYXVnQclm
// 2013-06-01T00:40:05 – 1vfTuSr5fAioxpNIOhx9
// 2013-06-06T00:18:56 – pGb2mBu9GwMFlk7xTgnc
// 2013-06-10T05:17:50 – F7AqihqaF9dHkXMvHiza
// 2013-06-11T10:13:21 – xarMRcuPcKRNNWGEWUjF
// 2013-06-12T16:48:28 – Ruz0rcuPEAziQliGkuhE
// 2013-06-17T05:42:00 – z7qb8jme8MrampiCUAGA
// 2013-06-17T18:39:49 – OpxxxQ7Ds7kuOQMNOzlP
// 2013-06-19T03:48:31 – F5J1nxDCqoacMMi5WKFz
// 2013-06-21T17:44:14 – Y2LRElHVfrWpqJSG7K0C
// 2013-07-06T00:11:40 – p3Vveb2vKxLjGQ77nsOW
// 2013-07-10T00:33:45 – E4kjiQclSPXSeNA2MOMg
// 2013-07-16T16:00:49 – 6kT0wahdnqZiimV9dTbA
// 2013-07-18T07:36:54 – ZbGXviEdRJjjIJhR30wT
// 2013-07-19T04:33:48 – QNRCxs29hdL0fm8zez6M
// 2013-07-23T17:55:20 – N1Bph4xO1PEwgtVVn8qa
// 2013-07-30T12:07:47 – 528kH8V5kZsoTcKi9b5a
// 2013-08-01T17:39:06 – BitXA2sTOdfUsKUVXLSv
// 2013-08-05T17:54:54 – 2YjVWfvyMcD0k1e4ojai
// 2013-08-07T07:02:06 – Nh61bVi1uiQAOsbTu6fZ
// 2013-08-09T09:59:37 – W4ZTdeCtyq4l4ZxjdP6T
// 2013-08-09T11:48:06 – CfV2QmmVFc173hXtPKZ8
// 2013-08-13T14:14:03 – jODVFqtnFtGukUYTyzaB
// 2013-08-15T19:40:29 – wuyPXFuizjaYqBY5GjOv
// 2013-08-17T01:03:30 – YwlCDPyZIbjxPJUKkuhc
// 2013-08-17T02:36:22 – 3nkiEZETMR0KVDCSUnDo
// 2013-08-17T14:44:02 – NwapV22IxNJO27XAMIVN
// 2013-08-23T22:07:24 – DnjsaBBCBT4qczNjMZEW
// 2013-08-23T23:53:03 – mwPZ6Oh4Gsj8n5XqGPmO
// 2013-08-24T02:22:01 – v0xxIyP1ElO8Iq1dSMfE
// 2013-08-24T17:16:06 – DMJQuITmzZtipPHgboz3
// 2013-08-30T04:34:24 – 8j9WBW5Q1Nzbjcef0hI5
// 2013-09-01T02:56:41 – 4d06ibMINF3hT31BGJwP
// 2013-09-01T23:14:33 – gO4lzJjzgSCxecihABt0
// 2013-09-02T15:54:41 – 2WiHnUVvVB4ud6EvhXlZ
// 2013-09-06T15:43:07 – Qb52PuV1SE2hVo4XsQbn
// 2013-09-12T16:58:46 – IYaDBeeVZdlQMXDhVdLB
// 2013-09-14T02:25:46 – 8KLG4mSYhht9ds05SSwX
// 2013-09-14T12:11:03 – ChNuf4gOI6acLsaLbkyy
// 2013-09-15T22:20:54 – zAmkX0BBqAxdqTvhokE0
// 2013-09-16T08:50:52 – 1vRAHzEzM4UjsUy9Gnkl
// 2013-09-20T14:19:04 – L1RMW57fVrEoyznAEFB1
// 2013-09-21T03:16:30 – PARsTCzzGBUUcvHW6EgG
// 2013-10-02T05:29:50 – OsfERvOfhttV65k3hbj8
// 2013-10-10T01:32:17 – ISFouwE4DxeXxD7PwFOM
// 2013-10-10T03:07:13 – 6vckBvtGjeeTEZs4TgWU
// 2013-10-12T03:01:04 – hU2b4wGITmzHcyoY0J8f
// 2013-10-13T16:46:52 – Unr5f9EBnvGZcA7ElcRT
// 2013-10-18T00:30:45 – w2Ouzn4HVWbCKJ3MdDOk
// 2013-10-18T15:36:06 – nmLJqxC4tgOG9sOJsabS
// 2013-10-19T05:33:30 – 81buaXUb5FCTbZ2zFFat
// 2013-10-20T14:07:48 – lkZz0DJiAhWAXjKDiGZm
// 2013-10-20T16:29:58 – PawZgcPKYWDF7bbfArfX
// 2013-10-29T08:35:37 – QebTeLH4cvjQVqbkNiC5
// 2013-10-29T23:34:19 – T9U9CC4owaivTYQjNEPm
// 2013-10-31T13:59:48 – LraMIsWEHDQ3vFb92PPv
// 2013-10-31T21:17:04 – zP6rCKKBKCglqr1Eb8EH
// 2013-11-02T21:51:55 – MoZzZKghByWi8gnDJQvI
// 2013-11-03T01:13:03 – CTaik4NkSEwkZzpGHxQk
// 2013-11-05T10:41:59 – KZA14Vs4n4B1teD8CPHm
// 2013-11-11T01:27:32 – 6fPQZVQvOdo6XnLL32Kx
// 2013-11-12T12:06:54 – lb3LVbhLJodIKvLt6bG7
// 2013-11-14T11:33:16 – YaXYpX7jH2ta5ZyA5wAi
// 2013-11-14T23:42:21 – OliooOdCZ4l6BEdaf1tB
// 2013-11-19T03:23:14 – 9OSOYrGFO9CdlJfOaV9c
// 2013-11-21T13:45:48 – 15c3RR6hVkFlED3tbOFP
// 2013-11-23T07:21:12 – HkBpSyRRgxUiO4nzwths
// 2013-11-23T21:46:27 – azLW7q6caOH1xhHBhl3u
// 2013-11-24T00:35:42 – UPdlp7kKiUO5VoW8PSfg
// 2013-11-26T05:57:18 – 9ZkiLsrYMzULvxKY6EbI
// 2013-11-29T17:06:00 – uzXPrVjT4705O9o2vwtw
// 2013-11-29T19:32:12 – ZEdB1QjcD9GsukLF8Z6h
// 2013-12-04T12:59:39 – NHmXife8cwZGaAx6lW6Y
// 2013-12-06T15:54:38 – 6ysEQd4Q5ti7OqBYWnAL
// 2013-12-10T23:55:47 – GKnEju05heVpyOcA45Ra
// 2013-12-13T02:06:11 – aiHW0JdYSwPAC7lBvLU8
// 2013-12-13T11:30:05 – Lwxc7RZGYwF6c6nNFF2Q
// 2013-12-14T10:20:03 – JIyb3OtvfDPRy9eR2p0r
// 2013-12-17T12:09:30 – 7FBZszZFKtoFY3sxhO5o
// 2013-12-18T15:21:00 – XvDQ4iJnsTN44d7lNzjr
// 2013-12-20T00:46:40 – a9ZgkNKJKAA4NRxwdgo1
// 2013-12-22T21:35:58 – goc9ht4SPjKK39o1TiDP
// 2013-12-22T21:48:19 – nKPFanLomwTPnmPWhEZR
// 2013-12-23T06:31:17 – PeARGRp5WLVmBP1jCjZC
// 2013-12-26T21:33:25 – ctFrlU2qMMH9ut3SfynS
// 2013-12-28T14:19:47 – DlBIcGtJ3Unc9DT9fOfs
// 2013-12-30T02:33:37 – D8YJ11iTCOcNx1JZ90mT
// 2014-01-01T15:01:29 – tSqnqjbFl0q3Tjkhx08E
// 2014-01-07T20:01:02 – yQC07rMok1j1tLJPohwK
// 2014-01-09T22:51:18 – hQdRcYCpJJHKqDEmlEhC
// 2014-01-10T21:42:09 – wcEg5rzUToE8aIlXe0tT
// 2014-01-11T10:29:25 – rmGejrHTzWTwNPWBdL50
// 2014-01-11T11:11:59 – udR7VVNLxs4TRyRazhAF
// 2014-01-11T13:18:12 – ZVaTAFLAz005cOTEG4tp
// 2014-01-12T04:40:23 – xvJCTuh9vDN6LYGWQVf9
// 2014-01-13T12:56:52 – Oh0nC83ZB2ejC4JlzJvs
// 2014-01-15T07:18:51 – b4Etq5kRtD9emwBi5RaN
// 2014-01-16T04:45:02 – QoEvmqXyY9n0y37SaQX1
// 2014-01-17T17:27:10 – IYhBIqjRt8R1p0xpU80t
// 2014-01-19T15:00:00 – 5wyIHkOk3yMhg8gldm6C
// 2014-01-22T17:43:28 – 1GsKoR0tqn2hsgc6zsAT
// 2014-01-23T12:44:52 – AmOr4rqZGhKjGR1tLghn
// 2014-01-23T13:15:08 – avZB03duQlGNq3fp8nfu
// 2014-01-26T01:13:03 – 0OcH5aUp8IpRZIAvDRTA
// 2014-01-26T09:55:36 – ZgindConPUXi2mXyAAFA
// 2014-01-30T23:37:11 – Q7qntoynXPv481auTPmE
// 2014-02-01T13:44:48 – 7yt7VlOkbRzH6koYkASL
// 2014-02-02T06:05:11 – twWYr6RtV8gGc1NfWGPc
// 2014-02-02T11:55:53 – HbexWx6U0a3uJfCiwd4E
// 2014-02-03T07:52:29 – lpqq5cIrnr5qxz69Vltg
// 2014-02-04T05:25:47 – 2bLgqUDo4YqOX8U9mXKp
// 2014-02-05T18:06:15 – 2FW9V9iFejaK4jlrbRnI
// 2014-02-06T23:25:44 – xMcxlUgVWpLZlFGfZRTP
// 2014-02-08T16:26:45 – vJpa3Bz7ula124rXysUw
// 2014-02-11T20:29:17 – tuCMvpw4JEY3SBGr2HQu
// 2014-02-16T06:02:06 – IsE58i6YDSoPXFnYHxq4
// 2014-02-19T09:12:33 – xVdk7vZIc8yBNFtXcmYn
// 2014-03-01T02:27:24 – 20YzOwxOsazujUOqjla5
// 2014-03-07T07:57:35 – Q8NGdrHXE0amusxEBtfM
// 2014-03-07T11:36:14 – TcELJexkHAA6evm5f5Kk
// 2014-03-08T15:55:04 – LiCittEkafVzs1ceNA40
// 2014-03-13T06:18:50 – xNOQJ9v6QcZXnCl4mhCK
// 2014-03-16T23:51:22 – XZuBd5zXWJGSDAey1DgS
// 2014-03-19T19:32:02 – 0mobi9TwLfDeDbkENNyA
// 2014-03-22T06:54:55 – dkvZGJ3AxDNWzqcODiuH
// 2014-03-24T04:59:09 – dx9xS682nCfx40RZg7yv
// 2014-03-25T13:12:06 – hN0Cf5DhUe6xHvKbgtDy
// 2014-04-01T15:42:48 – 9xf7fyGqiNWlgF9F9hdw
// 2014-04-02T14:12:40 – GOKwy5BQPBIaYuQ5OEIa
// 2014-04-07T22:41:31 – 2PeIb0IBVhh5ZE5x3bSb
// 2014-04-08T12:31:40 – UnTFu55N1Gxt91DsXjWS
// 2014-04-13T05:17:46 – Q3uM9ULBcvxXIpsyeSgX
// 2014-04-14T12:59:21 – cdB4MMZFqcNKWgJ8m08P
// 2014-04-16T13:40:28 – bwhPiLbG8mqnGfuLmJYb
// 2014-04-19T21:42:14 – CDS1zO6n2I60pZSNVlQd
// 2014-04-24T04:44:53 – KCpXmlW4SF7nvkd6dDfi
// 2014-04-30T20:14:43 – lZdzEyxjVfum6AwVaJ2T
// 2014-05-01T16:03:29 – xwkx3c7YchumfKcL7iv1
// 2014-05-05T13:29:46 – 5WJsrRpa49ICrLwrcd4E
// 2014-05-10T08:35:14 – KPyWJwCBtTZXhc6dcNme
// 2014-05-11T20:46:29 – UhBKIfFfszuUMg12PNdX
// 2014-05-14T07:14:35 – Tj7tS6sbJBOQpG4r8JHK
// 2014-05-15T12:51:30 – eYX6EoHa7m2kKP4fzbTh
// 2014-05-16T06:42:47 – VBTxZHC8EHS3atyJ34RA
// 2014-05-17T04:39:10 – rTSZtzCtn3aisJf037hK
// 2014-05-21T10:49:23 – VkE3B9fLR1KwFmRG0RKL
// 2014-05-22T02:36:46 – v7L8O7XA4BafwaXDrbS5
// 2014-05-25T15:43:17 – O7TTMbmqIlHdmygHhVnJ
// 2014-05-25T22:27:37 – CsxT5R2HStW733ABFhcS
// 2014-05-28T04:34:19 – TZAAJSKURCR1IHggyBcA
// 2014-05-29T03:35:16 – gBkDLMwe4QyypAIWOlJn
// 2014-05-29T05:05:46 – Qoi3OCpbPTfcXA8D4kGd
// 2014-05-30T07:12:05 – otnHmvRcwKYLnBuHSa6M
// 2014-06-08T13:29:31 – D1qTjAt4nHLyFELnRJoA
// 2014-06-12T02:27:51 – iL74xW6FXPPisS3k7Fnf
// 2014-06-14T20:15:54 – CDaalmFQPN211GBSfOda
// 2014-06-16T05:10:14 – yN4rt7oQassFhnwabJWT
// 2014-06-18T00:20:12 – 89mdFmVEKkssl82IdqAh
// 2014-06-18T02:30:39 – vbGViOakBh0zVdPqWI7h
// 2014-06-19T18:39:42 – 4z7eLc7HnqKzyzMyH6BL
// 2014-06-20T00:50:00 – hwodFWFbuQbpjJQHwUkn
// 2014-06-20T16:36:20 – lTH8nW07GlMWXQmKWBwy
// 2014-06-21T10:29:58 – SdkgunkjyjuvHfOrGBKV
// 2014-06-27T05:36:21 – wg3P1QcDQ4Xr4TomGDoh
// 2014-07-05T00:38:24 – FZzd9SxFVvKwU5OLkca0
// 2014-07-05T06:32:17 – pSeakVJy9vUZ3hBjNk5p
// 2014-07-08T16:58:44 – czqzfWlhUTR7fQrZTRMg
// 2014-07-10T13:42:05 – RHDBDS9LyKCcjyeN4R9D
// 2014-07-10T18:45:18 – QtN1HE5A1Vecfqfw1XTo
// 2014-07-12T16:58:43 – 2Z4NuCpXoBQREJVLBdbw
// 2014-07-16T02:00:13 – pPMqmrtA6zfwkPGby9OA
// 2014-07-18T05:40:38 – gL4UIrsHWWSX1scRcRM4
// 2014-07-19T21:25:36 – NI7OMALbEiLxFs22wKBW
// 2014-07-20T02:06:51 – N39c2b4q2eJhFsuTDaGE
// 2014-07-20T06:05:13 – XkM6VMaNCNFr1WTNnXb6
// 2014-07-21T05:54:12 – v9UOhrGPqnqmUOKf0RSl
// 2014-07-22T02:51:46 – YoLCtjujnag6IFeZLSi8
// 2014-07-23T04:53:19 – ptEPAm63YAxRxe2PWgL0
// 2014-07-23T14:31:08 – cDxUwiNk4AzedDx5wQMW
// 2014-07-25T08:42:29 – 0H7OvxndUhZOdTZYIEKI
// 2014-07-27T16:54:45 – yiSi74caMhfKA5URespb
// 2014-07-28T22:07:55 – AEuGLFnem9aK0e44VnBe
// 2014-07-31T18:14:27 – 1gvNfbSaQb7AWwV7yTqZ
// 2014-08-02T07:06:10 – QyYdENu0VdDIQywaosQl
// 2014-08-04T18:23:45 – xIOFHvHBDH6qk0Tpvxsz
// 2014-08-06T16:01:04 – qRzMruTe0KbygcuzIsSv
// 2014-08-10T19:31:03 – FNYSHe7JLsU5QRYohwuI
// 2014-08-18T08:54:54 – Yc4Q0Z10dQBNY4wvCW3V
// 2014-08-20T20:55:38 – zqEwtKREBWoyHx5uXam7
// 2014-08-22T02:54:28 – zy3gOhXLbY5Hw7H55kLQ
// 2014-08-24T19:40:15 – iaAQeh1gg8tavkKDjltT
// 2014-08-27T08:20:44 – cJ2mBlDBUMmnCGKDUcfx
// 2014-08-27T17:33:23 – fC8lw0BCYYzCuxam3GHV
// 2014-08-28T03:47:55 – Mu2lhxdTPHUDTuFJ72GH
// 2014-08-28T13:15:30 – KLmpj84SqJTHssYnlb0k
// 2014-08-30T15:43:46 – BIR9SqNV6wOSX3PVr71w
// 2014-08-30T21:02:25 – R1ybJCBZTPqmN6QMBsfK
// 2014-09-02T16:14:43 – 5dHq6SaAd8WxnchTOFNQ
// 2014-09-04T03:44:33 – U2608E5gjAb5Yo8rx7vH
// 2014-09-05T02:11:59 – 433DQqOlEHj3G2oBwsZw
// 2014-09-06T16:50:10 – oCnalBEo9tPqtdsydIAa
// 2014-09-14T02:25:48 – JzGR5s3YGsgPrjC4nF2C
// 2014-09-14T19:48:39 – 7vnyi8NUpvJyYZ1YSIlz
// 2014-09-17T16:25:43 – O1k56ugugy5cVAEKJ58P
// 2014-09-25T08:22:30 – DowB2ndj0FVPu2Trp2Se
// 2014-09-28T00:08:21 – kc1y7t1UwSEae6tdbnVj
// 2014-10-01T06:52:50 – UaEdZjpNb8YarDDmZfUE
// 2014-10-04T22:54:35 – 8PeioSnqkLr8Si2EhxRf
// 2014-10-07T22:53:46 – RAOBqPhmawjQ643otjIx
// 2014-10-08T11:33:40 – HwHtUBR7WaEk31ZShIDM
// 2014-10-10T07:20:10 – UpJWBsttWhC7dj2iRkZ2
// 2014-10-10T11:37:32 – n7eWijFeOSriawSmws3c
// 2014-10-10T20:03:51 – 7NZDr9AElFq6hKvSEzMR
// 2014-10-11T17:14:08 – 3WH8TncC0DlJC29fuTW9
// 2014-10-12T07:15:34 – D2i3ZUd1ktWzujoo5QD0
// 2014-10-14T05:49:28 – G5Z1uFcVzHbsUJerkuRe
// 2014-10-15T18:32:54 – dZnFl3d518jXZmSPTGfs
// 2014-10-18T13:25:27 – HzE9sEi2QoI0Y45riLwW
// 2014-10-21T19:47:13 – P09s54tYT8picx6IANC1
// 2014-10-26T09:25:56 – ixLQEbJ8mFVp6hvTm2xi
// 2014-10-31T15:50:13 – smxvPU379ccgf2yKIduw
// 2014-10-31T23:01:01 – O82gxdHMcQxpwbJCyhmR
// 2014-11-02T00:22:15 – 5BKKhzGujXaBaCweP6zo
// 2014-11-04T14:18:35 – JHiIe5k1kwcUGXTqSQtY
// 2014-11-05T14:45:07 – kWdlB0NOIPX8O1zTYUnC
// 2014-11-08T19:51:17 – 0G4kSHtVuizOuoqfZ0Wk
// 2014-11-11T02:06:25 – uURET4kHS9r6Lz7K18Vw
// 2014-11-12T02:37:00 – 7V8uRKmmXcYhjiWsJVLC
// 2014-11-13T11:40:16 – fuTRLMFsAkcVlJYQLdlg
// 2014-11-14T02:41:43 – eftzZIBAZ18EY1vycjsG
// 2014-11-18T02:49:45 – CBKh2qcKvZYqeEKx9F08
// 2014-11-20T22:34:06 – h6Mcjg2GfyANGbeV2gLO
// 2014-11-21T15:43:09 – YLl6RCvAbNGTaRdvYbMW
// 2014-11-23T17:44:52 – 0jPwUmiF19Yx1JjjQV6y
// 2014-11-25T09:55:20 – 4kjlIpiGN5rQLnIbipaQ
// 2014-11-26T16:35:37 – OSS7HNpsuguwjGJwrI5u
// 2014-11-30T01:12:41 – boo0K2eSOj8zuQmQN3e9
// 2014-12-01T07:31:04 – mZcccEFRBSwhawzQHyZJ
// 2014-12-03T15:17:49 – LCNpgBgQKgvhQYNFTdlq
// 2014-12-03T22:27:56 – 2FeMyKFWGCMICaNCT1Ef
// 2014-12-04T05:42:18 – u0zunwZmT35rESMShaPz
// 2014-12-07T00:25:41 – jM3ZNDDYYQbL8Z6uUdQC
// 2014-12-07T11:27:45 – c4dHGoKXQ4xxb5ivGhYO
// 2014-12-09T07:47:58 – YVajZVUCngJZ8BsiflRt
// 2014-12-12T03:19:53 – XulbGsPug4ZLbaWRS3ES
// 2014-12-13T22:49:07 – NRtWCP8p10CjO7E5d8QB
// 2014-12-18T16:10:10 – F2IGuQOFNTLhpf9oxeFY
// 2014-12-19T02:02:39 – KZlMd88QYGqs3o68nGXW
// 2014-12-19T05:05:36 – zupwd3dBDt8xzFnE1BBL
// 2014-12-23T18:28:52 – 3hCkQVkPSQzFJwm0B1Jg
// 2014-12-25T19:58:16 – EZMfXQkiFgmYKLRvWICY
// 2014-12-29T16:08:32 – lRfPckNfOxWlbQkVpzYf
// 2014-12-30T13:53:27 – 1TsYyJFRppK6I2icUQj0
// 2015-01-02T08:37:41 – 1Z5wxALnK0sEwkVzDyqX
// 2015-01-03T00:37:34 – KdJDZl2KwrO7ZCRioV9g
// 2015-01-06T20:26:30 – oRTR2uTeJHPzxoZJ8OQC
// 2015-01-08T15:32:15 – m236J6oa87qNC8steCRB
// 2015-01-11T12:18:23 – DSPUQ0KoYcc16THFdA0g
// 2015-01-20T21:14:48 – KmI5dRLiQ9x1TViAtTi0
// 2015-01-24T04:43:36 – P4ivxms51p5wt5ttxm5S
// 2015-01-24T18:04:18 – YI24ASbTm5ABeKaK4FlB
// 2015-01-26T19:20:08 – 6e2sfWavHWleN28o7vxp
// 2015-01-30T16:24:55 – Jpy8ihBD62QcfAnU8dlv
// 2015-01-31T21:45:19 – uZlv5B9yag9s7zRmLtie
// 2015-02-03T07:12:20 – JCsJ2u04WiVeJN3RjpmF
// 2015-02-03T21:08:40 – 2gGhSH5YbpZm5iAxAYpd
// 2015-02-08T08:57:27 – IZPVuucY4vdtZamftOZx
// 2015-02-08T12:21:26 – ViwlwqNXCunqZ2LwJn9q
// 2015-02-10T09:04:23 – N2qdr77mG50SdhEoV1Xd
// 2015-02-14T10:57:49 – laHCxo2aATeuigd39v4p
// 2015-02-19T01:12:23 – PR3VgcPQADQivViBydMg
// 2015-02-20T09:20:08 – rQgniYvurAc6SovfGU0i
// 2015-02-21T11:37:10 – SZjgglszKpkdWdMqWZ4H
// 2015-02-23T15:31:12 – gF9HoNuOWEsJ2tLj7tQa
// 2015-02-25T15:38:15 – kV2kMMSmuxY32FseBwzn
// 2015-02-27T18:32:20 – fjGQi5QYV2EkN5EqjgaZ
// 2015-03-07T19:14:17 – KJUfSl4cIDK2aJwYtB5f
// 2015-03-10T15:39:17 – Sk2oUiKFqvO5UB6D6XJG
// 2015-03-10T16:55:24 – g67eW2SHkqFbWpqKxLMI
// 2015-03-12T13:53:50 – EwVjlxLz5zcfZEgZxICd
// 2015-03-18T23:10:48 – O4rIwQFG1CMzsZR32rf6
// 2015-03-21T03:49:42 – kpGTfnlpsI7Js5bNEgdr
// 2015-03-26T15:52:46 – VFfMDQMFZZFJP6Rb0Tkb
// 2015-04-01T19:41:39 – dAZEBvyAhzjwt3R7fzaR
// 2015-04-07T01:07:33 – Rk9N7BC3SHh2GQiBDwX8
// 2015-04-08T05:58:23 – Cn0YUgN00tj7GH18XVgV
// 2015-04-12T07:57:54 – MoL7ECNyjkaDHc2zPQtw
// 2015-04-12T12:31:29 – xxxN26HE4hhPwhgVS13R
// 2015-04-19T04:37:44 – ju7OLXf2z6cKEYY0GgPl
// 2015-04-20T02:39:51 – GeFF6fnwOWCHXHI85TqE
// 2015-04-22T08:35:38 – H7nkLeRNoqXvIuejgJra
// 2015-04-23T23:47:04 – ILoqB2rNmzOHel3hxio8
// 2015-04-24T00:47:10 – Ska7rtjxNZSywremoTK1
// 2015-04-29T22:51:39 – 3InZBkiCLOZY07uzABG3
// 2015-05-01T14:56:02 – 2nvhTz5qpS8VF30YA6Ur
// 2015-05-07T04:12:01 – tqRG8wsqXMIJeil8NtVE
// 2015-05-07T05:26:49 – pOmNAyVF8WpoQwN2wztL
// 2015-05-07T14:15:07 – AQo9qOWmj98BKhcZuCBQ
// 2015-05-08T18:09:23 – PnWDdXBvrJbFGNUlqHA1
// 2015-05-09T04:55:15 – cxxOMt2iKJd1iAtQFLe1
// 2015-05-10T12:45:04 – HqCJCWaCtU1cTvdPaa3K
// 2015-05-10T14:18:19 – hnoNFWOv0GCdMb98GW0s
// 2015-05-16T18:14:43 – w4Y0JVtCCSbv8EsYG46Z
// 2015-05-18T03:48:33 – uI92sCwgd0aDsURf8ciU
// 2015-06-02T05:53:41 – V0dh3qmSTNPWTo00ZQFX
// 2015-06-02T19:03:31 – CYTzCnMScvH0UvbRMhl9
// 2015-06-05T02:04:26 – Qym3OYvsSilI7qhwETBF
// 2015-06-10T22:12:54 – K8putJ3IEWoSoeXcxgRj
// 2015-06-18T00:02:05 – v02r1KcgQ0jXhRlZjDDN
// 2015-06-20T15:14:06 – 4dT1QydBTlRW3I9HiZyf
// 2015-06-23T04:51:23 – J2E9erCNZwvIT0MX2lLB
// 2015-06-23T12:16:18 – cjk09RACN9lu7VbUFX5j
// 2015-06-27T05:04:52 – Ixh6c1yGYFZBo3ObJKMn
// 2015-06-29T02:44:24 – 6Jt3WgAQ1Cmm8geAqbaw
// 2015-07-02T10:28:26 – Qm7UWt03cU0bqonSm6Ls
// 2015-07-03T19:23:10 – bZTikhWbcjIeOKfkan3v
// 2015-07-08T17:30:23 – wvwIH562AzS0EfSfR9Ny
// 2015-07-10T08:27:08 – uQ5R0eeHZ9M1KpnU43sz
// 2015-07-13T23:59:23 – 3xHqd07LRfQdm5l2k5gn
// 2015-07-14T08:28:48 – 6C2kLN5b1n46mNlaO8VZ
// 2015-07-15T04:43:41 – RV3MCZfDqupg3SkWahER
// 2015-07-23T05:11:44 – lPzfutsuIOTmtfZDYsk7
// 2015-07-24T00:44:38 – tthOp7Twk1s5vIOsqz0z
// 2015-07-24T00:58:09 – lPxmWVjQbMFnSew2SCOk
// 2015-07-24T05:36:05 – QuiMHvseMam2ABTkySFQ
// 2015-07-27T03:26:07 – zOejvKklAI72qjog4c3O
// 2015-07-27T13:19:00 – BAH4VifOHI4AWCq1alkR
// 2015-07-28T18:32:39 – CRCQYgIhqyul4VoSXp9k
// 2015-08-01T06:35:06 – 0nkCfXjfAlsCyRDSObaC
// 2015-08-04T02:22:58 – mYq55OHK8ZbixkeOdzdW
// 2015-08-05T01:21:13 – PPzTMT1Ociwe676J7mfA
// 2015-08-05T07:08:22 – 8usmA8nMi6o0aqsXsxLm
// 2015-08-05T23:20:55 – 8kLuVWpSrzg0rXDFO75j
// 2015-08-06T14:59:04 – j1ZAUUsWf0lFtjV5SQzp
// 2015-08-06T19:43:17 – 3NIWaE3rje2fi56d9jUi
// 2015-08-08T10:09:29 – PWkOylsktbg4iAw5ic5d
// 2015-08-08T19:10:18 – Q5AFVOxsQQZf2IU8ovrd
// 2015-08-09T09:05:51 – hbkNIEU1YsOtP3FB7lWj
// 2015-08-09T10:03:13 – mlFkFD4ZaaNnB5p4pIMu
// 2015-08-22T12:30:17 – zZKhjld0ULuSWUbKf3Qb
// 2015-08-22T21:51:45 – IroakSuHOyq2qbIs6st1
// 2015-08-23T10:00:07 – c5685z7PkA9wVmtUEl7V
// 2015-08-24T09:02:20 – Ql9WV9lvzMlBDUUdvSDj
// 2015-08-25T01:48:13 – eie0vZi6L5HJK4rN0rfs
// 2015-08-26T11:49:53 – vTI7oxy5eEkFcRhhP80P
// 2015-08-26T13:47:28 – 7MPObHrgs3MY2fsw0rjR
// 2015-09-07T11:11:03 – 4s6dw5ViZih2zCvL4ruJ
// 2015-09-09T01:32:45 – Ofp2AE2PLBZYvEQFrBUb
// 2015-09-13T15:01:50 – jerCUafkp64fa6nUNXU4
// 2015-09-14T10:37:28 – wQbcWIQmqvXF5slrimGS
// 2015-09-16T00:34:34 – 2Dap7HEItmDucTBEZ21g
// 2015-09-19T16:36:14 – xNtE52NnE6i5EIbHE2W7
// 2015-09-21T19:12:14 – ijxA78bJQ44Yciv39Hhv
// 2015-09-24T18:40:27 – 0euWbhQbHpVymNCJ7IT8
// 2015-09-27T10:22:55 – xIAc5rR0vfo6aloapQVe
// 2015-09-29T18:15:41 – BfHLTgHyA9THs4uNoFhX
// 2015-10-04T17:23:35 – CvzBdV4DQLdNsFRGFOqc
// 2015-10-06T17:29:13 – kill1ElHetcOh3ejJVsY
// 2015-10-07T00:11:38 – mEOK5nLO7rGUvvzn6WaV
// 2015-10-09T07:37:59 – d3DHorBCF6YAzlkba99z
// 2015-10-10T16:00:38 – lilwlv6QHlUdmyombEPd
// 2015-10-16T14:11:37 – JnUD9hIN6FIi4Nb46wqE
// 2015-10-17T04:26:32 – XWR0heWXczd8uk0bJ1GG
// 2015-10-18T21:21:59 – o9hPaVZAvYAZzB3vGbp3
// 2015-10-19T14:48:42 – LoB4WwL4KYekiAeTF4Oe
// 2015-10-20T22:41:37 – TCnLmdHt2e09XPOyx6pW
// 2015-10-21T02:04:00 – fkYcopT5O3oqg6B9JwMZ
// 2015-10-23T16:53:46 – 9RCX1tBUzUAu8Be84BO1
// 2015-10-23T18:04:13 – guNrdFgvTDmLRJetViGJ
// 2015-10-26T13:32:51 – g46c6DFJyo8t1nwArOT5
// 2015-10-26T23:29:26 – WfEQJ2TftoLsL7OvTaUp
// 2015-10-27T23:44:34 – 8c4QABPhyuk9pZD8urPA
// 2015-10-30T13:51:14 – lvsKIsXnYg8lL5bbAwbR
// 2015-11-03T08:33:06 – tvLyWG99LHGNGZKRai6C
// 2015-11-06T22:29:17 – YyH1hVUkZ9zUbsLtlqX0
// 2015-11-09T00:12:53 – s1EiyV7kmA31BbgbDXYp
// 2015-11-09T13:44:23 – Z3smUUAbzE00gtTLDGdQ
// 2015-11-09T23:38:22 – UvFBdvDrfoL3hlKSBsWq
// 2015-11-11T07:09:47 – rldJSoTDeIZUMJUrPmps
// 2015-11-14T00:26:51 – keItZLarQvaYX00T3Qk0
// 2015-11-20T02:53:52 – xvuBYudUlGOHkHURRqFg
// 2015-11-26T11:14:54 – 36c7eodvqJNu3crfOdKP
// 2015-11-27T07:42:29 – zpc7rjBj7amtX0xAXOGQ
// 2015-11-29T00:07:48 – E514gXKTrJmVRaPBvlCf
// 2015-11-29T04:28:08 – AX8zOIihx3ZmTJPAiGLy
// 2015-11-29T04:57:34 – Fb4jisYZ5dLAGRWYKNsQ
// 2015-12-07T03:37:47 – cuoZ9OCO3D3THmWqdlaA
// 2015-12-15T02:38:42 – QRChYwc3isMvEHZWTmK0
// 2015-12-18T22:51:03 – KTdiELiu6Zh8ehyK9oDL
// 2015-12-20T07:20:17 – 6lETZ8e4NNYE9Wq82Wau
// 2015-12-20T22:09:39 – 0LUfNkMRztM4WoVrzttf
// 2015-12-26T09:30:33 – gfP8osL1ZaV9anJy928i
// 2015-12-28T23:32:41 – EU447gyE0EtWCkJ6h7H5
// 2016-01-01T08:38:35 – Ep0eeUudbMU54JTgU04u
// 2016-01-01T13:36:17 – MO24LTQSpLF0lOfapBcs
// 2016-01-03T08:13:25 – BEjvEhnAh2EkR4TarNhf
// 2016-01-03T11:22:31 – 1L72NwNnKLwA4KxwguQ4
// 2016-01-06T19:31:25 – iJo5HgsBC59L8PrjXBDC
// 2016-01-15T18:28:53 – nj1ivyEbd9cg1hhis1G8
// 2016-01-18T20:02:46 – GzfrqSI7fU1LrQjGpQnX
// 2016-01-19T04:30:12 – neKzykGTCp5lj911d6gQ
// 2016-01-21T07:00:50 – rG8Hwm5D4rvT7WAbvMXt
// 2016-01-21T13:54:00 – 4XZWmNmvifWaAyflJ81w
// 2016-01-22T13:35:00 – qTMGaIlCEgUkls6xwm9K
// 2016-01-27T00:12:59 – C2UHk2HPt17eb4CbI56S
