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
