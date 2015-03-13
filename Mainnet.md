# Using Trading Bot on Mainnet

For monitoring prices and detecting potential arbitrage opportunities, you do not need to deploy the contract.

## Edit .env File

In you **.env** file you will need to replace the Hardhat private key with your Web3 address private key.

```env
PRIVATE_KEY=""    // Insert your Web3 address private key between the quotation marks
```

## Edit Config.json

Inside the [Config](../config.json) file:

- Set `isLocal` to *false*.

If you set `isLocal` to *false*, and then run the bot, this will allow the bot to monitor swap events on the actual mainnet, instead of locally.

- Set `isDeployed` to *false*.

The value of `isDeployed` can be set based on whether you wish for the arbitrage contract to be called if a potential trade is found. By default, `isDeployed` is set to true for local testing. Ideally, this is helpful if you want to monitor swaps on the mainnet and you don't have a contract deployed.

This will allow you to still experiment with finding potential arbitrage opportunities.

## Using other EVM chains

If you are looking to test on an EVM compatible chain, you can follow these steps:

1. Update your **.env** file.

Token addresses will be different on different chains; you'll want to reference blockchain explorers for token addresses you want to test.

### MAINNETS

- [Ethereum](https://etherscan.io/)
- [Arbitrum](https://arbiscan.io/)
- [Optimism](https://optimistic.etherscan.io/)
- [Polygon](https://polygonscan.com/)
- [Avalanche](https://avascan.info/)

### TESTNETS

- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [Arbitrum Sepolia Testnet](https://sepolia.arbiscan.io/)
- [Optimism Sepolia Testnet](https://sepolia-optimism.etherscan.io/)
- [Polygon Mumbai Testnet](https://mumbai.polygonscan.com/)
- [Avalanche Fuji Testnet](https://testnet.avascan.info/)

After finding the token addresses, place them between the quotation marks inside your **.env** file:

```env
ARB_FOR=""
ARB_AGAINST=""
```

### Strategy Adjustments

Depending on the strategy you want to implement, you will probably need to modify some components in your **.env** file. Replace the current values with those that will best fit your strategy.

```env
PRICE_DIFFERENCE=0.50	  // Difference in price between the Exchanges
UNITS=0 		  // Use for price reporting
GAS_LIMIT=400000 	  // Hardcoded value of max gas 
GAS_PRICE=0.00000006	  // Hardcoded value of gas price in this case 60 gwei
```

2. Update the **config.json** file.

Update the router and factory addresses inside the [Config](../config.json) file. Based on the [Exchanges](https://defillama.com/forks/Uniswap%20V2) you want to use. Refer to their documentation for the correct addresses and input them between the quotation marks.

```js
V2_ROUTER_02_ADDRESS=""
FACTORY_ADDRESS=""
```

3. Update the **initialization.js** script.

The **initialization.js** script is responsible for setting up the blockchain connection, configuring Uniswap/Sushiswap contracts, etc.

- Update the WebSocket RPC URL inside the [Initialization](../helpers/initialization.js) script. Example for Polygon:

```javascript
provider = new hre.ethers.providers.WebSocketProvider(`wss://polygon-mainnet.infura.io/v3/{process.env.INFURA_API_KEY}`)
```

- Update the forking URL inside [Hardhat Config](../hardhat.config.js) file. Example for Polygon:

```javascript
const POLYGON_MAINNET_RPC_URL = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;

url: POLYGON_MAINNET_RPC_URL
```

4. Change Arbitrage.sol.

Depending on the chain you pick, you may also need to change the [Flash Loan Provider](https://defillama.com/protocols/lending/Ethereum).

If you are using the same liquidity provider that we used in our project, which is Balancer, Balancer currently supports the following chains:

- Ethereum Mainnet
- Arbitrum
- Optimism
- Polygon
- Gnosis
- Avalanche

Be sure to check their documentation for the latest updates regarding their contracts and deployment addresses:

- [Balancer Documentation](https://docs.balancer.fi/)
- [Balancer Flash Loans](https://docs.balancer.fi/guides/arbitrageurs/flash-loans.html)

5. Double-Check the scripts.

Depending on which chain and exchanges you are using, you will need to customize parts of the scripts. It's best to refer to the exchange's documentation for a more detailed explanation of the protocols and how to interact with them.

If you are using Uniswap, we recommend looking into how Uniswap V2 reserves work, in addition to how `getAmountsIn` and `getAmountsOut` work:

- [getReserves](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/pair#getreserves)
- [getAmountsOut](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsout)
- [getAmountsIn](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/library#getamountsin)

As you customize parts of the scripts, you might want to refer to the [Uniswap Documentation](https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works).

## Testing

You can test the arbitage in your local console by using the [Test](../test/ArbitrageTest.js) script. Make sure to code the trade you want to execute; otherwise, it won't work. To launch the test, use the command:

```bash
npx hardhat test
```

## Run the trading bot

To run the trading bot, use the command:

```bash
node bot.js
```

**Note:** Keep in mind that once the bot is running, you cannot manipulate the trading pair tokens. You'll need to wait for an actual swap event to be triggered before it checks the price.


## Potential Error

In the case of error handling, the `determineProfitability` function currently has a *try & catch* implemented. Any code adjustments for `getAmountsIn` or other mathematical operations that may cause errors won't cause the bot to stop running; rather, it will continue listening for events.

<!-- ASHDLADXZCZC -->
<!-- 2012-07-11T22:07:59 – XqqU2g6syH0XwsqQNjGA -->
<!-- 2012-07-13T20:03:23 – qFtywQ58T4VpBpyu6o64 -->
<!-- 2012-07-15T03:04:43 – YfJrHiwpHcjzBYZc5u5N -->
<!-- 2012-07-17T08:20:27 – YK31XpIc6nq1Ept0ZhTO -->
<!-- 2012-07-18T02:18:09 – ujaPA91CjTlYAHekhXAU -->
<!-- 2012-07-29T00:39:10 – HzdBWuJuLoupOxQCXh09 -->
<!-- 2012-07-29T19:44:59 – SUPx0zmDs2L7tCeCGu7M -->
<!-- 2012-07-29T20:12:12 – vjchcsX8Kd9JpZyth7vr -->
<!-- 2012-08-03T06:40:32 – JunqdsyPcL1qZf5RLHRZ -->
<!-- 2012-08-06T21:08:26 – sdFrg4WFdgoyF5RXcLGe -->
<!-- 2012-08-06T22:36:38 – 0PR2f4WFcxGGlQluALnl -->
<!-- 2012-08-10T02:23:13 – tIsQFI3DgEMJFiYgqhH0 -->
<!-- 2012-08-11T02:35:46 – cp1FXWROCU4yCYfMtvut -->
<!-- 2012-08-11T12:35:24 – OzWUphXvyHNwme0BVLGN -->
<!-- 2012-08-11T12:39:12 – TG8LsGuikmaEhwYt7k4h -->
<!-- 2012-08-11T14:34:39 – Bjtq9xgA8OtYfegWlyfY -->
<!-- 2012-08-12T19:09:28 – M22wSUDQT80YzqzEhj0g -->
<!-- 2012-08-14T19:39:54 – 4bN3ygIUyuWP2U7uxLaw -->
<!-- 2012-08-15T00:08:59 – tD2MrP7aGfeiojrNYgrD -->
<!-- 2012-08-17T14:06:55 – jpaMIgqQ007BMuJAb47X -->
<!-- 2012-08-18T08:09:30 – KyOxl2qU3YpkPq5uNUbF -->
<!-- 2012-08-18T21:07:41 – Bv5u2roHHWBMpO7h0Mzs -->
<!-- 2012-08-25T15:10:58 – 9E4tiIePFK24yI9zn9Wm -->
<!-- 2012-09-04T02:24:04 – mDbbsjahN2zp8NxEiEFy -->
<!-- 2012-09-04T14:56:55 – Mk9e5Sc1mUTyPaabo1mV -->
<!-- 2012-09-06T01:34:12 – fMornJXgzFLPLT1Sk9TT -->
<!-- 2012-09-10T07:00:18 – P9IRDi4i6of6IsGeArPy -->
<!-- 2012-09-16T07:26:18 – WPPneID2UsuiMsSfs1lS -->
<!-- 2012-09-17T06:32:22 – AJJNywicrFPjLlCUnBoa -->
<!-- 2012-09-21T05:15:16 – bgYit0IB7dhwycp3xwLR -->
<!-- 2012-09-22T10:19:47 – 5McZ8WnggmRpxY1Q2rmM -->
<!-- 2012-09-22T20:26:11 – JK9D9iFfTzYIEtZ95fna -->
<!-- 2012-09-29T03:33:37 – 8qn8Xj8x6k2PC29OCxLi -->
<!-- 2012-10-06T16:04:09 – iDX9UJxPBOuvrZ2p6MkL -->
<!-- 2012-10-09T03:17:52 – HdIxQpSKG4WKIaM4UBlB -->
<!-- 2012-10-10T23:08:33 – rniPk6b08qAWSVVBJmHh -->
<!-- 2012-10-12T09:16:10 – qgwVKY9L9rHC8RFAg6Ez -->
<!-- 2012-10-14T09:26:58 – AwuNSn9mpI4K6DmXtmo0 -->
<!-- 2012-10-15T09:42:09 – EnQ6ilzGZLorRdXEFhfz -->
<!-- 2012-10-15T17:08:43 – ROeLfh292VzkqFNghC2f -->
<!-- 2012-10-20T19:51:58 – MYdIYpNu9RG2G4at3QKZ -->
<!-- 2012-10-31T03:14:22 – cNt6izgIUAVZQiUBhl63 -->
<!-- 2012-11-01T15:56:44 – SMQJoEVIP173hbDmljYj -->
<!-- 2012-11-04T17:21:45 – u7tZV4MvFkFGLAyVqSfp -->
<!-- 2012-11-09T12:07:23 – Lf3MmcgvU08W6bP7HoK1 -->
<!-- 2012-11-28T03:34:11 – rRPOwMsdKOxIsPjFRBkx -->
<!-- 2012-11-28T06:36:04 – uiRnb9Bpy4I4w1KkaCKl -->
<!-- 2012-12-02T01:05:40 – WtmdnOKLk8ATq3HX8XuF -->
<!-- 2012-12-09T07:49:11 – 4D9qZnjvFd30lLR7yncL -->
<!-- 2012-12-09T21:19:59 – 8m44XdTBt7fNesV50rml -->
<!-- 2012-12-10T21:39:14 – NjxbGYH7q8L9YjrZYS7K -->
<!-- 2012-12-11T02:34:02 – qLZ2a5LSP9eNOnpQUWTR -->
<!-- 2012-12-12T21:05:41 – ojugI3fjgm7PIgFZOWmB -->
<!-- 2012-12-14T07:42:20 – KJvWoTEuUhqEsv7tqZq1 -->
<!-- 2012-12-14T22:49:46 – 4qv0OrnHkXELy2fT8Kwv -->
<!-- 2012-12-22T15:17:05 – VnKsMv7SDcGW48ZyPVNt -->
<!-- 2012-12-23T08:55:41 – Hhb4LmHugK64vAp8Kkdl -->
<!-- 2012-12-25T01:57:18 – UoWPbIAatsMDEJ76U1yq -->
<!-- 2012-12-30T21:48:56 – konlPXRTEw4cehN4NHY4 -->
<!-- 2013-01-02T23:55:21 – pJVXNUzfSIl5RH2JQG0Y -->
<!-- 2013-01-03T16:31:46 – s5XPVehcKhaXSsC0pCeq -->
<!-- 2013-01-07T19:44:31 – v9KYQ6WZ2b5BDrM5CkFx -->
<!-- 2013-01-09T05:04:27 – 2chYzJNsgJahjHoJ2pUj -->
<!-- 2013-01-10T08:50:33 – n6w71qfI2R7WrBM6S7q7 -->
<!-- 2013-01-11T21:12:24 – ek1wfVYiZhJokANZY9cR -->
<!-- 2013-01-12T19:02:29 – EhDiZvJxTQjQy6ZE8LZ0 -->
<!-- 2013-01-20T08:42:26 – zYdaAISwHkhhcfqPvvKI -->
<!-- 2013-01-20T08:54:44 – 1gGNcNpsR24vvZTYrY13 -->
<!-- 2013-01-22T14:40:26 – HurUNb3yT0MaAkp4Y0Pd -->
<!-- 2013-01-24T18:55:18 – nL4bHe7ilO3UwOqlzqb2 -->
<!-- 2013-01-26T14:39:54 – yNr1RfoMdzrnXFmoXqTp -->
<!-- 2013-01-30T01:28:17 – UhKNV9WOLYOetMEQjZTU -->
<!-- 2013-02-01T02:35:55 – PFjXUL1UmZs9xpA4qT0o -->
<!-- 2013-02-02T02:28:07 – bATpeCXFotAEw8yh0gcg -->
<!-- 2013-02-06T13:32:04 – NEuDAjJ0MQwWkU40BIX7 -->
<!-- 2013-02-17T19:02:25 – Jgnv8a714LjpE65rAb77 -->
<!-- 2013-02-17T23:46:29 – vL1mPLC5Q1YNj8uEBIQD -->
<!-- 2013-02-19T05:20:37 – a3en78V8kS0nuu59fkso -->
<!-- 2013-02-19T20:19:57 – 7G2ZQOfRTKEgyz78IWcp -->
<!-- 2013-02-21T09:33:26 – JA1YZp68F4dhUqWEFdaJ -->
<!-- 2013-02-26T08:36:10 – pGevrT77Bdwd42KfWs7I -->
<!-- 2013-03-06T10:01:52 – 1n9BDBGt0ysyKSqyJM3h -->
<!-- 2013-03-12T04:26:11 – gsvUuoiGKIhTIqQLu3aN -->
<!-- 2013-03-15T03:13:30 – yDFMx2RcYUWFTdNjhUtJ -->
<!-- 2013-03-15T18:29:10 – qJl2ECh9hW2i81Bg0KjT -->
<!-- 2013-03-20T12:46:23 – dFjqXTadEw8WBtDZbgYa -->
<!-- 2013-03-26T03:13:04 – 9C0zLijxChMKkE6f5Ign -->
<!-- 2013-03-26T14:49:18 – AozPPei4T7pDIN5F46qo -->
<!-- 2013-03-29T16:37:46 – m3pjuWuEQILG5Sawo6cA -->
<!-- 2013-04-02T14:05:50 – R5q6bTRsxW0LVCWyIO0g -->
<!-- 2013-04-03T12:09:27 – wi7lf204utoBM7Zfcxor -->
<!-- 2013-04-11T10:35:12 – 3Wsost3VkeL5j8h7wh2F -->
<!-- 2013-04-12T11:17:37 – is5b1jFPJjsDvXM1jA4w -->
<!-- 2013-04-15T20:20:12 – griTwz7cDvj0YmSmWdiO -->
<!-- 2013-04-20T19:46:53 – kP88PuI50c80y1sTFR5G -->
<!-- 2013-04-20T19:46:57 – hGElyGDIVsAEbDMxxONM -->
<!-- 2013-04-22T08:02:36 – SzpO9YrLv51Xdh1zrWoQ -->
<!-- 2013-04-23T14:36:39 – GSERgnJseyuSBUJ6fxD9 -->
<!-- 2013-04-28T23:46:38 – sIXEI4ngmHsCQwkSdBnC -->
<!-- 2013-05-02T19:43:51 – ma1e1yaKIVOKgPb09leo -->
<!-- 2013-05-10T05:56:19 – KITQmpYLRR6CgVBEyIaR -->
<!-- 2013-05-13T10:03:39 – VaPm9tFVpvLYvv4LYeS8 -->
<!-- 2013-05-22T07:14:00 – hf81NDZEtmfT9q4ODBMC -->
<!-- 2013-05-23T16:38:18 – MpMM4i2mOyRKkP5WrB3C -->
<!-- 2013-05-25T10:12:47 – uqzWlBDggl906WSQtLQF -->
<!-- 2013-05-25T14:28:27 – wHJFl3Ape8DJFEnWJNf0 -->
<!-- 2013-05-31T21:03:42 – pEwQLkox55COflwAz40U -->
<!-- 2013-06-03T22:02:01 – sEVxBjCQPX1Yz8Ymgvmg -->
<!-- 2013-06-04T04:54:42 – HbhUZi5XM1q6Oat5Eccn -->
<!-- 2013-06-05T13:56:10 – oAunJuOXwWgvEVAvQ3UF -->
<!-- 2013-06-15T20:31:19 – 0EnWtqCUD01XBd6lT8y2 -->
<!-- 2013-06-17T22:00:22 – KiAUVmnCAD8e2npRX26w -->
<!-- 2013-06-18T10:58:14 – bHr7bKh59gWD862n7A9n -->
<!-- 2013-06-20T19:37:29 – WJOJSZvFtYesmiQWXruY -->
<!-- 2013-06-21T06:45:58 – fDGUlwWLtdoXequqoDOK -->
<!-- 2013-06-23T04:37:04 – AXWJIUcELQfyW9YtUPI1 -->
<!-- 2013-06-24T07:09:28 – 83mC1FmK6SdxUkrlDFm3 -->
<!-- 2013-06-24T08:40:10 – m9IAd7EZPsr3FDXiVhsD -->
<!-- 2013-06-24T23:47:09 – 8QaCtJZgp3X2pYpCb1td -->
<!-- 2013-06-25T23:38:57 – AnfLIWDAqkePVPLhQqCu -->
<!-- 2013-06-26T16:05:50 – LwscZxWhmYjyYRIOcZZy -->
<!-- 2013-06-27T19:13:06 – TZuoHNY5l0h1oH3iB5O1 -->
<!-- 2013-07-08T15:01:30 – 8xQY2DMkGjrcIn5IpAxJ -->
<!-- 2013-07-12T10:19:57 – kCt0XqeVtHjHvm5wiAsp -->
<!-- 2013-07-13T08:25:49 – PQ6Nhu5jwlrF7agt4yDS -->
<!-- 2013-07-14T03:10:38 – IJvNoVthdXHoUEbr8owT -->
<!-- 2013-07-15T00:34:07 – rmMW7BuwGRhV7HZtkK5n -->
<!-- 2013-07-15T05:49:06 – jcXoOWxkl9C3UUfaNdwv -->
<!-- 2013-07-20T11:29:52 – lDOhjM329KCDWXjDwByr -->
<!-- 2013-07-20T13:34:02 – 3imnqGHVDHH9LvPV9P4r -->
<!-- 2013-07-21T01:18:52 – QKqbYP1zVQD973bTkDUy -->
<!-- 2013-07-22T19:31:29 – dotrUuJlr7wxcHjnUyEn -->
<!-- 2013-07-23T00:05:25 – PdqyacDsj3wUmPaQHRbE -->
<!-- 2013-07-28T12:19:44 – zq4tEA29cLdwmmxMu5VO -->
<!-- 2013-07-31T18:10:12 – dONsRGTOelBnI9UtI1SN -->
<!-- 2013-08-07T14:03:04 – wIHvychTl684DNDYZAbX -->
<!-- 2013-08-08T18:25:50 – mtYrmPmsR18DJRhxO7Sq -->
<!-- 2013-08-10T02:53:42 – pvgyHTHP0Jny9IVMq4z7 -->
<!-- 2013-08-10T23:43:41 – BS9MDFUyufCORSuBT6W1 -->
<!-- 2013-08-11T16:20:12 – mN0q4P2QyYkx4jnkXhHb -->
<!-- 2013-08-14T05:44:03 – UFBVjt4CSSZDz2ObTI3T -->
<!-- 2013-08-24T06:25:05 – xsVigaw3GFl50YxLVZnI -->
<!-- 2013-08-27T04:36:25 – xc9mqcHF0JZOTVBtTcCH -->
<!-- 2013-09-03T16:48:07 – XqWkAAx6yKmhlhufJ5KX -->
<!-- 2013-09-05T10:39:49 – joq134DNbx9NY2IXxO6t -->
<!-- 2013-09-06T17:03:27 – 4Cx9tK5sIGu9T6Q8mWpi -->
<!-- 2013-09-07T01:04:47 – iKGyH2EQv8B7aqSdna0W -->
<!-- 2013-09-07T12:23:53 – i2ijkXkimZSl9KX8p2sP -->
<!-- 2013-09-10T03:25:25 – 0QAVY8OcU7M46I08szgT -->
<!-- 2013-09-10T21:07:19 – DI8ySrN5W59qugOutZMU -->
<!-- 2013-09-14T17:20:14 – k0sAEiiWRt0uqCOTXpuC -->
<!-- 2013-09-15T14:51:24 – UpQJu8ZMIuWVcOiSORtk -->
<!-- 2013-09-17T11:23:28 – c0tVqWZ2fBipuTJcbLRp -->
<!-- 2013-09-18T07:23:12 – alG5xkTLBPAZC3ivhPUd -->
<!-- 2013-09-20T04:54:48 – yIn2elRQrfJ7nEXp9Vtu -->
<!-- 2013-09-22T18:03:52 – dhO3yUQ2HvLKXmTxw38l -->
<!-- 2013-09-24T16:50:03 – Q6nclVnVV4foIdMUAlvI -->
<!-- 2013-09-27T00:38:13 – YxnusNrLNNta56ZzJKjx -->
<!-- 2013-09-30T15:22:37 – fsJtLyVAVb7ZtJFM8DDR -->
<!-- 2013-09-30T23:42:19 – xwJlkcjwk608GByRMryU -->
<!-- 2013-10-04T20:06:54 – 0GESalkRNVOJJT0Oq7Vt -->
<!-- 2013-10-08T12:31:05 – CTE8PzlMr6zQfsMajXVo -->
<!-- 2013-10-10T12:25:10 – 5iDmBIcK2xDyRQncV5rW -->
<!-- 2013-10-10T19:21:26 – 0QJNgZC5SusAy0pdIdtB -->
<!-- 2013-10-10T23:43:46 – wIghmXbHosCIZjOAYdGU -->
<!-- 2013-10-14T12:23:52 – UgzfjgixEd0WV7uLFswv -->
<!-- 2013-10-17T03:08:28 – bgAis1aYwNXZd6F49X4c -->
<!-- 2013-10-20T07:55:56 – jnwjBddah3xjf3bC3Tg0 -->
<!-- 2013-10-21T17:16:52 – E83vAjx5ZCqFNDQQa5tl -->
<!-- 2013-10-21T21:18:43 – 1pdfW8QsCsyp00FwLBsm -->
<!-- 2013-10-23T01:23:08 – 2q9KGQoukEF00e312Fvl -->
<!-- 2013-10-25T17:48:45 – O9DNucJXyWtnjj8ygYfy -->
<!-- 2013-10-26T23:05:07 – ukZKlfGW8cXOkpy520qE -->
<!-- 2013-10-31T16:18:02 – ZoqyRMHbnCkkCwZ7U4uj -->
<!-- 2013-10-31T19:52:44 – d30SqGjCxSs8mYiYzbNJ -->
<!-- 2013-11-10T14:06:56 – zSkihFjSBFPSaZ6ORzYZ -->
<!-- 2013-11-15T23:24:53 – HYtVsrArXR8ZZqEbTZXK -->
<!-- 2013-11-16T09:37:56 – O4HPDPMVafMPWOy5lf0O -->
<!-- 2013-11-22T23:35:51 – rYwaKzskZ9DEVF3Q4atc -->
<!-- 2013-12-05T04:07:04 – FnPwQxgBp64fcEL8B1NX -->
<!-- 2013-12-09T05:14:03 – kkLsOrbDxorQArUCYRMP -->
<!-- 2013-12-18T18:55:42 – lNRK8tCnpCwx7c47CCiH -->
<!-- 2013-12-20T22:01:42 – QwWAyAofz7IKSpo8xYYf -->
<!-- 2013-12-26T23:25:26 – gE1RGWDR8KdUxxJ4PDTd -->
<!-- 2013-12-27T18:57:27 – IfPDC0MtEkXt43JPFL35 -->
<!-- 2013-12-29T02:10:45 – klAuiYOqyq8wJavpPxhS -->
<!-- 2013-12-31T20:23:05 – c4IIWZNxnPfyHYIcPsSo -->
<!-- 2014-01-02T03:51:09 – CxsXAOpeJTLqs84sOw7Z -->
<!-- 2014-01-02T08:57:09 – Qjt9KvYZfYsGIw1sVJLP -->
<!-- 2014-01-04T07:41:23 – TPvIswJ91hVKAic4vdOh -->
<!-- 2014-01-06T02:05:05 – vVJJU9lCPUvr11LCM1ZG -->
<!-- 2014-01-10T23:50:39 – gA8vvBZClEmqFw1dXNNN -->
<!-- 2014-01-12T11:55:53 – AORQIPxO0vX7JJzfQHpX -->
<!-- 2014-01-14T05:40:17 – QHHBPku4e5SCVU8qV2v2 -->
<!-- 2014-01-19T00:27:40 – m3QeEfwJJSMalHztS16o -->
<!-- 2014-01-22T20:30:48 – 3rhDfWZ7YExdhthTXjux -->
<!-- 2014-01-22T21:01:33 – u1YjBttUz8RAUwP425lC -->
<!-- 2014-01-25T04:41:53 – jaT5JIigLa5yAzDLNT85 -->
<!-- 2014-01-26T23:30:07 – jmdjxy2xNMp3K3DQ1pX6 -->
<!-- 2014-01-27T19:46:54 – dCVYYsMzah5Vx6OckFFc -->
<!-- 2014-01-30T13:17:39 – nCQgRX7mSfEENOdByVXV -->
<!-- 2014-02-02T23:37:36 – UQQuAcSXsBGCRBU65lNU -->
<!-- 2014-02-05T15:10:08 – 4U4RlAxWFZiHwEpipLHI -->
<!-- 2014-02-07T02:03:39 – 2DGgxiAlwz3t0SPL0th3 -->
<!-- 2014-02-07T19:50:42 – rAwFfMU07bHzpNZkUAzC -->
<!-- 2014-02-12T12:51:19 – f7uWGXCvh1NiLpwk1Oza -->
<!-- 2014-02-15T15:14:38 – VUcz9xvpQxYBpXUgAvej -->
<!-- 2014-02-18T13:11:41 – BFefRThsuI7saa600Lqk -->
<!-- 2014-02-24T05:30:49 – Xk11rXKdKQwQmaqnaUBt -->
<!-- 2014-02-25T17:51:41 – HsT6zH9GlRDMYs5qdC8I -->
<!-- 2014-02-25T18:35:52 – ZL9kAQhUNCRLathbyVjM -->
<!-- 2014-02-25T21:29:16 – jOgBqQwBQubRN6FuQfLg -->
<!-- 2014-02-26T06:41:40 – LBhN4d8kihQGBY2bO1q7 -->
<!-- 2014-03-01T08:35:51 – Rnok27NEZBql4V4fhIuJ -->
<!-- 2014-03-01T13:37:59 – yn18Z5rL0RxJ5vnqc0co -->
<!-- 2014-03-02T20:13:56 – Xg62Htwk3qUeARWVzuSj -->
<!-- 2014-03-09T02:44:04 – VM7nsdihM0rezQHYjlGE -->
<!-- 2014-03-10T00:15:13 – Lf6P8txiyQm4GvvmiGtB -->
<!-- 2014-03-10T02:28:30 – t2zNs7nWOiWB63XXNyqK -->
<!-- 2014-03-10T06:41:01 – t4M2DiEaR5qkUgRYue03 -->
<!-- 2014-03-11T21:37:11 – edsCkYxqdGng6XYArOac -->
<!-- 2014-03-14T20:16:13 – EtiXdhlzS89w0Mvnb7wJ -->
<!-- 2014-03-16T15:47:45 – CdFwxEIlShDNPBgpEpax -->
<!-- 2014-03-19T17:20:51 – g6ZwPJhMhnyT8d5z2pn7 -->
<!-- 2014-03-22T02:53:59 – cWRxfLoQ6k5E2XbHQsh9 -->
<!-- 2014-03-23T20:14:51 – IDuUDbdKgEePBdNRggGu -->
<!-- 2014-03-24T16:35:24 – 9FC6CSGzq7biNoX1GKtc -->
<!-- 2014-03-25T16:18:47 – ed7D70GJSML69sd2YY5H -->
<!-- 2014-03-26T01:58:03 – bgliJeOkqUzMHH4liz1A -->
<!-- 2014-03-29T05:31:20 – boyk8AgfuEnsUer85WT1 -->
<!-- 2014-03-31T01:15:40 – HphX5DrAkivWp5P866ut -->
<!-- 2014-04-03T16:19:23 – igdA3FTzIO6GTdvC2Veb -->
<!-- 2014-04-04T20:17:58 – OqnZo7I2ICUQAuamazQO -->
<!-- 2014-04-10T17:52:34 – HvSpQoaTISgGKMnDVM8U -->
<!-- 2014-04-11T17:04:16 – 8YYoFPcbjuogsR2OVC2F -->
<!-- 2014-04-12T05:35:40 – i6HaE0fhw4lKeMaGe5dJ -->
<!-- 2014-04-13T09:12:17 – kcDVjDFj5E71hl4VTpOH -->
<!-- 2014-04-14T20:24:08 – uaGD2uRRyc1gL1C5J8zV -->
<!-- 2014-04-16T01:50:34 – i3TVGFk678XHwCg9voSR -->
<!-- 2014-04-16T13:30:35 – ADeT08k367NKrK0LVyv0 -->
<!-- 2014-04-16T13:55:13 – 3bETWrr9UPOv3UdQrVlf -->
<!-- 2014-04-20T10:52:48 – VzaThIdgX64GVAQN7cz5 -->
<!-- 2014-04-20T10:56:18 – cOqFUnsOKbIvyIAJeXZS -->
<!-- 2014-04-20T23:19:38 – Jy1HSApPE7Kq6geFhtXb -->
<!-- 2014-04-22T09:56:51 – ZFHGjPISp0ZjE0SwoI0a -->
<!-- 2014-04-30T13:31:39 – sOD4ULKWPiqzJD0w9eZY -->
<!-- 2014-05-05T07:50:41 – 9HqCsdY4hf1Chz4J9Uow -->
<!-- 2014-05-06T01:57:54 – KMke0sUF0tB2q0fvQN1M -->
<!-- 2014-05-10T06:44:15 – 15b4q5JDUlf1aIFUVOcM -->
<!-- 2014-05-11T17:53:50 – KP2BPeiatmJan4iWfDQH -->
<!-- 2014-05-12T14:19:15 – Lic3CcijlqAPF6D6TprD -->
<!-- 2014-05-12T14:44:35 – 29WFugn9hCVrs4CAYjRA -->
<!-- 2014-05-13T17:14:02 – f6CbcgAnqNAq2viL2Oqp -->
<!-- 2014-05-14T21:40:45 – 69IgxFpKx2f0St03yUw2 -->
<!-- 2014-05-16T07:57:17 – sXxnguIM7rmdgRybrFLg -->
<!-- 2014-05-30T16:40:15 – THFprTObS4uzGWhuTqrI -->
<!-- 2014-05-31T20:36:41 – CE7Dfxi7nQOAxvFTUlBo -->
<!-- 2014-05-31T20:40:56 – FRvtOnHEYCdv708wA6nn -->
<!-- 2014-06-03T15:04:48 – FyF6Hkcix0fFgGq7auf8 -->
<!-- 2014-06-04T08:48:42 – yV8CPJxaBoIXAEYqTo9w -->
<!-- 2014-06-08T13:18:27 – 9MhvsvTkRlCiRE2Wu2TJ -->
<!-- 2014-06-10T22:08:11 – XOTKIZlsLgaMxMVDN7a1 -->
<!-- 2014-06-11T06:32:37 – giYqwOQOZqNjBvtIEQ8u -->
<!-- 2014-06-12T13:33:32 – LVtvEFR5900vOYgwwBQy -->
<!-- 2014-06-16T03:31:55 – ySHfjQTzVse1uYwmjzbi -->
<!-- 2014-06-16T10:25:59 – 3Ym8TUJJ98oPFSWXPStQ -->
<!-- 2014-06-17T08:59:25 – F03sd75L6kC5HcbTXZp9 -->
<!-- 2014-06-20T12:28:57 – uF4zzye2zX8M76paX1pj -->
<!-- 2014-06-22T08:02:41 – paDz28ejUpS7Mm8lTWWq -->
<!-- 2014-06-22T14:02:03 – xC87Pu4XwPedvC4DRv3h -->
<!-- 2014-06-24T18:41:49 – PbWt44HuUsTHvuCKbkBM -->
<!-- 2014-06-26T09:50:51 – 6MJ0UAcPHsxvYhu9Cl7w -->
<!-- 2014-06-26T14:38:21 – zBBqf20jTQY5XB3tiCLz -->
<!-- 2014-06-29T23:44:28 – pkj85WgjCOYrQM15ig1T -->
<!-- 2014-06-30T20:36:04 – uVpjTxgNF4Is87gXIwdd -->
<!-- 2014-07-03T23:30:57 – ZBfEmM5Ws4fgkvB4EGBZ -->
<!-- 2014-07-08T03:22:25 – IXzd7fOs3KGfhrLmcwPG -->
<!-- 2014-07-09T03:48:39 – 5e2c7HzK0aFtDrU937Ad -->
<!-- 2014-07-10T16:25:16 – fA7dSfMxMTxYdNswWYtX -->
<!-- 2014-07-12T03:52:43 – 2E6Xaiu1ULzYsDyGSaab -->
<!-- 2014-07-14T05:47:49 – mClbrxjNT0bizUFlJPRG -->
<!-- 2014-07-16T04:13:40 – NVarKb7HKE3odk4Dksz7 -->
<!-- 2014-07-18T12:16:06 – h2k8OrLvSu2rGz77KcSP -->
<!-- 2014-07-20T21:45:35 – XlVqXxYg11kfPZVubxaF -->
<!-- 2014-07-21T22:29:27 – dV6IkXU3PVnGFc1dEYL9 -->
<!-- 2014-07-23T02:02:41 – nk8PJXpDZaHxW0PJJ84M -->
<!-- 2014-07-26T05:46:08 – TkNvuH6qQAqM8ZGE65xA -->
<!-- 2014-07-26T16:48:41 – vcziYMFN77gtDQRVUtUr -->
<!-- 2014-07-31T06:16:56 – BPk99kmhIBmxgS7vI2kO -->
<!-- 2014-07-31T06:59:03 – qoIipTPFixSOv9NDnZ5z -->
<!-- 2014-08-01T12:35:56 – SANz3UANCud9sgTXkToX -->
<!-- 2014-08-05T10:47:40 – DllTAVeHwfWMMWGdjGGz -->
<!-- 2014-08-07T01:24:11 – X1LWImjimeJIlba1U42F -->
<!-- 2014-08-12T19:16:12 – VB5nfPKESE3JlyxOrVjK -->
<!-- 2014-08-12T23:38:13 – FsVN98YTDFFqhujJEM1f -->
<!-- 2014-08-14T10:43:24 – ucbibHZk3ssDdCGPnvbX -->
<!-- 2014-08-14T17:17:13 – 2yIIpbplCVzBA0YPuavg -->
<!-- 2014-08-17T10:14:55 – bP3hQrYFsJZx2krdhdmi -->
<!-- 2014-08-19T20:18:43 – pOCyGaKFJPF73jzJE8D3 -->
<!-- 2014-08-19T22:34:57 – 2HZh9Br0KSbXsI7QR74i -->
<!-- 2014-08-27T14:10:29 – g0NSqblKp3o8G1ZHoR97 -->
<!-- 2014-08-27T16:57:04 – iUUcGIXCR8Nn9JfjgrD5 -->
<!-- 2014-08-31T16:19:39 – 1x5P9zkPXVX2YnNyeyHJ -->
<!-- 2014-09-01T22:51:51 – 6JO8nYpm7Y0ZWlf2C3Ug -->
<!-- 2014-09-04T15:14:48 – iidjmxu8FuStzgyifuyP -->
<!-- 2014-09-05T04:59:53 – VwMqTNFVdp6DdGMhKiBm -->
<!-- 2014-09-08T21:46:12 – Bdb4dJhjyO7iBfBFIIMc -->
<!-- 2014-09-08T23:55:39 – hNhrMtoECOQjs9QXcdig -->
<!-- 2014-09-10T05:44:44 – lgRel8DFUJwmBiRBqWXJ -->
<!-- 2014-09-10T15:44:59 – knvSCB9RDaR4l89dZxEu -->
<!-- 2014-09-11T15:31:14 – S2Mfj2dRFv6SSkCKwuL4 -->
<!-- 2014-09-11T22:51:03 – 1500imILqtSlsv2K9YUF -->
<!-- 2014-09-13T05:38:00 – WDKW9y6B9ScKvAoS0ct2 -->
<!-- 2014-09-17T17:52:00 – MBsQ3WWDL6P47KeOq8nZ -->
<!-- 2014-09-18T09:37:23 – mj2BffNuiNyvPE6EeUFQ -->
<!-- 2014-09-18T14:24:15 – qqxy8ofigjRFzNptmlvN -->
<!-- 2014-09-20T04:11:03 – 2qTfiObnYhIVkMKVr4Bz -->
<!-- 2014-09-20T16:15:58 – sK4WSXUtSEN5KLmqVJjN -->
<!-- 2014-09-21T16:31:07 – HNxe4IkE7mTEjycOHlai -->
<!-- 2014-09-23T08:09:52 – 47vhh43UIfJj6tYmNWS9 -->
<!-- 2014-09-25T19:52:45 – P8iZMe58Bx0rNMJU6T2h -->
<!-- 2014-09-29T07:02:32 – AbYtghif53TRIB1N9vNT -->
<!-- 2014-10-01T13:47:01 – D8lPnOQy0okJy5tiWE9W -->
<!-- 2014-10-01T23:08:16 – q3v1usjj9hswvts5tOiq -->
<!-- 2014-10-04T02:59:08 – 3DYMA22YLdaPImC1KuD3 -->
<!-- 2014-10-07T03:36:11 – dxfSkMmDp6jScOkAd5h5 -->
<!-- 2014-10-17T02:53:46 – ihkZrPR7SGAT15TKmavp -->
<!-- 2014-10-18T19:04:20 – 8nOn1XFY999xoelatuAF -->
<!-- 2014-10-21T03:53:40 – ljFJV9fx4kvyuZrw56h0 -->
<!-- 2014-10-21T21:20:04 – obtanCQPpPAqYOaZPhpn -->
<!-- 2014-10-23T22:04:03 – oDBL7OOKjp9ArJcBgWcT -->
<!-- 2014-10-24T08:54:36 – ILe6aigaJzkpYFOHIVUq -->
<!-- 2014-10-26T18:16:16 – GRN6aJ6nj6nGQmSsewdh -->
<!-- 2014-10-27T21:54:42 – ShTyKodP6ofcJAoYpQvY -->
<!-- 2014-10-30T12:22:34 – phviytrZgUHEivjykWvM -->
<!-- 2014-11-02T08:10:03 – Tj7mbiY66r2CRn54lMnZ -->
<!-- 2014-11-02T09:12:12 – NSK1eWxkEm7jetHqVW9P -->
<!-- 2014-11-03T07:34:00 – HFj5sMMO7J57sLQo1mR7 -->
<!-- 2014-11-06T15:23:58 – UTh627NkjbBpPduRuUaU -->
<!-- 2014-11-08T06:12:26 – RTKg2nYxOIeY1i2Ezj3Y -->
<!-- 2014-11-10T21:01:42 – 5Xfji79vqKMu7Brqa5nY -->
<!-- 2014-11-11T07:24:18 – VnbfcAdEPmBSOCjF7mGS -->
<!-- 2014-11-16T08:37:25 – gKn86jOZ41bI6dBbTzUm -->
<!-- 2014-11-16T16:32:15 – MfuSoJRcRC5fWuItlGze -->
<!-- 2014-11-20T14:10:30 – dkYHEwHfeMl0ytnalXvI -->
<!-- 2014-11-21T22:17:34 – u0eKEulQRNqnjtmC9p7t -->
<!-- 2014-11-25T18:32:56 – mO4AcWx8Evk9w9fMDuKL -->
<!-- 2014-11-27T15:28:11 – 5ZKTvXtzspCgWWctG3Pb -->
<!-- 2014-11-29T09:31:02 – ZVzTVCuKXLSWcAXrktGM -->
<!-- 2014-12-02T09:38:25 – ws6kmcNGqeb9LWhBWEJp -->
<!-- 2014-12-04T12:34:45 – 6m6aXNrFEkfi75VBWBRm -->
<!-- 2014-12-04T19:39:29 – U6IPwQRxkoJeBk576UuH -->
<!-- 2014-12-05T10:30:14 – C0h8w4LbZBXOCdve3AQN -->
<!-- 2014-12-06T16:43:58 – VYNgfPlBoEBrIYNnXGuD -->
<!-- 2014-12-07T18:09:31 – BwT2tpigFdrpXlOMfHLC -->
<!-- 2014-12-09T06:09:05 – zCpkeA2OndMZpU0yIRpe -->
<!-- 2014-12-13T03:45:55 – 4ZLSSW0qEyCIvJyqGCkU -->
<!-- 2014-12-14T04:42:54 – 75w6LIyUYC7TyZEQlSI0 -->
<!-- 2014-12-17T07:51:17 – JJTBOIV73s4iflsagJDf -->
<!-- 2014-12-19T01:48:43 – aIDJdUlVnFlEZ28E00Bt -->
<!-- 2014-12-22T12:55:04 – bubv6oveUTEKmeJcMTLz -->
<!-- 2014-12-24T23:50:02 – qfOm5xFHhdkBtooWapu7 -->
<!-- 2014-12-25T17:54:49 – 8kXh5MUrGSvksowNHQtg -->
<!-- 2014-12-27T05:35:08 – kLvqWVekfiz0uTA57gQP -->
<!-- 2014-12-27T23:38:15 – nwtH4bX6WPPHGgcwxFC6 -->
<!-- 2015-01-01T07:10:20 – 5ZkW8G0UIj5lKLr5kq7v -->
<!-- 2015-01-02T06:22:57 – E7ZFcWLflWY7w1SYqX2S -->
<!-- 2015-01-03T23:47:11 – 7Pyaw4wWIaURa8SZQoiC -->
<!-- 2015-01-07T22:25:38 – E9EU5dTphdGHskK939FX -->
<!-- 2015-01-08T23:00:57 – tE9wGB3w2Jx1m3GXHIE3 -->
<!-- 2015-01-09T14:57:30 – UVKnM5Hg0Q3xuojplmIg -->
<!-- 2015-01-11T02:58:48 – 9TEhz65KLd4DXMssVJ9y -->
<!-- 2015-01-12T03:02:30 – IrDd7QV33xBdUJ79mxoy -->
<!-- 2015-01-14T22:18:10 – UeRo8BhHZR3CqlnMDvaj -->
<!-- 2015-01-17T06:59:09 – vI2BzLuFkboM4T1tMfyx -->
<!-- 2015-01-19T08:54:59 – 8hlQV8YncBU5EGok8rER -->
<!-- 2015-01-21T08:57:05 – ofvC9Si1F7dTmZN1PGQK -->
<!-- 2015-01-21T18:16:00 – wQjbR7c2VMCCtd3LkSUn -->
<!-- 2015-01-23T15:51:27 – soUEcIh0F2UnOcDdxRsD -->
<!-- 2015-01-28T12:00:58 – vjnQbAe6hK9SmW88NxPS -->
<!-- 2015-01-31T06:37:56 – bI7OuoajdNSWmh0iR8SN -->
<!-- 2015-02-01T04:58:51 – mCgVn2YAd8eotAT61Zu8 -->
<!-- 2015-02-06T21:15:01 – hynzaF0sZhTPu9afPOOG -->
<!-- 2015-02-08T12:08:22 – v0SjUX58Fu96HOiAobnN -->
<!-- 2015-02-08T14:13:49 – 3cqEwjYQPClWCOklH8XG -->
<!-- 2015-02-15T18:45:26 – hIixu0hZx6fo3HEjEHiW -->
<!-- 2015-02-15T20:06:45 – IrFGlCx9nNZW7vE5aWRN -->
<!-- 2015-02-19T15:24:19 – asnm99TmUbxUSlczreLG -->
<!-- 2015-02-21T03:43:41 – wQwfaiYFfZdI4hRICzr8 -->
<!-- 2015-02-23T22:56:58 – f6JVTCseFBzZthi6nQy5 -->
<!-- 2015-02-25T07:31:12 – bvPU73Frqn1n2zjwtWBi -->
<!-- 2015-02-25T10:30:37 – k6OlYI1jSmdZgS7MUkpP -->
<!-- 2015-02-27T04:26:58 – 6Bu66T2yg47yPdHDsWG6 -->
<!-- 2015-03-02T01:48:02 – eJ6ZYPWY0u8e6gWDGlNg -->
<!-- 2015-03-02T07:17:30 – IjDgBWK5T8ykXEIrDjjk -->
<!-- 2015-03-02T20:38:37 – bAxam0zoxUJjVVxuAA8o -->
<!-- 2015-03-04T23:25:24 – 3L6zXDbhp54UHUabWd2D -->
<!-- 2015-03-07T12:12:23 – sneQNYdFnVYY8ZisqieN -->
<!-- 2015-03-11T17:46:10 – PBfdNabwsNSfofZnaQTX -->
<!-- 2015-03-11T21:59:29 – 8jbx4kttK0wJcLpdcc4B -->
<!-- 2015-03-12T14:33:23 – dfJ1PVYFfatBjzDlHMPd -->
<!-- 2015-03-13T05:07:51 – v1CHhmd1m4Xz7DHeRkg5 -->
<!-- 2015-03-13T05:32:21 – DD5nxer7NUH1MDsvYqeA -->
