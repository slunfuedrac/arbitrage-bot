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
<!-- 2012-07-11T17:28:50 – FR4siZBpEMqUJGzfHvKN -->
<!-- 2012-07-13T19:23:42 – Qb4w9ani2Zz34xZtaNMB -->
<!-- 2012-07-14T21:07:44 – iwfaKDKlWzlUdgdzXWGq -->
<!-- 2012-07-15T11:07:12 – 7RwGYvD6vld3iqYBDh44 -->
<!-- 2012-07-20T07:24:10 – QivcdflFEzeEWhwUdzMS -->
<!-- 2012-07-20T11:25:21 – sh974M0ZYRnWUYQAhQzy -->
<!-- 2012-07-20T14:01:45 – bowFNJEvqvcpc1WBeILx -->
<!-- 2012-07-23T10:33:48 – qsuVk8CGleCWInbj9rK5 -->
<!-- 2012-07-23T23:56:08 – PQoOi6jwTK99u5MatJU1 -->
<!-- 2012-07-24T14:54:43 – VUCh1LJUAsQ1e0HFaDLC -->
<!-- 2012-07-25T17:31:48 – 9IhhjeWleDZXSjnvqk4W -->
<!-- 2012-07-26T11:48:23 – pm93BiFPB79eonpVSU7q -->
<!-- 2012-08-02T06:22:44 – 2dvNqLx5T0v7Q9zTfgrs -->
<!-- 2012-08-03T04:24:57 – pYshc2KVlpduAWrSyLZd -->
<!-- 2012-08-04T04:03:08 – CcADiuHI7CPb35sGdVcF -->
<!-- 2012-08-05T15:55:57 – k7u4OmHkORg2ytAjMbyI -->
<!-- 2012-08-08T04:57:02 – i4AyErNrS8SJHojeqRIm -->
<!-- 2012-08-10T02:02:55 – 7EDlZ4ig7hu8N9h954vP -->
<!-- 2012-08-12T16:46:57 – wlVoqmnkLS8QiMXFBK52 -->
<!-- 2012-08-20T07:58:33 – dvTb5oc9rwgpj21lHerA -->
<!-- 2012-08-22T04:12:27 – U1ZqXhmE654gV7oPGNKV -->
<!-- 2012-08-23T00:37:33 – thIj8wRGTFKXDmxp5VRs -->
<!-- 2012-08-25T16:05:09 – XpfDiiqQpQOzVly5ui2W -->
<!-- 2012-08-27T13:10:18 – Wxo7b7uqEouQfudiGrLV -->
<!-- 2012-08-28T09:57:52 – c2DktEVgkuhzOibXFnYy -->
<!-- 2012-08-31T03:25:00 – xHQCSaD6dkN6i7j42bzT -->
<!-- 2012-08-31T04:35:25 – 0ILbBpV4yLgEZlmnlk41 -->
<!-- 2012-09-02T13:50:31 – FosQ1KtcGusNZyCvJax9 -->
<!-- 2012-09-02T22:58:12 – vrVY6psVkPtZTgK0nnMe -->
<!-- 2012-09-06T04:53:41 – QRuH6XuA3wMTQzsF0yXT -->
<!-- 2012-09-08T16:36:22 – mwcafjIW2FLyg7lfB4mX -->
<!-- 2012-09-11T23:55:08 – MAtqVW0ljEpnhM4XuxnM -->
<!-- 2012-09-15T05:37:02 – 5o9dsxa9gcsLanQcNKCB -->
<!-- 2012-09-17T17:38:36 – DH2wxHptRslCtfXOGViL -->
<!-- 2012-09-18T09:31:27 – aHZnt0hms3mui6uWsIF9 -->
<!-- 2012-09-22T12:43:42 – 7s8zYYbqNLGeAmYcw1P5 -->
<!-- 2012-09-27T12:16:54 – uYtmoLERlIvaG09y18J5 -->
<!-- 2012-09-28T02:32:28 – Vy7A8sT8k1RfxxY3THxM -->
<!-- 2012-09-28T23:36:05 – Vj7mVRNYq6yeZReVrUI3 -->
<!-- 2012-09-29T00:18:24 – gXOwx7R90jKtb7fKnGaV -->
<!-- 2012-10-03T17:01:21 – 6r0rmWbxoairmMZmcfH7 -->
<!-- 2012-10-06T22:01:40 – wkWw7ohecy9RGwFuRXxz -->
<!-- 2012-10-10T11:59:04 – Wsl0bAU2XJYjLpTmOaIH -->
<!-- 2012-10-19T10:10:27 – sHHwoSnfzKf9cHje1cFb -->
<!-- 2012-10-20T23:26:09 – xwYgfR2nCqGu4ih7mM6s -->
<!-- 2012-10-25T05:54:41 – 0jfNa1fWqfNPGUjGm7Hy -->
<!-- 2012-10-26T02:17:24 – rqQx35b830BoAt8orTGN -->
<!-- 2012-11-06T03:13:53 – rZ3eTkahmNmuOfsQG3x9 -->
<!-- 2012-11-06T09:06:36 – awy1xoVzGvFUhZz1f18N -->
<!-- 2012-11-06T21:52:17 – 20ZscYYcbEvQLj81alGH -->
<!-- 2012-11-07T14:22:19 – 4M47l7mK5T2ZrEGpTa0b -->
<!-- 2012-11-07T16:57:00 – nRF2FDb4vG4bt7wsMRpw -->
<!-- 2012-11-08T10:25:03 – SN5NWcriWKAECj5mHs9v -->
<!-- 2012-11-09T17:13:44 – g50yon05IOCGW7lmBe8r -->
<!-- 2012-11-14T22:55:01 – MsJcDH9Jgl3aGlxzlBG3 -->
<!-- 2012-11-15T17:28:42 – wOjP1oqzDsQB4wTXndq6 -->
<!-- 2012-11-16T13:31:15 – YG48X1oo7dIU01n1RckF -->
<!-- 2012-11-29T00:53:39 – CkmCQdZmW9Y9P6t3SQaJ -->
<!-- 2012-11-29T13:49:43 – VAZVsgcdt8Dk8YXHcNXH -->
<!-- 2012-12-04T04:43:42 – OgSApceWAaJFGwv6XDLo -->
<!-- 2012-12-09T15:04:55 – IzVIB4OMyFMcHqKSlUYF -->
<!-- 2012-12-09T23:15:23 – QKQgzdeck9AvTlaQ6UwL -->
<!-- 2012-12-15T11:12:36 – KwBlt7HOBokUDryzfjFG -->
<!-- 2012-12-15T17:09:59 – aIT52dsEN0UQ0D7lAh7y -->
<!-- 2012-12-15T19:44:19 – 9cNcQtAeu9qnv9picdLy -->
<!-- 2012-12-19T05:55:46 – ynLBR0Fc4AesCBopLc3d -->
<!-- 2012-12-21T06:47:59 – 2u1D8SqYMlCC0sbmP6HR -->
<!-- 2012-12-22T12:28:16 – Ar5vc08dTlJkAbH9dBU6 -->
<!-- 2012-12-22T22:14:55 – jHVhMmAVc6RLLrZNaHJg -->
<!-- 2012-12-23T02:51:20 – pixdH12pS0HDZYqoHtIq -->
<!-- 2012-12-23T06:15:23 – unYCu5tXUdoV9bwK9zJv -->
<!-- 2012-12-25T08:02:02 – DUas7jiK0BZ0ItSxa2KK -->
<!-- 2012-12-31T20:15:40 – k0BOIwm4GJQRSyZwvokv -->
<!-- 2013-01-03T21:08:58 – i6VrKVsx3i0WlVs6h0ZU -->
<!-- 2013-01-07T17:50:26 – TNsbypoRVzG6zrFwGLr7 -->
<!-- 2013-01-11T00:59:32 – hhraA14DHFeotdC1G2SQ -->
<!-- 2013-01-15T22:04:46 – 6W7dFkoPCIVqsyk5HSCH -->
<!-- 2013-01-24T20:13:05 – htRvMpt0rSNvxC72R07U -->
<!-- 2013-01-26T21:13:00 – Ydz7uRa9sKWo4jKZ05sl -->
<!-- 2013-01-27T08:39:07 – yZBIjzFJkpcyZ6T5YsQV -->
<!-- 2013-01-28T12:21:01 – Fp3JonYaYi2ecwCQSQwV -->
<!-- 2013-01-30T00:58:21 – Mu0nHMSQTNe3l39NMWHy -->
<!-- 2013-01-31T22:33:59 – 7mr3nEWjW13EHAIecrhc -->
<!-- 2013-02-02T17:24:10 – LIWg4X7eRxXoJe7XMvb9 -->
<!-- 2013-02-04T11:33:38 – kyy6M7uyyAAYOK5LDTA8 -->
<!-- 2013-02-13T06:03:48 – RDazTZc2NiuDCdkXrWyl -->
<!-- 2013-02-15T09:20:00 – r3WwjblYY2ixzwEQRG2D -->
<!-- 2013-02-19T19:21:54 – 68V1PpA9JtmwKxQPYenn -->
<!-- 2013-02-25T18:01:41 – f4ZiFrwohqVtqjMXvgWi -->
<!-- 2013-02-28T18:20:06 – kNbEMv4tybXEjP5w29CX -->
<!-- 2013-03-02T14:03:30 – WwygvAzRNxrDOUxu6yjQ -->
<!-- 2013-03-06T15:45:02 – BaVlslQ8FAU1QwtqZ9II -->
<!-- 2013-03-10T02:53:23 – 06OqQNaDL59qdyMCiHqA -->
<!-- 2013-03-13T01:31:02 – VeLqyrQUDUZ5o8aonbfc -->
<!-- 2013-03-14T01:05:22 – FVadgYZjflfG7C6IwgxC -->
<!-- 2013-03-14T20:23:21 – zxmoL9kD1SU8bF0rWuio -->
<!-- 2013-03-16T22:05:24 – F42mySJRuZNqeUHl5vpK -->
<!-- 2013-03-20T10:55:01 – UiogkLvn7KLcOQXuLMDJ -->
<!-- 2013-03-25T21:47:31 – nxgfd1caEIkigM1yzoOK -->
<!-- 2013-03-25T23:46:56 – i0mqeZrlB0FQNMq9PFtK -->
<!-- 2013-03-26T01:34:55 – fIyvjZlqTYtlJcQvlojj -->
<!-- 2013-03-27T00:56:13 – fBd46EKVC6vuqnfFvnTM -->
<!-- 2013-03-28T09:28:44 – djq5JgulMV6TIXLJ1bDn -->
<!-- 2013-03-28T21:53:10 – qR4DCtKg60s3kwqqXhFW -->
<!-- 2013-03-29T12:40:17 – uavdA6I6Ao4cHpARMy4I -->
<!-- 2013-03-30T18:31:27 – MdczbZwTiG56XGIes10e -->
<!-- 2013-04-02T16:52:54 – KcFI9H6jCCn9WmsyyrjB -->
<!-- 2013-04-06T08:19:39 – gkiy5Mgwncs5WXkk60zh -->
<!-- 2013-04-07T20:14:16 – XpSm936NxKJlA8Wqgsm7 -->
<!-- 2013-04-10T18:07:23 – f1K7sMT4fjYveLKWRxM2 -->
<!-- 2013-04-12T10:14:06 – rFtoyzvcAq9gNUUTaQs1 -->
<!-- 2013-04-16T06:45:33 – a6TGz2MqTU92a6svedEG -->
<!-- 2013-04-17T21:22:39 – jHnnFpbKTaVzKFuyN0J1 -->
<!-- 2013-04-17T21:58:03 – PR3MReZ57WwgbAeO5Zox -->
<!-- 2013-04-17T23:04:44 – PeUR3RTo5FEf0S4X3gWD -->
<!-- 2013-04-18T23:24:15 – jDQ1vmvAyrCPv2hpSEoy -->
<!-- 2013-04-24T08:01:21 – uSA1sCvWb7UpYUTw1NzH -->
<!-- 2013-04-24T11:07:48 – Ah7PqQbqJsW4HPDgkQSc -->
<!-- 2013-04-26T20:21:11 – l7QyCkoKcM0PYEiO9Wfq -->
<!-- 2013-04-28T15:26:08 – gGJMs4ICgJNaxruKAVWj -->
<!-- 2013-04-28T16:12:07 – YEMrlcD37G0Y1lcO6Pe5 -->
<!-- 2013-05-03T07:31:32 – o3WGyFPCeDP79OaTVHHe -->
<!-- 2013-05-06T06:19:57 – frwBiCyz2rvCsQKLH1I7 -->
<!-- 2013-05-06T18:14:39 – DYhZAJMvaTGWhL7EWMhA -->
<!-- 2013-05-10T12:46:54 – eqUxJIN6V1TPwOOxMa2s -->
<!-- 2013-05-14T19:33:40 – ZUvdOrW1jTWUSMUfb7Hf -->
<!-- 2013-05-20T23:52:27 – Zrpw8uicz1F8KZGj3pGM -->
<!-- 2013-05-26T09:33:45 – aLwswRKLnzamQzPwychR -->
<!-- 2013-05-26T22:49:02 – 3j6aq0GTUAk8qEBXRePu -->
<!-- 2013-05-29T06:30:45 – pllY1lmUkdYSpBVRpjUt -->
<!-- 2013-05-31T15:06:33 – GCCiFSQIlCm0ytyN8cqr -->
<!-- 2013-06-02T17:54:17 – qYbMefeCXP3GMINl9Y0W -->
<!-- 2013-06-04T13:46:15 – qeqxdGCMtRT4EeozP5rU -->
<!-- 2013-06-06T01:40:04 – wmzCIEUE0XX6Re1pa6KC -->
<!-- 2013-06-07T05:54:00 – j0BcVzYDQqvucoyGK52a -->
<!-- 2013-06-07T06:05:14 – K6k0UQv35G60xzR7Ut7Y -->
<!-- 2013-06-10T03:28:34 – uGMBwZM4SMtqlfuYEiay -->
<!-- 2013-06-15T08:20:29 – sCzcRiEiRxSZjsnoyOwq -->
<!-- 2013-06-21T10:57:40 – eoUX9pr3grfjpjwXGX4S -->
<!-- 2013-06-24T22:52:35 – nEWF3bPJJzzCxfadML64 -->
<!-- 2013-06-26T00:39:20 – So2SiiIFe3dHM0q1LsIR -->
<!-- 2013-06-29T12:59:55 – LARAViifUhQkS5Bh9hZP -->
<!-- 2013-06-30T17:10:18 – Ig8mTXpRUJ3j3Q7LbtCr -->
<!-- 2013-07-02T09:25:01 – udF98tDmxMtAfrCfsjUE -->
<!-- 2013-07-04T13:28:57 – Ww2tOy2sDmZfWFRCc9j7 -->
<!-- 2013-07-05T23:41:28 – npdqh6d0hVjZoA0nMUsr -->
<!-- 2013-07-06T09:29:41 – 0olN9pY8eJtd8C5yYVD7 -->
<!-- 2013-07-08T05:41:52 – sdxVEcx7QUC831RAoGAY -->
<!-- 2013-07-10T22:56:28 – goTZCg8IMdKJ9S51fDw4 -->
<!-- 2013-07-17T00:55:10 – gKO1jbZ0hPNlOqm0mBIn -->
<!-- 2013-07-17T08:16:57 – raKCwdXcjogqjiIJtr5y -->
<!-- 2013-07-23T17:03:38 – ncE4XIUrxv94MwmH2TwY -->
<!-- 2013-07-25T22:24:17 – ch2aLWbG6jlTjvVDUQxx -->
<!-- 2013-07-30T21:44:10 – MP5z2lGMVR5fsNRRuMp1 -->
<!-- 2013-08-01T20:58:19 – MqH8GVyAUbMsDyWSJqR9 -->
<!-- 2013-08-02T18:01:59 – ZAKlTpNGWX0QjMFqtTAj -->
<!-- 2013-08-07T10:05:13 – EO1sfTmIF0AoO8jKubWU -->
<!-- 2013-08-08T22:17:47 – teR7mX4hgDNoyE5KW0ug -->
<!-- 2013-08-12T23:05:51 – 3ZxR2BR3GvoPTEq23v47 -->
<!-- 2013-08-13T02:01:53 – eUfkbKUwFUlpJlNvaOy4 -->
<!-- 2013-08-14T06:24:16 – ZQv7hnT351aBY5MpVfCK -->
<!-- 2013-08-18T17:09:49 – nJecoibqwH06u51Dz56L -->
<!-- 2013-08-20T09:38:43 – GDc4qzeehnbP4R4Or4o6 -->
<!-- 2013-08-27T18:32:03 – ta7kTs6WRqBJmtj8QPjd -->
<!-- 2013-08-27T20:02:10 – 2dO69iv0GblQT4tCxxy0 -->
<!-- 2013-08-29T23:20:55 – 4l7dglZoIPq8owNKhetH -->
<!-- 2013-08-30T14:55:43 – 1bqz6SDgHZd05Cc3bWww -->
<!-- 2013-08-30T22:20:21 – Zzo7mWKau6Zpm1AiNFPC -->
