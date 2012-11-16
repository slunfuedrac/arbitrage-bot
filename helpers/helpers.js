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
